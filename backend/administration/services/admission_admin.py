from django.db import transaction, models
from django.utils import timezone
import secrets

from administration.models.admission import (
    AdmissionApplication,
    AdmissionVerification,
    StudentRegistrationLog,
)
from student.models import StudentProfile
from student.services import assign_core_subjects
from authentication.models import CustomUser
from notification.services.email_service import EmailService


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
    def create_student_account(application_id, admin_user):
        app = AdmissionApplication.objects.get(id=application_id)
        email = app.applicant_email.strip().lower()

        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0] + str(secrets.randbelow(9000) + 1000),
                "first_name": app.applicant_name.split(" ")[0] if app.applicant_name else "",
                "last_name": " ".join(app.applicant_name.split(" ")[1:]) if app.applicant_name and " " in app.applicant_name else "",
                "mobile": app.phone_number,
                "role": "student",
                "is_active": True,
                "password_changed": False,
                "needs_activation": True,
            },
        )

        if created and app.date_of_birth:
            temp_password = app.date_of_birth.strftime("%d%m%Y")
            user.set_password(temp_password)
            user.save(update_fields=["password"])

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
            created_by=admin_user,
        )

        try:
            temp_pwd = app.date_of_birth.strftime("%d%m%Y") if app.date_of_birth else "Your DOB"
            EmailService.send_templated_email(
                to_email=email,
                template_name="welcome",
                context={
                    "user_name": app.applicant_name,
                    "user_email": email,
                    "user_role": "Student",
                    "title": "Your EduSphere Student Account",
                    "message": (
                        f"Your student account has been created.<br/>"
                        f"Login email: <strong>{email}</strong><br/>"
                        f"Temporary password: <strong>{temp_pwd}</strong> (your date of birth in DDMMYYYY format)<br/>"
                        f"Please log in and change your password immediately."
                    ),
                },
            )
        except Exception:
            pass

        return profile
