import logging
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

logger = logging.getLogger(__name__)


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
        - StudentProfile.class_assigned IS updated to target_class
        - Historical tracking in StudentPromotionHistory
        - Action logged in PromotionLog with class transition
        - Manual promotion always supported
        """
        with transaction.atomic():
            student = StudentProfile.objects.select_related("user").get(id=student_id)
            
            current_session = session_from or AcademicSession.objects.filter(is_current=True).first()
            next_session = session_to or AcademicSession.objects.filter(is_current=True).first()
            
            previous_class = student.class_assigned
            previous_section = student.section
            
            # Update student's current class assignment
            student.class_assigned = target_class
            student.save()
            
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
                new_value={"class_assigned": target_class, "section": target_section}
            )
            
            try:
                from notification.services.notification_service import NotificationService, Priority as NotifPriority
                from notification.services.realtime_manager import RealtimeManager
                NotificationService.create_notification(
                    notification_type="student_promoted",
                    title="Congratulations – You've Been Promoted!",
                    message=f"You have been promoted from {previous_class} to {target_class}.",
                    priority=NotifPriority.HIGH,
                    target_user_ids=[student.user.id],
                    sender=processed_by,
                    metadata={
                        "from_class": previous_class,
                        "to_class": target_class,
                        "action": action,
                        "student_id": student.id,
                    },
                    send_email=True,
                    send_realtime=True,
                )
            except Exception as e:
                logger.warning(f"Failed to send promotion notification for student {student.id}: {e}")

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
            
            try:
                from notification.services.notification_service import NotificationService, Priority as NotifPriority
                template = "promotion_repeated" if action == "repeat" else "promotion_detained"
                title = "Academic Decision – Repeat Notice" if action == "repeat" else "Important – Detention Notice"
                body = f"You have been marked as '{action}' for the current academic year."
                NotificationService.create_notification(
                    notification_type="student_promoted",
                    title=title,
                    message=body,
                    priority=NotifPriority.HIGH,
                    target_user_ids=[student.user.id],
                    sender=processed_by,
                    metadata={
                        "action": action,
                        "student_id": student.id,
                        "reason": reason,
                    },
                    send_email=True,
                    send_realtime=True,
                )
            except Exception as e:
                logger.warning(f"Failed to send {action} notification for student {student.id}: {e}")

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
            
            # Restore student's class_assigned to original from_class
            student.class_assigned = original_log.from_class
            student.section = original_log.from_section
            student.save()
            
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
            
            try:
                from notification.services.notification_service import NotificationService, Priority as NotifPriority
                NotificationService.create_notification(
                    notification_type="student_promoted",
                    title="Promotion Rolled Back",
                    message=f"Your promotion has been rolled back. Class restored from {original_log.to_class} to {original_log.from_class}.",
                    priority=NotifPriority.MEDIUM,
                    target_user_ids=[student.user.id],
                    sender=processed_by,
                    metadata={
                        "action": "rollback",
                        "student_id": student.id,
                        "original_log_id": promotion_log_id,
                        "reason": reason,
                    },
                    send_email=True,
                    send_realtime=True,
                )
            except Exception as e:
                logger.warning(f"Failed to send rollback notification for student {student.id}: {e}")

            return new_log



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
            
# Update class_assigned for all students
            students.update(class_assigned=target_class, section=data.get("target_section", ""))

            PromotionLog.objects.bulk_create(logs_to_create)
            StudentPromotionHistory.objects.bulk_create(histories_to_create)

            try:
                from notification.services.notification_service import NotificationService, Priority as NotifPriority
                from notification.services.realtime_manager import RealtimeManager
                for student in students:
                    NotificationService.create_notification(
                        notification_type="student_promoted",
                        title="Promotion Results Published",
                        message=f"You have been promoted to {target_class}.",
                        priority=NotifPriority.HIGH,
                        target_user_ids=[student.user.id],
                        sender=processed_by,
                        metadata={
                            "action": action,
                            "to_class": target_class,
                            "student_id": student.id,
                        },
                        send_email=True,
                        send_realtime=True,
                    )
                if processed_by:
                    NotificationService.create_notification(
                        notification_type="student_promoted",
                        title="Bulk Promotion Complete",
                        message=f"Successfully processed {len(students)} students to {target_class}.",
                        priority=NotifPriority.MEDIUM,
                        target_user_ids=[processed_by.id],
                        sender=processed_by,
                        metadata={"count": len(students), "target_class": target_class},
                        send_email=False,
                        send_realtime=True,
                    )
            except Exception as e:
                logger.warning(f"Failed to send bulk promotion notifications: {e}")

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