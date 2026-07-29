import secrets
from django.db import transaction
from django.conf import settings

from authentication.models import CustomUser
from administration.models.staff import StaffProfile
from notification.services.email_service import EmailService


class DirectorAdminService:

    @staticmethod
    @transaction.atomic
    def create_admin(data):
        email = data["email"].strip().lower()
        username = email.split("@")[0] + str(secrets.randbelow(9000) + 1000)
        user = CustomUser.objects.create_user(
            email=email,
            password=data["password"],
            username=username,
            mobile=data.get("mobile", ""),
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            role="admin",
            is_staff=True,
            is_superuser=False,
            is_active=True,
            password_changed=True,
            needs_activation=False,
        )
        return user

    @staticmethod
    @transaction.atomic
    def create_staff(data):
        email = data["email"].strip().lower()
        username = email.split("@")[0] + str(secrets.randbelow(9000) + 1000)
        user = CustomUser.objects.create_user(
            email=email,
            password=data["password"],
            username=username,
            mobile=data.get("mobile", ""),
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            role="staff",
            is_staff=True,
            is_superuser=False,
            is_active=True,
            password_changed=True,
            needs_activation=False,
        )
        StaffProfile.objects.get_or_create(
            user=user,
            defaults={"department": data.get("department", "")},
        )
        return user
    @staticmethod
    def list_admins():
        return CustomUser.objects.filter(role="admin")

    @staticmethod
    def list_staff():
        return CustomUser.objects.filter(role="staff").select_related("staff_profile")

    @staticmethod
    @transaction.atomic
    def toggle_active(user_id):
        user = CustomUser.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        return user

    @staticmethod
    @transaction.atomic
    def change_role(user_id, new_role):
        if new_role not in ("admin", "staff"):
            raise ValueError("Role must be admin or staff")
        user = CustomUser.objects.get(id=user_id)
        user.role = new_role
        user.save()
        return user