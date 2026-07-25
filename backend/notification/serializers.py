from rest_framework import serializers
from .models import (
    Notification, NotificationRecipient, NotificationSchedule,
    EmailTemplate, InstitutionSettings, DeliveryLog, NotificationAuditLog,
    NotificationType, Priority, TargetAudience,
)


class InstitutionSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionSettings
        exclude = []


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = "__all__"


class EmailTemplatePreviewSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    context = serializers.JSONField(required=False, default=dict)


class NotificationRecipientSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = NotificationRecipient
        fields = [
            "id", "notification", "user", "user_email", "user_name",
            "read_status", "read_at", "delivery_status", "delivered_at",
            "failure_reason", "retry_count", "email_sent", "email_sent_at",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "delivered_at", "email_sent_at"]

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email


class NotificationSerializer(serializers.ModelSerializer):
    recipients = NotificationRecipientSerializer(many=True, read_only=True)
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id", "notification_type", "title", "message", "priority",
            "status", "target_audience", "target_class", "target_section",
            "target_subject", "target_user_ids", "sender", "sender_name",
            "metadata", "activation_at", "expires_at", "created_at", "updated_at",
            "recipients",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "sender"]

    def get_sender_name(self, obj):
        if obj.sender:
            return f"{obj.sender.first_name} {obj.sender.last_name}".strip() or obj.sender.email
        return None


class NotificationCreateSerializer(serializers.Serializer):
    notification_type = serializers.ChoiceField(choices=Notification.notification_type.field.choices)
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    priority = serializers.ChoiceField(choices=Notification.priority.field.choices, default="medium")
    target_audience = serializers.ChoiceField(choices=TargetAudience.choices, required=False, allow_blank=True)
    target_class = serializers.CharField(required=False, allow_blank=True)
    target_section = serializers.CharField(required=False, allow_blank=True)
    target_subject = serializers.CharField(required=False, allow_blank=True)
    target_user_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    activation_at = serializers.DateTimeField(required=False, allow_null=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
    send_email = serializers.BooleanField(default=True)
    send_realtime = serializers.BooleanField(default=True)


class NotificationListSerializer(serializers.Serializer):
    notification_type = serializers.CharField(required=False, allow_blank=True)
    read_status = serializers.CharField(required=False, allow_blank=True)
    priority = serializers.CharField(required=False, allow_blank=True)
    page = serializers.IntegerField(required=False, default=1)
    page_size = serializers.IntegerField(required=False, default=20)
    search = serializers.CharField(required=False, allow_blank=True)


class NotificationScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSchedule
        fields = "__all__"


class BulkReadSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(child=serializers.IntegerField())


class PriorityOverrideSerializer(serializers.Serializer):
    notification_id = serializers.IntegerField()
    new_priority = serializers.ChoiceField(choices=Priority.choices)


class DeliveryLogSerializer(serializers.ModelSerializer):
    notification_title = serializers.CharField(source="notification.title", read_only=True)
    recipient_email = serializers.EmailField(source="recipient.user.email", read_only=True)

    class Meta:
        model = DeliveryLog
        fields = [
            "id", "notification", "notification_title", "recipient",
            "recipient_email", "channel", "status", "error_message",
            "retry_count", "created_at",
        ]


class NotificationAuditLogSerializer(serializers.ModelSerializer):
    notification_title = serializers.CharField(source="notification.title", read_only=True)
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = NotificationAuditLog
        fields = [
            "id", "notification", "notification_title", "action",
            "performed_by", "performed_by_name", "description",
            "metadata", "created_at",
        ]

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return f"{obj.performed_by.first_name} {obj.performed_by.last_name}".strip() or obj.performed_by.email
        return None