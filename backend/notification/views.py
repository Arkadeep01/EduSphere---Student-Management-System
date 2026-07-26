import logging
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from .models import (
    Notification, NotificationRecipient, NotificationSchedule,
    EmailTemplate, InstitutionSettings, DeliveryLog, NotificationAuditLog,
    NotificationStatus, ReadStatus, Priority,
)
from .serializers import (
    NotificationSerializer, NotificationCreateSerializer, NotificationListSerializer,
    NotificationRecipientSerializer, NotificationScheduleSerializer,
    EmailTemplateSerializer, InstitutionSettingsSerializer,
    BulkReadSerializer, PriorityOverrideSerializer,
    DeliveryLogSerializer, NotificationAuditLogSerializer,
    EmailTemplatePreviewSerializer,
)
from .services.notification_service import (
    NotificationService, PriorityManager, ReadTracker, DeliveryTracker, TemplateEngine,
)
from .services.email_service import EmailService

logger = logging.getLogger(__name__)


class InstitutionSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings = InstitutionSettings.get_settings()
        serializer = InstitutionSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Only admins can update settings"}, status=status.HTTP_403_FORBIDDEN)
        settings = InstitutionSettings.get_settings()
        serializer = InstitutionSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailTemplateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        templates = EmailTemplate.objects.all()
        serializer = EmailTemplateSerializer(templates, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage templates"}, status=status.HTTP_403_FORBIDDEN)
        serializer = EmailTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, template_id):
        tmpl = EmailTemplate.objects.get(id=template_id)
        serializer = EmailTemplateSerializer(tmpl)
        return Response(serializer.data)

    def patch(self, request, template_id):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage templates"}, status=status.HTTP_403_FORBIDDEN)
        tmpl = EmailTemplate.objects.get(id=template_id)
        serializer = EmailTemplateSerializer(tmpl, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, template_id):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage templates"}, status=status.HTTP_403_FORBIDDEN)
        tmpl = EmailTemplate.objects.get(id=template_id)
        tmpl.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmailTemplatePreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EmailTemplatePreviewSerializer(data=request.data)
        if serializer.is_valid():
            result = TemplateEngine.preview_template(
                serializer.validated_data["template_id"],
                serializer.validated_data.get("context", {}),
            )
            return Response(result)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = NotificationListSerializer(data=request.query_params)
        params.is_valid(raise_exception=True)
        data = NotificationService.get_user_notifications(
            user_id=request.user.id,
            notification_type=params.validated_data.get("notification_type", ""),
            read_status=params.validated_data.get("read_status", ""),
            priority=params.validated_data.get("priority", ""),
            page=params.validated_data.get("page", 1),
            page_size=params.validated_data.get("page_size", 20),
            search=params.validated_data.get("search", ""),
        )
        return Response(data)

    def post(self, request):
        serializer = NotificationCreateSerializer(data=request.data)
        if serializer.is_valid():
            notification = NotificationService.create_notification(
                notification_type=serializer.validated_data["notification_type"],
                title=serializer.validated_data["title"],
                message=serializer.validated_data["message"],
                sender=request.user,
                priority=serializer.validated_data.get("priority", Priority.MEDIUM),
                target_audience=serializer.validated_data.get("target_audience", ""),
                target_class=serializer.validated_data.get("target_class", ""),
                target_section=serializer.validated_data.get("target_section", ""),
                target_subject=serializer.validated_data.get("target_subject", ""),
                target_user_ids=serializer.validated_data.get("target_user_ids", []),
                activation_at=serializer.validated_data.get("activation_at"),
                expires_at=serializer.validated_data.get("expires_at"),
                send_email=serializer.validated_data.get("send_email", True),
                send_realtime=serializer.validated_data.get("send_realtime", True),
            )
            out = NotificationSerializer(notification)
            return Response(out.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)

    def delete(self, request, notification_id):
        NotificationService.delete_notification(notification_id, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        ReadTracker.mark_read(notification_id, request.user.id)
        return Response({"success": True})


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        count = ReadTracker.mark_all_read(request.user.id)
        return Response({"count": count})


class NotificationBulkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BulkReadSerializer(data=request.data)
        if serializer.is_valid():
            count = ReadTracker.bulk_mark_read(
                serializer.validated_data["notification_ids"],
                request.user.id,
            )
            return Response({"count": count})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = ReadTracker.unread_count(request.user.id)
        return Response({"count": count})


class NotificationAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Only admins can view analytics"}, status=status.HTTP_403_FORBIDDEN)
        data = NotificationService.get_analytics()
        return Response(data)


class PriorityOverrideView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Only admins can override priorities"}, status=status.HTTP_403_FORBIDDEN)
        serializer = PriorityOverrideSerializer(data=request.data)
        if serializer.is_valid():
            notification = Notification.objects.get(id=serializer.validated_data["notification_id"])
            PriorityManager.override_priority(notification, serializer.validated_data["new_priority"], request.user)
            out = NotificationSerializer(notification)
            return Response(out.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationScheduleListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Only admins can manage schedules"}, status=status.HTTP_403_FORBIDDEN)
        schedules = NotificationSchedule.objects.all()
        serializer = NotificationScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage schedules"}, status=status.HTTP_403_FORBIDDEN)
        serializer = NotificationScheduleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationScheduleDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, schedule_id):
        schedule = NotificationSchedule.objects.get(id=schedule_id)
        serializer = NotificationScheduleSerializer(schedule)
        return Response(serializer.data)

    def patch(self, request, schedule_id):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage schedules"}, status=status.HTTP_403_FORBIDDEN)
        schedule = NotificationSchedule.objects.get(id=schedule_id)
        serializer = NotificationScheduleSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, schedule_id):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage schedules"}, status=status.HTTP_403_FORBIDDEN)
        schedule = NotificationSchedule.objects.get(id=schedule_id)
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeliveryLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Only admins can view delivery logs"}, status=status.HTTP_403_FORBIDDEN)
        logs = DeliveryLog.objects.all().select_related("notification", "recipient__user")[:100]
        serializer = DeliveryLogSerializer(logs, many=True)
        return Response(serializer.data)


class NotificationAuditLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Only admins can view audit logs"}, status=status.HTTP_403_FORBIDDEN)
        logs = NotificationAuditLog.objects.all().select_related("notification", "performed_by")[:100]
        serializer = NotificationAuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class DeleteReadNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        count = NotificationService.delete_read_notifications(request.user.id)
        return Response({"deleted": count})


class RetryNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, recipient_id):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Only admins can retry notifications"}, status=status.HTTP_403_FORBIDDEN)
        recipient = NotificationRecipient.objects.get(id=recipient_id)
        success = DeliveryTracker.retry(recipient)
        return Response({"success": success})