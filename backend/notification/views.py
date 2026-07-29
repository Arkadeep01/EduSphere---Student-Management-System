import logging
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from .throttles import NotificationCleanupRateThrottle

from .models import (
    Notification, NotificationRecipient, NotificationSchedule,
    EmailTemplate, InstitutionSettings, DeliveryLog, NotificationAuditLog,
    NotificationStatus, ReadStatus, Priority, TargetAudience,
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
from teacher.models import TeacherProfile, TeacherClassAssignment
from administration.models.teacher import TeacherSubjectAllocation

logger = logging.getLogger(__name__)


def _is_admin(user):
    return user.role in ("admin", "director") or user.is_superuser


def _validate_teacher_scope(teacher_user, target_audience, target_class, target_section, target_subject, target_user_ids):
    try:
        teacher_profile = TeacherProfile.objects.get(user=teacher_user)
    except TeacherProfile.DoesNotExist:
        return Response({"error": "Teacher profile not found"}, status=status.HTTP_403_FORBIDDEN)

    if target_audience in (TargetAudience.SPECIFIC_CLASS, TargetAudience.SPECIFIC_SECTION) and target_class:
        class_ok = TeacherClassAssignment.objects.filter(
            teacher=teacher_profile, class_name=target_class
        ).exists()
        if not class_ok:
            allocation_ok = TeacherSubjectAllocation.objects.filter(
                teacher=teacher_profile,
                assigned_classes__contains=[target_class],
                is_active=True,
            ).exists()
            if not allocation_ok:
                return Response(
                    {"error": "You are not authorized to send notifications to this class"},
                    status=status.HTTP_403_FORBIDDEN,
                )

    if target_audience == TargetAudience.SPECIFIC_SUBJECT and target_subject:
        subject_ok = teacher_profile.assigned_subject and teacher_profile.assigned_subject.name == target_subject
        if not subject_ok:
            allocation_ok = TeacherSubjectAllocation.objects.filter(
                teacher=teacher_profile,
                subject__name=target_subject,
                is_active=True,
            ).exists()
            if not allocation_ok:
                return Response(
                    {"error": "You are not authorized to send notifications for this subject"},
                    status=status.HTTP_403_FORBIDDEN,
                )

    if target_audience in (TargetAudience.SPECIFIC_STUDENTS, TargetAudience.SPECIFIC_SECTION) and target_user_ids:
        from student.models import StudentProfile
        teacher_classes = list(TeacherClassAssignment.objects.filter(
            teacher=teacher_profile
        ).values_list("class_name", flat=True))
        allocation_classes = list(TeacherSubjectAllocation.objects.filter(
            teacher=teacher_profile, is_active=True
        ).exclude(assigned_classes=[]).values_list("assigned_classes", flat=True))
        for cls_list in allocation_classes:
            teacher_classes.extend(cls_list)
        teacher_classes = list(set(teacher_classes))

        if not teacher_classes:
            return Response(
                {"error": "You are not authorized to send notifications to students"},
                status=status.HTTP_403_FORBIDDEN,
            )

        valid_students = StudentProfile.objects.filter(
            class_assigned__in=teacher_classes,
            user_id__in=target_user_ids,
        ).values_list("user_id", flat=True)
        valid_set = set(valid_students)
        for uid in target_user_ids:
            if uid not in valid_set:
                return Response(
                    {"error": f"User {uid} is not in your assigned classes"},
                    status=status.HTTP_403_FORBIDDEN,
                )

    return None


class InstitutionSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings = InstitutionSettings.get_settings()
        serializer = InstitutionSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        if not _is_admin(request.user):
            return Response({"error": "Only admins and directors can update settings"}, status=status.HTTP_403_FORBIDDEN)

        public_fields = {"director_message", "public_email", "public_phone", "public_address",
                         "institution_name", "address", "phone", "email", "website",
                         "facebook", "twitter", "instagram", "linkedin", "principal_name",
                         "principal_signature", "brand_color_primary", "brand_color_secondary",
                         "logo", "email_footer"}
        requested_fields = set(request.data.keys())
        director_only_fields = {"director_message", "public_email", "public_phone", "public_address", "public_website_data_mode"}
        if request.user.role == "admin" and requested_fields & director_only_fields:
            return Response({"error": "Admin cannot modify institution public CMS fields. Use Director login."}, status=status.HTTP_403_FORBIDDEN)

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
        try:
            tmpl = EmailTemplate.objects.get(id=template_id)
        except EmailTemplate.DoesNotExist:
            return Response({"error": "Email template not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = EmailTemplateSerializer(tmpl)
        return Response(serializer.data)

    def patch(self, request, template_id):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage templates"}, status=status.HTTP_403_FORBIDDEN)
        try:
            tmpl = EmailTemplate.objects.get(id=template_id)
        except EmailTemplate.DoesNotExist:
            return Response({"error": "Email template not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = EmailTemplateSerializer(tmpl, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, template_id):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage templates"}, status=status.HTTP_403_FORBIDDEN)
        try:
            tmpl = EmailTemplate.objects.get(id=template_id)
        except EmailTemplate.DoesNotExist:
            return Response({"error": "Email template not found"}, status=status.HTTP_404_NOT_FOUND)
        tmpl.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmailTemplatePreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _is_admin(request.user):
            return Response({"error": "Only admins and directors can preview templates"}, status=status.HTTP_403_FORBIDDEN)
        serializer = EmailTemplatePreviewSerializer(data=request.data)
        if serializer.is_valid():
            try:
                result = TemplateEngine.preview_template(
                    serializer.validated_data["template_id"],
                    serializer.validated_data.get("context", {}),
                )
            except EmailTemplate.DoesNotExist:
                return Response({"error": "Email template not found"}, status=status.HTTP_404_NOT_FOUND)
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
        role = request.user.role
        admin = _is_admin(request.user)
        target_audience = request.data.get("target_audience", "")

        if role == "student":
            return Response({"error": "Students cannot broadcast notifications"}, status=status.HTTP_403_FORBIDDEN)

        if not admin:
            restricted_audiences = {"all_students", "all_teachers", "all_staff", "entire_school"}
            if target_audience in restricted_audiences:
                return Response({"error": "You are not authorized to broadcast to this audience"}, status=status.HTTP_403_FORBIDDEN)

            scoped_audiences = {"specific_class", "specific_section", "specific_subject", "specific_students"}
            if target_audience in scoped_audiences:
                if role == "teacher":
                    error = _validate_teacher_scope(
                        request.user,
                        target_audience,
                        request.data.get("target_class", ""),
                        request.data.get("target_section", ""),
                        request.data.get("target_subject", ""),
                        request.data.get("target_user_ids", []),
                    )
                    if error:
                        return error
                else:
                    return Response(
                        {"error": "You are not authorized to send notifications to academic scopes"},
                        status=status.HTTP_403_FORBIDDEN,
                    )

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
            notification = Notification.objects.get(
                id=notification_id, recipients__user=request.user
            )
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)

    def delete(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        admin = _is_admin(request.user)
        is_sender = notification.sender_id == request.user.id
        if not admin and not is_sender:
            return Response({"error": "You are not authorized to delete this notification"}, status=status.HTTP_403_FORBIDDEN)
        NotificationService.delete_notification(notification_id, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            ReadTracker.mark_read(notification_id, request.user.id)
        except NotificationRecipient.DoesNotExist:
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
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
        if not _is_admin(request.user):
            return Response({"error": "Only admins and directors can view analytics"}, status=status.HTTP_403_FORBIDDEN)
        data = NotificationService.get_analytics()
        return Response(data)


class PriorityOverrideView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Only admins can override priorities"}, status=status.HTTP_403_FORBIDDEN)
        serializer = PriorityOverrideSerializer(data=request.data)
        if serializer.is_valid():
            try:
                notification = Notification.objects.get(id=serializer.validated_data["notification_id"])
            except Notification.DoesNotExist:
                return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
            PriorityManager.override_priority(notification, serializer.validated_data["new_priority"], request.user)
            out = NotificationSerializer(notification)
            return Response(out.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationScheduleListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({"error": "Only admins and directors can view schedules"}, status=status.HTTP_403_FORBIDDEN)
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
        try:
            schedule = NotificationSchedule.objects.get(id=schedule_id)
        except NotificationSchedule.DoesNotExist:
            return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = NotificationScheduleSerializer(schedule)
        return Response(serializer.data)

    def patch(self, request, schedule_id):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage schedules"}, status=status.HTTP_403_FORBIDDEN)
        try:
            schedule = NotificationSchedule.objects.get(id=schedule_id)
        except NotificationSchedule.DoesNotExist:
            return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = NotificationScheduleSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, schedule_id):
        if request.user.role != "admin":
            return Response({"error": "Only admins can manage schedules"}, status=status.HTTP_403_FORBIDDEN)
        try:
            schedule = NotificationSchedule.objects.get(id=schedule_id)
        except NotificationSchedule.DoesNotExist:
            return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeliveryLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({"error": "Only admins and directors can view delivery logs"}, status=status.HTTP_403_FORBIDDEN)
        logs = DeliveryLog.objects.all().select_related("notification", "recipient__user")[:100]
        serializer = DeliveryLogSerializer(logs, many=True)
        return Response(serializer.data)


class NotificationAuditLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({"error": "Only admins and directors can view audit logs"}, status=status.HTTP_403_FORBIDDEN)
        logs = NotificationAuditLog.objects.all().select_related("notification", "performed_by")[:100]
        serializer = NotificationAuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class DeleteReadNotificationsView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [NotificationCleanupRateThrottle]

    def post(self, request):
        count = NotificationService.delete_read_notifications(request.user.id)
        return Response({"deleted": count})


class RetryNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, recipient_id):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Only admins can retry notifications"}, status=status.HTTP_403_FORBIDDEN)
        try:
            recipient = NotificationRecipient.objects.get(id=recipient_id)
        except NotificationRecipient.DoesNotExist:
            return Response({"error": "Recipient not found"}, status=status.HTTP_404_NOT_FOUND)
        success = DeliveryTracker.retry(recipient)
        return Response({"success": success})