from django.db import models
from django.conf import settings


class NotificationBroadcast(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("scheduled", "Scheduled"),
    ]
    RECIPIENT_CHOICES = [
        ("all_students", "All Students"),
        ("all_teachers", "All Teachers"),
        ("specific_students", "Specific Students"),
        ("specific_teachers", "Specific Teachers"),
        ("class", "Specific Class"),
    ]

    title = models.CharField(max_length=200)
    message = models.TextField()
    recipient_type = models.CharField(max_length=50, choices=RECIPIENT_CHOICES)
    target_class = models.CharField(max_length=20, blank=True, help_text="Only for 'class' recipient type")
    recipient_ids = models.JSONField(default=list, blank=True, help_text="List of user IDs for specific recipients")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="notification_broadcasts",
    )
    sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Notification Broadcast"
        verbose_name_plural = "Notification Broadcasts"

    def __str__(self):
        return f"{self.title} ({self.status, self.recipient_type})"
