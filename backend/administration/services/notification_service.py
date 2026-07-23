from django.utils import timezone

from administration.models.notification import NotificationBroadcast
from student.models import Notification, StudentProfile
from teacher.models import TeacherProfile


class NotificationAdminService:
    @staticmethod
    def list_broadcasts():
        return NotificationBroadcast.objects.all().order_by("-created_at")

    @staticmethod
    def create_broadcast(data, user):
        broadcast = NotificationBroadcast.objects.create(**data, sent_by=user)
        return broadcast

    @staticmethod
    def send_broadcast(broadcast_id):
        broadcast = NotificationBroadcast.objects.get(id=broadcast_id)
        if broadcast.recipient_type == "all_students":
            profiles = StudentProfile.objects.select_related("user").all()
            for p in profiles:
                Notification.objects.create(
                    user=p.user,
                    title=broadcast.title,
                    message=broadcast.message,
                )
        elif broadcast.recipient_type == "all_teachers":
            profiles = TeacherProfile.objects.select_related("user").all()
            for p in profiles:
                Notification.objects.create(
                    user=p.user,
                    title=broadcast.title,
                    message=broadcast.message,
                )
        elif broadcast.recipient_type == "specific_students":
            user_ids = broadcast.recipient_ids or []
            profiles = StudentProfile.objects.filter(
                user_id__in=user_ids
            ).select_related("user")
            for p in profiles:
                Notification.objects.create(
                    user=p.user,
                    title=broadcast.title,
                    message=broadcast.message,
                )
        elif broadcast.recipient_type == "specific_teachers":
            user_ids = broadcast.recipient_ids or []
            profiles = TeacherProfile.objects.filter(
                user_id__in=user_ids
            ).select_related("user")
            for p in profiles:
                Notification.objects.create(
                    user=p.user,
                    title=broadcast.title,
                    message=broadcast.message,
                )
        elif broadcast.recipient_type == "class":
            profiles = StudentProfile.objects.filter(
                class_assigned__startswith=broadcast.target_class
            ).select_related("user")
            for p in profiles:
                Notification.objects.create(
                    user=p.user,
                    title=broadcast.title,
                    message=broadcast.message,
                )

        broadcast.status = "sent"
        broadcast.sent_at = timezone.now()
        broadcast.save()
        return broadcast
