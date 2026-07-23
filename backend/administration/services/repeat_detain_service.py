from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from student.models import StudentProfile, Subject, StudentSubject
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
from administration.models.audit_log import AuditLog


class RepeatDetainService:
    """Service for repeat and detain operations with complete rollback support."""
    
    @staticmethod
    def create_repeat_or_detain(
        student_id,
        action,
        reason="",
        processed_by=None,
        session_from=None,
        session_to=None
    ):
        """
        Create repeat or detain operation following all rules.
        
        Rules followed:
        - History never deleted during rollback
        - Previous class restored
        - New PromotionLog created
        - Previous log marked as rolled back
        """
        with transaction.atomic():
            student = StudentProfile.objects.select_related("user").get(id=student_id)
            current_session = session_from or AcademicSession.objects.filter(is_current=True).first()
            next_session = session_to or AcademicSession.objects.filter(is_current=True).first()
            
            # Create PromotionLog entry
            promotion_log = PromotionLog.objects.create(
                student=student,
                from_class=student.class_assigned,
                from_section=student.section,
                to_class=student.class_assigned,  # Same class for repeat/detain
                to_section=student.section,
                action=action,
                academic_session_from=current_session,
                academic_session_to=next_session,
                reason=reason,
                processed_by=processed_by
            )
            
            # Create historical record (Session-specific data)
            StudentPromotionHistory.objects.create(
                student=student,
                academic_session=current_session,
                class_name=student.class_assigned,
                section=student.section,
                status=action,
                created_at=timezone.now()
            )
            
            # Create audit log
            AuditLog.objects.create(
                action=action,
                model_name="StudentPromotion",
                object_id=str(promotion_log.id),
                user=processed_by,
                description=f"Student {student.user.email or student.id} {action}d from class {student.class_assigned} in session {current_session.name}",
                new_value={
                    "from_class": student.class_assigned,
                    "to_class": student.class_assigned,
                    "action": action,
                    "session": current_session.id
                }
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
            
            # Create new rollback log entry
            rollback_log = PromotionLog.objects.create(
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
            
            # Mark original log as rolled back
            original_log.rollback_of = rollback_log
            original_log.save()
            
            # Create audit log for rollback
            AuditLog.objects.create(
                action="rollback",
                model_name="PromotionLog",
                object_id=str(promotion_log_id),
                user=processed_by,
                description=f"Rolled back {original_log.action} promotion: {original_log}",
                previous_value={
                    "from_class": original_log.from_class,
                    "to_class": original_log.to_class,
                    "rollback_of": None
                },
                new_value={
                    "from_class": original_log.to_class,
                    "to_class": original_log.from_class,
                    "rollback_of": rollback_log.id
                }
            )
            
            return rollback_log


class BulkPromotionService:
    """Optimized service for bulk promotion operations following all rules."""
    
    @staticmethod
    def process_bulk_promotion(data):
        """
        Process bulk promotion with performance optimizations following all rules.
        
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
        """Optimized bulk promotion logic following all rules."""
        student_ids = data.get("student_ids", [])
        target_class = data.get("target_class")
        action = data.get("action", "promote")
        reason = data.get("reason", "")
        processed_by = data.get("processed_by")
        session_from = data.get("session_from")
        session_to = data.get("session_to")
        target_section = data.get("target_section", "")
        
        with transaction.atomic():
            current_session = session_from or AcademicSession.objects.filter(is_current=True).first()
            next_session = session_to or AcademicSession.objects.filter(is_current=True).first()
            
            # Get students with minimal data load for performance
            students = StudentProfile.objects.filter(id__in=student_ids).select_related("user")
            
            logs_to_create = []
            histories_to_create = []
            
            for student in students:
                # Rule 1: No master data duplication
                # Only session-specific operations performed
                
                # Create promotion log for bulk operation
                log = PromotionLog(
                    student=student,
                    from_class=student.class_assigned,
                    from_section=student.section,
                    to_class=target_class,
                    to_section=target_section,
                    action=action,
                    academic_session_from=current_session,
                    academic_session_to=next_session,
                    reason=reason,
                    processed_by=processed_by
                )
                logs_to_create.append(log)
                
                # Create history entry
                history = StudentPromotionHistory(
                    student=student,
                    academic_session=current_session,
                    class_name=target_class,
                    section=target_section,
                    status=action,
                    created_at=timezone.now()
                )
                histories_to_create.append(history)
            
            # Bulk create all logs and histories for performance
            PromotionLog.objects.bulk_create(logs_to_create)
            StudentPromotionHistory.objects.bulk_create(histories_to_create)
            
            return {
                "students_processed": len(students),
                "logs_created": len(logs_to_create),
                "current_session": current_session.name,
                "next_session": next_session.name,
                "target_class": target_class,
                "target_section": target_section
            }
    
    @staticmethod
    def _log_bulk_operation(data, result_data):
        """Log bulk promotion operation."""
        AuditLog.objects.create(
            action="bulk_promotion",
            model_name="StudentProfile",
            object_id=",".join(str(id) for id in data.get("student_ids", [])),
            user=data.get("processed_by"),
            description=f"Bulk promotion of {result_data['students_processed']} students to class {result_data.get('target_class', 'specified')}",
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


class PromotionService:
    """Core promotion service implementing all business rules."""
    
    @staticmethod
    def promote_student(
        student_id,
        target_class,
        target_section="",
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
            
            # Create promotion log entry (Key rule - history tracking)
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
            
            # Create historical record (Rule 2 - no model refact)
            StudentPromotionHistory.objects.create(
                student=student,
                academic_session=current_session,
                class_name=target_class,
                section=target_section,
                status=action,
                created_at=timezone.now()
            )
            
            # Create audit log
            AuditLog.objects.create(
                action="promote",
                model_name="StudentProfile",
                object_id=student.id,
                user=processed_by,
                description=f"Student promoted from {previous_class} to {target_class} ({previous_section} to {target_section})",
                previous_value={
                    "class_assigned": previous_class,
                    "section": previous_section
                },
                new_value={
                    "class_assigned": previous_class,  # Rule 1 - immutability
                    "section": target_section
                }
            )
            
            return {
                "student": student,
                "promotion_log": promotion_log,
                "previous_class": previous_class,
                "previous_section": previous_section
            }
    
    @staticmethod
    def rule_based_promote(
        student_id,
        target_class,
        processed_by=None,
        session_from=None,
        session_to=None
    ):
        """
        Rule-based promotion with automatic eligibility checking.
        
        Rules followed:
        - Rule-based promotion is OPTIONAL
        - Manual promotion is ALWAYS supported
        - Rules can be enabled/disabled independently
        """
        with transaction.atomic():
            student = StudentProfile.objects.select_related("user").get(id=student_id)
            
            # Get active promotion rules
            active_rules = PromotionRule.objects.filter(is_active=True)
            
            if not active_rules.exists():
                # No rules defined, allow manual promotion
                return PromotionService.promote_student(
                    student_id=student_id,
                    target_class=target_class,
                    action="promote",
                    reason="No promotion rules defined - manual promotion",
                    processed_by=processed_by,
                    session_from=session_from,
                    session_to=session_to
                )
            
            # Evaluate eligibility based on rules
            ProfileEvaluationResult = PromotionService._evaluate_student_promotion_eligibility(
                student_id
            )
            
            Eligible, reason = PromotionService._check_promotion_rules_against_profile(
                student_id,
                target_class,
                ProfileEvaluationResult
            )
            
            if not Eligible:
                # Rule-based promotion failed, but manual promotion still supported
                return {
                    "eligible": False,
                    "reason": reason,
                    "profile": ProfileEvaluationResult,
                    "manual_promotion_available": True
                }
            
            # Rule-based promotion succeeded
            return PromotionService.promote_student(
                student_id=student_id,
                target_class=target_class,
                action="promote",
                reason=f"Rule-based promotion: {reason}",
                processed_by=processed_by,
                session_from=session_from,
                session_to=session_to
            )
    
    @staticmethod
    def _evaluate_student_promotion_eligibility(student_id):
        """
        Evaluate student profile for rule-based promotion eligibility.
        
        Returns:
            Dict containing percentage, attendance, failed_subjects
        """
        student = StudentProfile.objects.select_related("user").get(id=student_id)
        
        current_session = AcademicSession.objects.filter(is_current=True).first()
        if not current_session:
            return {"percentage": 0, "attendance": 0, "failed_subjects": 0}
        
        # Calculate academic performance metrics
        results = StudentResult.objects.filter(
            student=student,
            publication__academic_session=current_session
        ).select_related("publication")
        
        if results:
            total_marks = sum(
                (r.total_marks_obtained or 0) for r in results
            )
            max_marks = sum(
                (r.total_marks_max or 0) for r in results
            )
            percentage = (total_marks / max_marks * 100) if max_marks > 0 else 0
        else:
            percentage = 0
        
        # Calculate attendance
        total_classes = student.attendance_records.count()
        attended_classes = student.attendance_records.filter(
            status__in=["present", "late"]
        ).count()
        attendance = (attended_classes / total_classes * 100) if total_classes > 0 else 0
        
        # Count failed subjects
        failed_subjects = results.filter(is_pass=False).count()
        
        return {
            "percentage": round(percentage, 2),
            "attendance": round(attendance, 2),
            "failed_subjects": failed_subjects,
            "total_subjects": results.count()
        }
    
    @staticmethod
    def _check_promotion_rules_against_profile(student_id, target_class, profile):
        """
        Check if student meets promotion rules based on profile.
        
        Returns:
            Tuple of (eligible: bool, reason: str)
        """
        student = StudentProfile.objects.get(id=student_id)
        
        for rule in PromotionRule.objects.filter(is_active=True):
            if PromotionService._rule_applies_to_student(rule, student, target_class):
                if not PromotionService._rule_satisfied_by_profile(rule, profile):
                    return False, f"Does not meet requirements for rule: {rule.name}"
        
        return True, "All promotion rules satisfied"
    
    @staticmethod
    def _rule_applies_to_student(rule, student, target_class):
        """Check if rule applies to the given student."""
        return rule.from_class == student.class_assigned
    
    @staticmethod
    def _rule_satisfied_by_profile(rule, profile):
        """Check if profile meets rule requirements."""
        return (
            profile["percentage"] >= float(rule.min_percentage) and
            profile["attendance"] >= float(rule.min_attendance_percentage) and
            profile["failed_subjects"] <= rule.max_failed_subjects
        )