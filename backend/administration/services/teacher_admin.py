from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

from teacher.models import TeacherProfile, TeacherClassAssignment
from student.models import Notification, Subject
from administration.models.teacher import (
    ClassTeacherAssignment,
    TeacherSubjectAllocation,
)
from administration.models import AcademicSession


class TeacherAdminService:
    @staticmethod
    def list_teachers():
        return TeacherProfile.objects.select_related("user", "assigned_subject").prefetch_related("subject_allocations").all()

    @staticmethod
    def get_teacher_detail(teacher_id):
        return TeacherProfile.objects.select_related("user", "assigned_subject").prefetch_related("subject_allocations").get(id=teacher_id)

    @staticmethod
    def send_notification(teacher_id, title, message):
        try:
            profile = TeacherProfile.objects.get(id=teacher_id)
        except TeacherProfile.DoesNotExist:
            return None
        Notification.objects.create(
            user=profile.user,
            title=title,
            message=message,
        )
        return True

    @staticmethod
    def assign_class_teacher(teacher_id, class_name, academic_year):
        teacher = TeacherProfile.objects.get(id=teacher_id)
        obj, _ = ClassTeacherAssignment.objects.get_or_create(
            teacher=teacher,
            class_name=class_name,
            academic_year=academic_year,
        )
        return obj

    @staticmethod
    def allocate_subject(teacher_id, subject_id, assigned_classes, academic_year):
        teacher = TeacherProfile.objects.get(id=teacher_id)
        subject = Subject.objects.get(id=subject_id)

        # 1. Teacher specialization check
        if teacher.assigned_subject_id != subject_id:
            is_primary = TeacherSubjectAllocation.objects.filter(
                teacher=teacher, subject_id=subject_id, is_primary=True
            ).exists()
            if not is_primary:
                raise ValidationError(
                    f"Subject '{subject.name}' does not match teacher's assigned subject "
                    f"'{teacher.assigned_subject}' and no primary allocation exists."
                )

        # 2. Active teacher check
        if teacher.status != "active":
            raise ValidationError("Cannot allocate subject to a non-active teacher.")

        # 3. Subject active check
        if not subject.is_active:
            raise ValidationError(f"Subject '{subject.name}' is not active.")

        # 4. One-teacher-per-class-subject validation
        academic_session = AcademicSession.objects.filter(name=academic_year).first()
        conflicting_classes = []
        if academic_session:
            existing = TeacherSubjectAllocation.objects.filter(
                subject=subject,
                academic_session=academic_session,
                is_active=True,
            ).exclude(teacher=teacher)
            for ea in existing:
                for cls in assigned_classes:
                    if cls in ea.assigned_classes:
                        conflicting_classes.append(cls)
        if conflicting_classes:
            raise ValidationError(
                f"The following classes already have an active teacher for "
                f"'{subject.name}': {', '.join(set(conflicting_classes))}"
            )

        obj, _ = TeacherSubjectAllocation.objects.get_or_create(
            teacher=teacher,
            subject=subject,
            academic_year=academic_year,
            defaults={"assigned_classes": assigned_classes},
        )
        return obj

    @staticmethod
    def deallocate_subject(allocation_id, reason, deallocated_by, effective_date=None):
        allocation = TeacherSubjectAllocation.objects.get(id=allocation_id)
        allocation.is_active = False
        allocation.deallocation_reason = reason
        allocation.deallocation_date = effective_date or timezone.now().date()
        allocation.deallocated_by = deallocated_by
        allocation.save()
        Notification.objects.create(
            user=allocation.teacher.user,
            title="Subject Allocation Removed",
            message=f"Your allocation for {allocation.subject.name} has been removed. Reason: {reason}",
            notification_type="general",
        )
        return allocation

    @staticmethod
    def assign_class(teacher_id, class_name):
        teacher = TeacherProfile.objects.get(id=teacher_id)
        obj, _ = TeacherClassAssignment.objects.get_or_create(
            teacher=teacher,
            class_name=class_name,
        )
        return obj

    @staticmethod
    def get_allocations():
        return TeacherSubjectAllocation.objects.select_related("teacher__user", "subject").filter(is_active=True).all()



    @staticmethod
    def get_class_teacher_assignments():
        return ClassTeacherAssignment.objects.select_related("teacher__user").all()
