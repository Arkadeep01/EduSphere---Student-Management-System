from django.contrib import admin
from .models import (
    Notification, NotificationRecipient, NotificationSchedule,
    EmailTemplate, InstitutionSettings, DeliveryLog, NotificationAuditLog,
)


@admin.register(InstitutionSettings)
class InstitutionSettingsAdmin(admin.ModelAdmin):
    list_display = ["institution_name", "phone", "email", "website", "updated_at"]


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "subject", "is_active", "updated_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "subject"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "notification_type", "priority", "status", "sender", "created_at"]
    list_filter = ["notification_type", "priority", "status"]
    search_fields = ["title", "message"]


@admin.register(NotificationRecipient)
class NotificationRecipientAdmin(admin.ModelAdmin):
    list_display = ["user", "notification", "read_status", "delivery_status", "created_at"]
    list_filter = ["read_status", "delivery_status", "email_sent"]


@admin.register(NotificationSchedule)
class NotificationScheduleAdmin(admin.ModelAdmin):
    list_display = ["notification_type", "is_active", "reminder_interval_hours", "priority"]
    list_filter = ["is_active", "priority"]


@admin.register(DeliveryLog)
class DeliveryLogAdmin(admin.ModelAdmin):
    list_display = ["notification", "channel", "status", "retry_count", "created_at"]
    list_filter = ["channel", "status"]


@admin.register(NotificationAuditLog)
class NotificationAuditLogAdmin(admin.ModelAdmin):
    list_display = ["action", "notification", "performed_by", "created_at"]
    list_filter = ["action"]