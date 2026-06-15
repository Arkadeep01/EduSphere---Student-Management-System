from django.db import transaction
from django.utils import timezone

from administration.models.admission import (
    AdmissionApplication,
    AdmissionVerification,
    StudentRegistrationLog,
)
from student.models import StudentProfile
from student.services import assign_core_subjects


class AdmissionAdminService:
    @staticmethod
    def list_applications(filters=None):
        qs = AdmissionApplication.objects.all()
        if filters:
            if filters.get("status"):
                qs = qs.filter(status=filters["status"])
            if filters.get("search"):
                qs = qs.filter(
                    models.Q(applicant_name__icontains=filters["search"])
                    | models.Q(applicant_email__icontains=filters["search"])
                )
        return qs.order_by("-submitted_at")

    @staticmethod
    def get_stats():
        total = AdmissionApplication.objects.count()
        return {
            "totalApplicants": total,
            "entranceAppeared": AdmissionApplication.objects.exclude(entrance_test_score__isnull=True).count(),
            "passed": AdmissionApplication.objects.filter(entrance_test_score__gte=40).count(),
            "failed": AdmissionApplication.objects.filter(
                entrance_test_score__isnull=False, entrance_test_score__lt=40
            ).count(),
            "pendingVerification": AdmissionVerification.objects.filter(status="pending").count(),
            "selected": AdmissionApplication.objects.filter(status="approved").count(),
            "rejected": AdmissionApplication.objects.filter(status="rejected").count(),
        }

    @staticmethod
    def approve_application(application_id):
        app = AdmissionApplication.objects.get(id=application_id)
        app.status = "approved"
        app.save()
        AdmissionVerification.objects.get_or_create(
            application=app, defaults={"status": "verified"}
        )
        return app

    @staticmethod
    def reject_application(application_id):
        app = AdmissionApplication.objects.get(id=application_id)
        app.status = "rejected"
        app.save()
        return app

    @staticmethod
    @transaction.atomic
    def create_student_account(application_id, user):
        app = AdmissionApplication.objects.get(id=application_id)
        profile, _ = StudentProfile.objects.update_or_create(
            user=user,
            defaults={
                "father_name": app.father_name,
                "mother_name": app.mother_name,
                "date_of_birth": app.date_of_birth,
                "address": app.address,
            },
        )
        assign_core_subjects(profile)
        StudentRegistrationLog.objects.create(
            student_profile=profile,
            admission_application=app,
            created_by=user,
        )
        return profile
