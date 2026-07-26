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

from .promotion_service import PromotionService, RepeatDetainService, BulkPromotionService


class SessionRolloverService:
    """Service for academic session rollover operations following all business rules."""
    
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
        - Only carry-forward specific data items
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
                copy_options=copy_options or ["subjects", "teachers", "timetables", "fee_structures", "classes"],
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
                    description=f"Session rollover from {from_session} to {to_session}",
                    new_value={
                        "from_session": from_session.name,
                        "to_session": to_session.name,
                        "status": "completed"
                    }
                )
                
            except Exception as e:
                rollover.status = "failed"
                rollover.error_log = [str(e)]
                rollover.save()
                raise
            
            return rollover
    
    @staticmethod
    def _process_rollover(rollover):
        """Process session rollover operations following all rules."""
        from_session = rollover.from_session
        to_session = rollover.to_session
        
        options = set(rollover.copy_options or [])
        
        if "all" in options:
            SessionRolloverService._carry_forward_subjects(from_session, to_session)
            SessionRolloverService._carry_forward_teacher_allocations(from_session, to_session)
            SessionRolloverService._carry_forward_timetables(from_session, to_session)
            SessionRolloverService._carry_forward_fee_structures(from_session, to_session)
            SessionRolloverService._carry_forward_class_structure(from_session, to_session)
            return
        
        if "subjects" in options:
            SessionRolloverService._carry_forward_subjects(from_session, to_session)
        if "teachers" in options:
            SessionRolloverService._carry_forward_teacher_allocations(from_session, to_session)
        if "timetables" in options:
            SessionRolloverService._carry_forward_timetables(from_session, to_session)
        if "fee_structures" in options:
            SessionRolloverService._carry_forward_fee_structures(from_session, to_session)
        if "classes" in options:
            SessionRolloverService._carry_forward_class_structure(from_session, to_session)
    
    @staticmethod
    def _carry_forward_subjects(from_session, to_session):
        """Carry forward student subject allocations (not master Subject records)."""
        allocations = StudentSubject.objects.filter(academic_session=from_session)
        for alloc in allocations:
            StudentSubject.objects.get_or_create(
                student=alloc.student,
                subject=alloc.subject,
                academic_session=to_session,
                defaults={
                    "status": "not_selected",
                    "assigned_by_admin": False,
                }
            )
    
    @staticmethod
    def _carry_forward_teacher_allocations(from_session, to_session):
        """Carry forward teacher allocations (session-specific data) as drafts."""
        allocations = TeacherSubjectAllocation.objects.filter(
            academic_year=from_session.name, is_active=True
        )
        
        for allocation in allocations:
            TeacherSubjectAllocation.objects.create(
                teacher=allocation.teacher,
                subject=allocation.subject,
                assigned_classes=allocation.assigned_classes,
                academic_year=to_session.name,
                academic_session=to_session,
                is_primary=allocation.is_primary,
                draft=True,
            )
    
    @staticmethod
    def confirm_draft_allocations(to_session_id, confirmed_by):
        """Confirm all draft teacher allocations for a session."""
        updated = TeacherSubjectAllocation.objects.filter(
            academic_session_id=to_session_id, draft=True
        ).update(draft=False)
        AuditLog.objects.create(
            action="confirm_draft_allocations",
            model_name="TeacherSubjectAllocation",
            object_id=str(to_session_id),
            user=confirmed_by,
            description=f"Confirmed draft teacher allocations for session {to_session_id}",
            new_value={"updated_count": updated},
        )
        return updated
    
    @staticmethod
    def _carry_forward_timetables(from_session, to_session):
        """Carry forward timetable entries by creating fresh records."""
        from student.models import Timetable
        from student.models import StudentProfile
        
        for student in StudentProfile.objects.exclude(class_assigned=""):
            entries = Timetable.objects.filter(student=student)
            for entry in entries:
                Timetable.objects.create(
                    student=entry.student,
                    day_of_week=entry.day_of_week,
                    start_time=entry.start_time,
                    end_time=entry.end_time,
                    subject=entry.subject,
                    room=entry.room,
                    is_library_session=entry.is_library_session,
                )
    
    @staticmethod
    def _carry_forward_fee_structures(from_session, to_session):
        """Carry forward fee configurations."""
        fee_structures = FeeStructure.objects.filter(academic_session=from_session.name)
        
        for fs in fee_structures:
            FeeStructure.objects.create(
                class_name=fs.class_name,
                academic_session=to_session.name,
                late_fine_per_day=fs.late_fine_per_day,
                gst_enabled=fs.gst_enabled,
                is_active=fs.is_active,
            )
    
    @staticmethod
    def _carry_forward_class_structure(from_session, to_session):
        """Carry forward class structure (session-specific)."""
        classes = Class.objects.filter(academic_session=from_session)
        
        for cls in classes:
            Class.objects.create(
                name=cls.name,
                academic_session=to_session,
                section=cls.section,
                capacity=cls.capacity,
                effective_from=to_session.start_date,
            )
        
        # Also carry forward class teacher assignments
        class_teachers = ClassTeacherAssignment.objects.filter(
            class_name__in=[c.name for c in classes]
        )
        
        for assignment in class_teachers:
            ClassTeacherAssignment.objects.create(
                teacher=assignment.teacher,
                class_name=assignment.class_name,
                academic_year=to_session.name,
                assigned_at=timezone.now()
            )
    
    @staticmethod
    def confirm_draft_allocations(session_id, confirmed_by):
        qs = TeacherSubjectAllocation.objects.filter(draft=True)
        if session_id:
            qs = qs.filter(academic_session_id=session_id)
        count = 0
        for alloc in qs:
            alloc.draft = False
            alloc.save(update_fields=["draft"])
            count += 1
        return count

    @staticmethod
    def mark_session_as_archived(session_id):
        """Mark an archived session as read-only."""
        session = AcademicSession.objects.get(id=session_id)
        session.is_archived = True
        session.save()
        
        AuditLog.objects.create(
            action="archive",
            model_name="AcademicSession",
            object_id=str(session_id),
            user=None,
            description=f"Session {session.name} marked as archived (read-only)",
            new_value={"is_archived": True}
        )
