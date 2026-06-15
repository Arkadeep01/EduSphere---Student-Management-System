from django.db import transaction

from teacher.models import TeacherProfile, TeacherClassAssignment
from student.models import Notification, Subject
from administration.models.teacher import (
    ClassTeacherAssignment,
    TeacherSubjectAllocation,
)


class TeacherAdminService:
    @staticmethod
    def list_teachers():
        return TeacherProfile.objects.select_related("user", "assigned_subject").all()

    @staticmethod
    def get_teacher_detail(teacher_id):
        return TeacherProfile.objects.select_related("user", "assigned_subject").get(id=teacher_id)

    @staticmethod
    @transaction.atomic
    def create_teacher(user, data):
        profile, created = TeacherProfile.objects.update_or_create(
            user=user,
            defaults={
                "employee_id": data.get("employee_id", ""),
                "qualification": data.get("qualification", ""),
                "experience": data.get("experience", 0),
            },
        )
        if data.get("assigned_subject_id"):
            profile.assigned_subject_id = data["assigned_subject_id"]
            profile.save()
        return profile

    @staticmethod
    def send_notification(teacher_id, title, message):
        profile = TeacherProfile.objects.get(id=teacher_id)
        Notification.objects.create(
            user=profile.user,
            title=title,
            message=message,
        )

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
        obj, _ = TeacherSubjectAllocation.objects.get_or_create(
            teacher=teacher,
            subject=subject,
            academic_year=academic_year,
            defaults={"assigned_classes": assigned_classes},
        )
        return obj

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
        return TeacherSubjectAllocation.objects.select_related("teacher__user", "subject").all()

    @staticmethod
    def get_class_teacher_assignments():
        return ClassTeacherAssignment.objects.select_related("teacher__user").all()
