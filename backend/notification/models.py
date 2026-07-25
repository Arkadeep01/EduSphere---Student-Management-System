from django.db import models
from django.conf import settings


class NotificationType(models.TextChoices):
    ASSIGNMENT_CREATED = "assignment_created", "Assignment Created"
    ASSIGNMENT_UPDATED = "assignment_updated", "Assignment Updated"
    ASSIGNMENT_DEADLINE = "assignment_deadline", "Assignment Deadline"
    RESULTS_PUBLISHED = "results_published", "Results Published"
    RESULTS_DRAFTED = "results_drafted", "Results Drafted"
    RESULTS_REVIEWED = "results_reviewed", "Results Under Review"
    RESULTS_APPROVED = "results_approved", "Results Approved"
    RESULTS_GENERATED = "results_generated", "Results Generated"
    RESULTS_GRADES_UPDATED = "grades_updated", "Grade Boundaries Updated"
    RESULTS_RANK_COMPUTED = "rank_computed", "Rank Computed"
    RECHCKED_RESULT = "rechecked_result", "Rechecked Result Published"
    FEE_GENERATED = "fee_generated", "Fee Generated"
    FEE_REMINDER = "fee_reminder", "Fee Reminder"
    ADMISSION_APPROVED = "admission_approved", "Admission Approved"
    ADMISSION_REJECTED = "admission_rejected", "Admission Rejected"
    SUBJECT_APPROVED = "subject_approved", "Subject Request Approved"
    SUBJECT_REJECTED = "subject_rejected", "Subject Request Rejected"
    STUDENT_PROMOTED = "student_promoted", "Student Promoted"
    OTP_VERIFICATION = "otp_verification", "OTP Verification"
    PASSWORD_RESET = "password_reset", "Password Reset"
    EMAIL_VERIFICATION = "email_verification", "Email Verification"
    MAINTENANCE = "maintenance", "Maintenance"
    ASSIGNMENT_ANNOUNCEMENT = "assignment_announcement", "Assignment Announcement"
    SUBJECT_ANNOUNCEMENT = "subject_announcement", "Subject Announcement"
    CLASS_ANNOUNCEMENT = "class_announcement", "Class Announcement"
    SCHOOL_ANNOUNCEMENT = "school_announcement", "School Announcement"
    HOLIDAY_NOTICE = "holiday_notice", "Holiday Notice"
    CIRCULAR = "circular", "Circular"
    EVENT = "event", "Event"
    EMERGENCY = "emergency", "Emergency Notice"
    EXAM_ANNOUNCEMENT = "exam_announcement", "Exam Announcement"
    WELCOME = "welcome", "Welcome Email"
    SCRIPTS_UPLOADED = "scripts_uploaded", "Scripts Uploaded"
    SCRIPTS_BULK_UPLOADED = "scripts_bulk_uploaded", "Scripts Bulk Uploaded"
    SCRIPTS_ASSIGNED = "scripts_assigned", "Scripts Assigned to Evaluator"
    SCRIPTS_BULK_ASSIGNED = "scripts_bulk_assigned", "Scripts Bulk Assigned"
    SCRIPTS_EVALUATION_COMPLETE = "evaluation_complete", "Evaluation Complete"
    SCRIPTS_REEVALUATION_REQUESTED = "reevaluation_requested", "Re-evaluation Requested"
    SCRIPTS_APPROVED = "scripts_approved", "Scripts Approved"
    SCRIPTS_BATCH_COMPLETE = "batch_complete", "Batch Processing Complete"
    SCRIPTS_BATCH_FAILED = "batch_failed", "Batch Processing Failed"
    RECHECKING_REQUESTED = "rechecking_requested", "Rechecking Requested"
    RECHECKING_APPROVED = "rechecking_approved", "Rechecking Approved"
    RECHECKING_REJECTED = "rechecking_rejected", "Rechecking Rejected"
    RECHECKING_ASSIGNED = "rechecking_assigned", "Rechecking – Evaluator Assigned"
    RECHECKING_EVALUATION_COMPLETE = "rechecking_evaluation_complete", "Rechecking Evaluation Complete"
    RECHECKING_COMPLETED = "rechecking_completed", "Rechecking Completed"
    RECHECKING_WINDOW_CLOSING = "rechecking_window_closing", "Rechecking Window Closing"
    RECHECKING_WINDOW_CLOSED = "rechecking_window_closed", "Rechecking Window Closed"


class Priority(models.TextChoices):
    CRITICAL = "critical", "Critical"
    HIGH = "high", "High"
    MEDIUM = "medium", "Medium"
    LOW = "low", "Low"


class NotificationStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    EXPIRED = "expired", "Expired"
    DRAFT = "draft", "Draft"
    SCHEDULED = "scheduled", "Scheduled"


class ReadStatus(models.TextChoices):
    UNREAD = "unread", "Unread"
    READ = "read", "Read"


class DeliveryStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    DELIVERED = "delivered", "Delivered"
    FAILED = "failed", "Failed"
    RETRY = "retry", "Retry"


class TargetAudience(models.TextChoices):
    ALL_STUDENTS = "all_students", "All Students"
    ALL_TEACHERS = "all_teachers", "All Teachers"
    ALL_STAFF = "all_staff", "All Staff"
    SPECIFIC_STUDENTS = "specific_students", "Specific Students"
    SPECIFIC_TEACHERS = "specific_teachers", "Specific Teachers"
    SPECIFIC_CLASS = "specific_class", "Specific Class"
    SPECIFIC_SECTION = "specific_section", "Specific Section"
    SPECIFIC_SUBJECT = "specific_subject", "Specific Subject"
    ENTIRE_SCHOOL = "entire_school", "Entire School"


class InstitutionSettings(models.Model):
    institution_name = models.CharField(max_length=255, default="EduSphere")
    logo = models.ImageField(upload_to="institution/", blank=True, null=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    principal_name = models.CharField(max_length=255, blank=True)
    principal_signature = models.ImageField(upload_to="institution/", blank=True, null=True)
    email_footer = models.TextField(blank=True, help_text="Additional footer text for emails")
    brand_color_primary = models.CharField(max_length=7, default="#2563eb")
    brand_color_secondary = models.CharField(max_length=7, default="#1e40af")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Institution Setting"
        verbose_name_plural = "Institution Settings"

    def __str__(self):
        return self.institution_name

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj


class EmailTemplate(models.Model):
    name = models.CharField(max_length=100, unique=True)
    subject = models.CharField(max_length=255)
    body_html = models.TextField(help_text="HTML content with {{ variable }} placeholders")
    body_text = models.TextField(blank=True, help_text="Plain text fallback")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Notification(models.Model):
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=NotificationStatus.choices, default=NotificationStatus.ACTIVE)
    target_audience = models.CharField(max_length=50, choices=TargetAudience.choices, blank=True)
    target_class = models.CharField(max_length=50, blank=True)
    target_section = models.CharField(max_length=50, blank=True)
    target_subject = models.CharField(max_length=100, blank=True)
    target_user_ids = models.JSONField(default=list, blank=True)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="sent_notifications"
    )
    metadata = models.JSONField(default=dict, blank=True)
    activation_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["notification_type", "status"]),
            models.Index(fields=["priority", "created_at"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self):
        return f"{self.get_notification_type_display()}: {self.title}"


class NotificationRecipient(models.Model):
    notification = models.ForeignKey(
        Notification, on_delete=models.CASCADE, related_name="recipients"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_recipients"
    )
    read_status = models.CharField(max_length=20, choices=ReadStatus.choices, default=ReadStatus.UNREAD)
    read_at = models.DateTimeField(blank=True, null=True)
    delivery_status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING)
    delivered_at = models.DateTimeField(blank=True, null=True)
    failure_reason = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("notification", "user")
        indexes = [
            models.Index(fields=["user", "read_status"]),
            models.Index(fields=["delivery_status"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.notification.title} ({self.read_status})"


class NotificationSchedule(models.Model):
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices)
    reminder_interval_hours = models.IntegerField(default=24)
    is_active = models.BooleanField(default=True)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    target_audience = models.CharField(max_length=50, choices=TargetAudience.choices, blank=True)
    last_run_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["notification_type"]

    def __str__(self):
        return f"Schedule: {self.get_notification_type_display()} (every {self.reminder_interval_hours}h)"


class DeliveryLog(models.Model):
    notification = models.ForeignKey(
        Notification, on_delete=models.CASCADE, related_name="delivery_logs"
    )
    recipient = models.ForeignKey(
        NotificationRecipient, on_delete=models.CASCADE, related_name="delivery_logs",
        null=True, blank=True
    )
    channel = models.CharField(max_length=20, choices=[
        ("email", "Email"),
        ("websocket", "WebSocket"),
        ("system", "In-App"),
    ])
    status = models.CharField(max_length=20, choices=DeliveryStatus.choices)
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.channel} - {self.status} - {self.notification.title}"


class NotificationAuditLog(models.Model):
    ACTION_CHOICES = [
        ("created", "Notification Created"),
        ("priority_changed", "Priority Changed"),
        ("priority_overridden", "Priority Overridden"),
        ("read", "Read"),
        ("deleted", "Deleted"),
        ("expired", "Expired"),
        ("email_sent", "Email Sent"),
        ("email_failed", "Email Failed"),
        ("retry", "Retry"),
        ("admin_override", "Admin Override"),
        ("scheduled", "Scheduled"),
        ("sent", "Sent"),
    ]

    notification = models.ForeignKey(
        Notification, on_delete=models.CASCADE, related_name="audit_logs", null=True, blank=True
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Notification Audit Log"

    def __str__(self):
        return f"{self.action} - {self.created_at}"