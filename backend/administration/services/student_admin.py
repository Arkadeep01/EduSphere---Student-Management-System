from django.db import transaction, models

from student.models import StudentProfile, StudentSubject, Subject, Notification
from student.services import (
    create_student_profile,
    assign_core_subjects,
    approve_student_subjects,
    reject_student_subjects,
    admin_assign_subjects,
)
from administration.models.subject_request import SubjectRequestControl
from teacher.models import TeacherProfile, TeacherClassAssignment


class StudentAdminService:
    @staticmethod
    def list_students(filters=None):
        qs = StudentProfile.objects.select_related("user").all()
        if filters:
            if filters.get("class_name"):
                qs = qs.filter(class_assigned__startswith=filters["class_name"])
            if filters.get("search"):
                search = filters["search"]
                qs = qs.filter(
                    models.Q(user__email__icontains=search)
                    | models.Q(user__first_name__icontains=search)
                    | models.Q(roll_number__icontains=search)
                )
        return qs

    @staticmethod
    def get_student_detail(student_id):
        return StudentProfile.objects.select_related("user").get(id=student_id)

    @staticmethod
    def create_student(user, data):
        profile = create_student_profile(user, data)
        assign_core_subjects(profile)
        return profile

    @staticmethod
    def update_student(student_id, data):
        profile = StudentProfile.objects.get(id=student_id)
        for key, value in data.items():
            setattr(profile, key, value)
        profile.save()
        return profile

    @staticmethod
    def approve_subject_requests(student_id, subject_ids):
        profile = StudentProfile.objects.get(id=student_id)
        approved = approve_student_subjects(profile, subject_ids)
        # Notify student
        subjects = Subject.objects.filter(id__in=subject_ids)
        subject_names = ", ".join(subjects.values_list("name", flat=True))
        Notification.objects.create(
            user=profile.user,
            title="Subject Enrollment Approved",
            message=f"Your request for subject(s): {subject_names} has been approved.",
            notification_type="general",
        )
        # Notify teachers
        for subject in subjects:
            _notify_teachers_for_subject(subject, profile)
        return approved

    @staticmethod
    def reject_subject_requests(student_id, subject_ids, reason=""):
        profile = StudentProfile.objects.get(id=student_id)
        reject_student_subjects(profile, subject_ids)
        # Notify student
        subjects = Subject.objects.filter(id__in=subject_ids)
        subject_names = ", ".join(subjects.values_list("name", flat=True))
        msg = f"Your request for subject(s): {subject_names} has been rejected."
        if reason:
            msg += f" Reason: {reason}"
        Notification.objects.create(
            user=profile.user,
            title="Subject Request Rejected",
            message=msg,
            notification_type="general",
        )

    @staticmethod
    def assign_subjects(student_id, subject_ids):
        profile = StudentProfile.objects.get(id=student_id)
        admin_assign_subjects(profile, subject_ids)

    @staticmethod
    def get_subject_requests(student_id=None):
        qs = StudentSubject.objects.filter(status="pending").select_related(
            "student__user", "subject"
        )
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

    @staticmethod
    def send_notification(student_id, title, message):
        profile = StudentProfile.objects.get(id=student_id)
        Notification.objects.create(
            user=profile.user,
            title=title,
            message=message,
        )

    @staticmethod
    def get_notifications(student_id):
        profile = StudentProfile.objects.get(id=student_id)
        return Notification.objects.filter(user=profile.user)

    @staticmethod
    def get_student_documents(student_id):
        from student.models import AdmissionDocument
        return AdmissionDocument.objects.filter(student_id=student_id)

    @staticmethod
    def subject_requests_enabled():
        obj, _ = SubjectRequestControl.objects.get_or_create(pk=1)
        return obj.enabled


def _notify_teachers_for_subject(subject, student_profile):
    """Notify teachers assigned to the subject about new student enrollment."""
    from administration.models.teacher import TeacherSubjectAllocation
    allocations = TeacherSubjectAllocation.objects.filter(subject=subject)
    class_name = student_profile.class_assigned
    for allocation in allocations:
        if class_name in allocation.assigned_classes:
            Notification.objects.create(
                user=allocation.teacher.user,
                title="New Student Enrolled",
                message=f"Student {student_profile.user.get_full_name() or student_profile.user.email} has been enrolled in {subject.name} ({class_name}).",
                notification_type="general",
            )
