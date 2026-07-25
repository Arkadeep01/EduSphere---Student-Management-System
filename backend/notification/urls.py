from django.urls import path
from . import views

urlpatterns = [
    # Institution Settings
    path("institution-settings/", views.InstitutionSettingsView.as_view(), name="notification-institution-settings"),

    # Email Templates
    path("email-templates/", views.EmailTemplateListView.as_view(), name="notification-email-templates"),
    path("email-templates/<int:template_id>/", views.EmailTemplateDetailView.as_view(), name="notification-email-template-detail"),
    path("email-templates/preview/", views.EmailTemplatePreviewView.as_view(), name="notification-email-template-preview"),

    # Notifications CRUD
    path("notifications/", views.NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:notification_id>/", views.NotificationDetailView.as_view(), name="notification-detail"),
    path("notifications/<int:notification_id>/read/", views.NotificationMarkReadView.as_view(), name="notification-mark-read"),
    path("notifications/mark-all-read/", views.NotificationMarkAllReadView.as_view(), name="notification-mark-all-read"),
    path("notifications/bulk-read/", views.NotificationBulkReadView.as_view(), name="notification-bulk-read"),
    path("notifications/unread-count/", views.UnreadCountView.as_view(), name="notification-unread-count"),
    path("notifications/delete-read/", views.DeleteReadNotificationsView.as_view(), name="notification-delete-read"),

    # Priority Management
    path("priorities/override/", views.PriorityOverrideView.as_view(), name="notification-priority-override"),

    # Analytics
    path("analytics/", views.NotificationAnalyticsView.as_view(), name="notification-analytics"),

    # Schedules
    path("schedules/", views.NotificationScheduleListView.as_view(), name="notification-schedules"),
    path("schedules/<int:schedule_id>/", views.NotificationScheduleDetailView.as_view(), name="notification-schedule-detail"),

    # Delivery Logs
    path("delivery-logs/", views.DeliveryLogListView.as_view(), name="notification-delivery-logs"),

    # Audit Logs
    path("audit-logs/", views.NotificationAuditLogListView.as_view(), name="notification-audit-logs"),

    # Retry
    path("retry/<int:recipient_id>/", views.RetryNotificationView.as_view(), name="notification-retry"),
]