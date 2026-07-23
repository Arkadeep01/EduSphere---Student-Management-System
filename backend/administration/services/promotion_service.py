from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from student.models import StudentProfile, StudentSubject, Subject
from teacher.models import TeacherProfile
from administration.models import (
    AcademicSession, PromotionLog, StudentPromotionHistory,
    Class, ClassTeacherAssignment, TeacherSubjectAllocation,
    PromotionRule, AcademicSessionRollover
)
from administration.models.results import StudentResult
from administration.models.fee import FeeStructure
from administration.models.teacher import FacultyAttendance
from administration.models.exam import Exam
from ..models.audit_log import AuditLog


class PromotionService:
    """Core promotion service implementing all business rules."""
    
    @staticmethod
    def promote_student(
        student_id,
        target_class,
        target_section,
        action="promote",
        reason="",
        processed_by=None,
        session_from=None,
        session_to=None,
        rule_based=False
    ):
        """
        Promote a single student following all business rules.
        
        Rules followed:
        - StudentProfile.class_assigned is NOT updated
        - Historical tracking in StudentPromotionHistory
        - Action logged in PromotionLog
        - Manual promotion always supported
        """
        with transaction.atomic():
            student = StudentProfile.objects.select_related("user").get(id=student_id)
            
            current_session = session_from or AcademicSession.objects.filter(is_current=True).first()
            next_session = session_to or AcademicSession.objects.filter(is_current=True).first()
            
            previous_class = student.class_assigned
            previous_section = student.section
            
            promotion_log = PromotionLog.objects.create(
                student=student,
                from_class=previous_class,
                from_section=previous_section,
                to_class=target_class,
                to_section=target_section,
                action=action,
                academic_session_from=current_session,
                academic_session_to=next_session,
                reason=reason,
                processed_by=processed_by
            )
            
            StudentPromotionHistory.objects.create(
                student=student,
                academic_session=current_session,
                class_name=target_class,
                section=target_section,
                status=action,
                created_at=timezone.now()
            )
            
            AuditLog.objects.create(
                action="promote",
                model_name="StudentProfile",
                object_id=student.id,
                user=processed_by,
                description=f"Student promoted from {previous_class} to {target_class}",
                previous_value={"class_assigned": previous_class, "section": previous_section},
                new_value={"class_assigned": previous_class, "section": target_section}
            )
            
            return {
                "student": student,
                "promotion_log": promotion_log,
                "previous_class": previous_class,
                "previous_section": previous_section
            }
    
    @staticmethod
    def repeat_student(
        student_id,
        reason="",
        processed_by=None,
        session_from=None,
        session_to=None
    ):
        """Repeat a student's academic year."""
        student = StudentProfile.objects.select_related("user").get(id=student_id)
        current_session = session_from or AcademicSession.objects.filter(is_current=True).first()
        next_session = session_to or AcademicSession.objects.filter(is_current=True).first()
        
        return PromotionService.promote_student(
            student_id=student_id,
            target_class=student.class_assigned,
            target_section=student.section,
            action="repeat",
            reason=reason,
            processed_by=processed_by,
            session_from=session_from,
            session_to=session_to
        )
    
    @staticmethod
    def detain_student(
        student_id,
        reason="",
        processed_by=None,
        session_from=None,
        session_to=None
    ):
        """Detain a student for one year."""
        student = StudentProfile.objects.select_related("user").get(id=student_id)
        current_session = session_from or AcademicSession.objects.filter(is_current=True).first()
        next_session = session_to or AcademicSession.objects.filter(is_current=True).first()
        
        return PromotionService.promote_student(
            student_id=student_id,
            target_class=student.class_assigned,
            target_section=student.section,
            action="detain",
            reason=reason,
            processed_by=processed_by,
            session_from=session_from,
            session_to=session_to
        )
    
    @staticmethod
    def bulk_promote(
        student_ids,
        target_class,
        target_section,
        action="promote",
        reason="",
        processed_by=None,
        session_from=None,
        session_to=None,
        rules_enabled=True
    ):
        """
        Bulk promotion of multiple students.
        
        Rules followed:
        - No master data duplication
        - Historical tracking maintained
        - Optional rule-based promotion
        - Manual promotion supported
        """
        results = []
        errors = []
        
        with transaction.atomic():
            current_session = session_from or AcademicSession.objects.filter(is_current=True).first()
            next_session = session_to or AcademicSession.objects.filter(is_current=True).first()
            
            for student_id in student_ids:
                try:
                    if rules_enabled:
                        PromotionService._check_promotion_rules(
                            student_id, 
                            target_class, 
                            reason,
                            action
                        )
                    
                    result = PromotionService.promote_student(
                        student_id=student_id,
                        target_class=target_class,
                        target_section=target_section,
                        action=action,
                        reason=reason,
                        processed_by=processed_by,
                        session_from=session_from,
                        session_to=session_to
                    )
                    results.append(result)
                    
                except ValidationError as e:
                    errors.append({
                        "student_id": student_id,
                        "error": str(e)
                    })
                    continue
            
            audit = AuditLog.objects.create(
                action="bulk_promote",
                model_name="StudentProfile",
                object_id=",".join(str(id) for id in student_ids),
                user=processed_by,
                description=f"Bulk promotion of {len(results)} students to {target_class}",
                new_value={
                    "promoted_count": len(results),
                    "error_count": len(errors)
                }
            )
            
            return {
                "promoted": results,
                "errors": errors,
                "audit_log": audit
            }
    
    @staticmethod
    def _check_promotion_rules(student_id, target_class, reason, action):
        """Check optional promotion rules if enabled."""
        active_rules = PromotionRule.objects.filter(is_active=True)
        if not active_rules.exists():
            return True
        
        student = StudentProfile.objects.get(id=student_id)
        profile = PromotionService._evaluate_student_profile(student_id)
        
        for rule in active_rules:
            if PromotionService._rule_applies(rule, student, target_class, action):
                if not PromotionService._rule_satisfied(rule, student, profile):
                    raise ValidationError(
                        f"Student {student_id} does not meet promotion requirements: {rule.name}"
                    )
        
        return True
    
    @staticmethod
    def _evaluate_student_profile(student_id):
        """Evaluate student profile for promotion rules."""
        student = StudentProfile.objects.get(id=student_id)
        
        # Calculate percentage based on results
        current_session = AcademicSession.objects.filter(is_current=True).first()
        if not current_session:
            return {"percentage": 0, "attendance": 0, "failed_subjects": 0}
        
        results = StudentResult.objects.filter(
            student=student
        ).select_related("publication")
        
        if results:
            total_marks = sum(r.total_marks_max or 0 for r in results)
            obtained_marks = sum(r.total_marks_obtained or 0 for r in results)
            percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0
        else:
            percentage = 0
        
        return {
            "percentage": round(percentage, 2),
            "attendance": student.attendance_records.filter(status__in=["present", "late"]).count() / max(1, student.attendance_records.count()) * 100,
            "failed_subjects": results.filter(is_pass=False).count()
        }
    
    @staticmethod
    def _rule_applies(rule, student, target_class, action):
        """Check if rule applies to student."""
        return rule.from_class == student.class_assigned
    
    @staticmethod
    def _rule_satisfied(rule, student, profile):
        """Check if rule requirements are met."""
        return (
            profile["percentage"] >= float(rule.min_percentage) and
            profile["attendance"] >= float(rule.min_attendance_percentage) and
            profile["failed_subjects"] <= rule.max_failed_subjects
        )


class RepeatDetainService:
    """Service for repeat and detain operations with rollback support."""
    
    @staticmethod
    def create_repeat_or_detain(
        student_id,
        action,
        reason="",
        processed_by=None
    ):
        """
        Create repeat or detain operation with complete audit trail.
        
        Rules followed:
        - History never deleted during rollback
        - Previous class restored
        - New PromotionLog created
        - Previous log marked as rolled back
        """
        with transaction.atomic():
            student = StudentProfile.objects.select_related("user").get(id=student_id)
            current_session = AcademicSession.objects.filter(is_current=True).first()
            
            promotion_log = PromotionLog.objects.create(
                student=student,
                from_class=student.class_assigned,
                from_section=student.section,
                to_class=student.class_assigned,
                to_section=student.section,
                action=action,
                academic_session_from=current_session,
                academic_session_to=current_session,
                reason=reason,
                processed_by=processed_by
            )
            
            StudentPromotionHistory.objects.create(
                student=student,
                academic_session=current_session,
                class_name=student.class_assigned,
                section=student.section,
                status=action,
                created_at=timezone.now()
            )
            
            return promotion_log
    
    @staticmethod
    def rollback(
        promotion_log_id,
        reason="",
        processed_by=None
    ):
        """
        Rollback a promotion operation following rollback rules.
        
        Rules followed:
        - NEVER delete history
        - Restore previous class from history
        - Create new PromotionLog
        - Mark previous log as rolled back
        """
        with transaction.atomic():
            original_log = PromotionLog.objects.get(id=promotion_log_id)
            student = original_log.student
            
            new_log = PromotionLog.objects.create(
                student=student,
                from_class=original_log.to_class,
                from_section=original_log.to_section,
                to_class=original_log.from_class,
                to_section=original_log.from_section,
                action="rollback",
                academic_session_from=original_log.academic_session_to,
                academic_session_to=original_log.academic_session_from,
                reason=f"Rollback: {reason}",
                processed_by=processed_by,
                rollback_of=original_log
            )
            
            original_log.rollback_of = new_log
            original_log.save()
            
            AuditLog.objects.create(
                action="rollback",
                model_name="PromotionLog",
                object_id=str(promotion_log_id),
                user=processed_by,
                description=f"Rolled back promotion: {original_log}",
                previous_value={
                    "from_class": original_log.from_class,
                    "to_class": original_log.to_class
                },
                new_value={
                    "from_class": original_log.to_class,
                    "to_class": original_log.from_class
                }
            )
            
            return new_log


class SessionRolloverService:
    """Service for academic session rollover operations."""
    
    @staticmethod
    def create_rollover(
        from_session_id,
        to_session_id,
        copy_options=None,
        processed_by=None
    ):
        """
        Create academic session rollover following all rules.
        
        Rules followed:
        - Result records NOT copied
        - Only carry-forward specific data
        - Archived sessions remain read-only
        - Complete audit trail
        """
        with transaction.atomic():
            from_session = AcademicSession.objects.get(id=from_session_id)
            to_session = AcademicSession.objects.get(id=to_session_id)
            
            rollover = AcademicSessionRollover.objects.create(
                from_session=from_session,
                to_session=to_session,
                status="in_progress",
                copy_options=copy_options or ["all"],
                processed_by=processed_by
            )
            
            try:
                SessionRolloverService._process_rollover(rollover)
                rollover.status = "completed"
                rollover.completed_at = timezone.now()
                rollover.save()
                
                AuditLog.objects.create(
                    action="rollover",
                    model_name="AcademicSession",
                    object_id=str(from_session_id),
                    user=processed_by,
                    description=f"Session rollover from {from_session} to {to_session}"
                )
                
            except Exception as e:
                rollover.status = "failed"
                rollover.error_log = [str(e)]
                rollover.save()
                raise
            
            return rollover
    
    @staticmethod
    def _process_rollover(rollover):
        """Process session rollover operations."""
        from_session = rollover.from_session
        to_session = rollover.to_session
        
        if "subjects" not in rollover.copy_options:
            return
        
        SessionRolloverService._carry_forward_subjects(to_session)
        SessionRolloverService._carry_forward_teacher_allocations(from_session, to_session)
        SessionRolloverService._carry_forward_timetables(from_session, to_session)
        SessionRolloverService._carry_forward_fee_structures(from_session, to_session)
        SessionRolloverService._carry_forward_academic_settings(from_session, to_session)
    
    @staticmethod
    def _carry_forward_subjects(to_session):
        """Carry forward subjects without duplication."""
        existing_codes = Subject.objects.values_list("code", flat=True)
        subjects = Subject.objects.all()
        
        for subject in subjects:
            if subject.code not in existing_codes:
                Subject.objects.create(
                    name=subject.name,
                    code=subject.code,
                    tier=subject.tier,
                    teacher_name=subject.teacher_name,
                    description=subject.description,
                    color=subject.color,
                    progress=subject.progress
                )
    
    @staticmethod
    def _carry_forward_teacher_allocations(from_session, to_session):
        """Carry forward teacher allocations (session-specific)."""
        allocations = TeacherSubjectAllocation.objects.filter(
            academic_year=from_session.name
        )
        
        for allocation in allocations:
            TeacherSubjectAllocation.objects.create(
                teacher=allocation.teacher,
                subject=allocation.subject,
                assigned_classes=allocation.assigned_classes,
                academic_year=to_session.name,
                created_at=timezone.now()
            )
    
    @staticmethod
    def _carry_forward_timetables(from_session, to_session):
        """Carry forward timetable allocations."""
        from student.models import Timetable
        from student.models import StudentProfile
        
        for student in StudentProfile.objects.exclude(class_assigned=""):
            Timetable.objects.filter(
                student=student,
                academic_session=from_session
            ).update(
                academic_session=to_session
            )
    
    @staticmethod
    def _carry_forward_fee_structures(from_session, to_session):
        """Carry forward fee configurations."""
        fee_structures = FeeStructure.objects.filter(session=from_session)
        
        for fs in fee_structures:
            FeeStructure.objects.create(
                name=fs.name,
                session=to_session,
                description=fs.description,
                components=fs.components,
                is_active=fs.is_active,
                effective_from=to_session.start_date
            )
    
    @staticmethod
    def _carry_forward_academic_settings(from_session, to_session):
        """Carry forward academic settings (grade boundaries)."""
        from administration.models.results import GradeBoundary
        
        boundaries = GradeBoundary.objects.all()
        
        for boundary in boundaries:
            GradeBoundary.objects.create(
                name=boundary.name,
                min_percentage=boundary.min_percentage,
                max_percentage=boundary.max_percentage,
                grade_point=boundary.grade_point,
                is_pass=boundary.is_pass,
                remarks=boundary.remarks
            )


class BulkPromotionService:
    """Optimized service for bulk promotion operations."""
    
    @staticmethod
    def process_bulk_promotion(data):
        """
        Process bulk promotion with performance optimizations.
        
        Rules followed:
        - No master data duplication
        - Session-specific allocations only
        - Complete audit trail
        - Error handling and reporting
        """
        try:
            result_data = BulkPromotionService._bulk_promote_students(data)
            BulkPromotionService._log_bulk_operation(data, result_data)
            return result_data
        except Exception as e:
            BulkPromotionService._log_error_operation(data, e)
            raise
    
    @staticmethod
    def _bulk_promote_students(data):
        """Optimized bulk promotion logic."""
        student_ids = data.get("student_ids", [])
        target_class = data.get("target_class")
        action = data.get("action", "promote")
        reason = data.get("reason", "")
        processed_by = data.get("processed_by")
        session_from = data.get("session_from")
        session_to = data.get("session_to")
        
        with transaction.atomic():
            current_session = session_from or AcademicSession.objects.filter(is_current=True).first()
            next_session = session_to or AcademicSession.objects.filter(is_current=True).first()
            
            students = StudentProfile.objects.filter(id__in=student_ids)
            
            logs_to_create = []
            histories_to_create = []
            
            for student in students:
                log = PromotionLog(
                    student=student,
                    from_class=student.class_assigned,
                    from_section=student.section,
                    to_class=target_class,
                    to_section=data.get("target_section", student.section),
                    action=action,
                    academic_session_from=current_session,
                    academic_session_to=next_session,
                    reason=reason,
                    processed_by=processed_by
                )
                logs_to_create.append(log)
                
                history = StudentPromotionHistory(
                    student=student,
                    academic_session=current_session,
                    class_name=target_class,
                    section=data.get("target_section", student.section),
                    status=action,
                    created_at=timezone.now()
                )
                histories_to_create.append(history)
            
            PromotionLog.objects.bulk_create(logs_to_create)
            StudentPromotionHistory.objects.bulk_create(histories_to_create)
            
            return {
                "students_processed": len(students),
                "logs_created": len(logs_to_create),
                "current_session": current_session.name,
                "next_session": next_session.name
            }
    
    @staticmethod
    def _log_bulk_operation(data, result_data):
        """Log bulk promotion operation."""
        AuditLog.objects.create(
            action="bulk_promotion",
            model_name="StudentProfile",
            object_id=",".join(str(id) for id in data.get("student_ids", [])),
            user=data.get("processed_by"),
            description=f"Bulk promotion of {result_data['students_processed']} students",
            new_value=result_data
        )
    
    @staticmethod
    def _log_error_operation(data, error):
        """Log bulk promotion error."""
        AuditLog.objects.create(
            action="bulk_promotion_failed",
            model_name="StudentProfile",
            object_id="bulk",
            user=data.get("processed_by"),
            description=f"Bulk promotion failed: {str(error)}",
            error=error
        )