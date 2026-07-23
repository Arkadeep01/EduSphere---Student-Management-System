from django.db import models
from django.conf import settings


class PromotionLog(models.Model):
    ACTION_CHOICES = [
        ("promote", "Promoted"),
        ("repeat", "Repeated"),
        ("detain", "Detained"),
        ("bulk_promote", "Bulk Promoted"),
    ]

    student = models.ForeignKey(
        "student.StudentProfile", on_delete=models.CASCADE, related_name="promotion_logs"
    )
    from_class = models.CharField(max_length=20)
    from_section = models.CharField(max_length=10, blank=True)
    to_class = models.CharField(max_length=20)
    to_section = models.CharField(max_length=10, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    academic_session_from = models.ForeignKey(
        "administration.AcademicSession", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="promotion_logs_from",
    )
    academic_session_to = models.ForeignKey(
        "administration.AcademicSession", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="promotion_logs_to",
    )
    reason = models.TextField(blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="processed_promotions",
    )
    rollback_of = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rollbacks",
        help_text="Reference to original log if this is a rollback entry",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Promotion Log"
        verbose_name_plural = "Promotion Logs"

    def __str__(self):
        return f"{self.student.user.email}: {self.from_class} → {self.to_class} ({self.action})"


class StudentPromotionHistory(models.Model):
    student = models.ForeignKey(
        "student.StudentProfile", on_delete=models.CASCADE, related_name="promotion_history"
    )
    academic_session = models.ForeignKey(
        "administration.AcademicSession", on_delete=models.CASCADE, related_name="student_histories",
    )
    class_name = models.CharField(max_length=20)
    section = models.CharField(max_length=10, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("promoted", "Promoted"),
            ("repeated", "Repeated"),
            ("detained", "Detained"),
            ("completed", "Completed"),
            ("left", "Left School"),
        ],
        default="promoted",
    )
    percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    rank = models.IntegerField(blank=True, null=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-academic_session__start_date"]
        unique_together = ("student", "academic_session")
        verbose_name = "Student Promotion History"
        verbose_name_plural = "Student Promotion Histories"

    def __str__(self):
        return f"{self.student.user.email} – {self.academic_session.name} ({self.class_name}{self.section})"


class AcademicSessionRollover(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("rolled_back", "Rolled Back"),
    ]

    COPY_CHOICES = [
        ("subjects", "Subjects"),
        ("teachers", "Teacher Allocations"),
        ("timetables", "Timetables"),
        ("fee_structures", "Fee Structures"),
        ("classes", "Class Structure"),
        ("all", "All"),
    ]

    from_session = models.ForeignKey(
        "administration.AcademicSession", on_delete=models.CASCADE, related_name="rollovers_from",
    )
    to_session = models.ForeignKey(
        "administration.AcademicSession", on_delete=models.CASCADE, related_name="rollovers_to",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    copy_options = models.JSONField(default=list, help_text="List of items to copy")
    copy_results = models.JSONField(default=dict, blank=True)
    error_log = models.JSONField(default=list, blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="processed_rollovers",
    )
    rollback_of = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rollovers_rolled_back",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Academic Session Rollover"
        verbose_name_plural = "Academic Session Rollovers"

    def __str__(self):
        return f"{self.from_session.name} → {self.to_session.name} ({self.status})"


class PromotionRule(models.Model):
    """Optional rules for automatic promotion eligibility."""
    name = models.CharField(max_length=100)
    from_class = models.CharField(max_length=20)
    min_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=40)
    min_attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=75)
    max_failed_subjects = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["from_class"]
        verbose_name = "Promotion Rule"
        verbose_name_plural = "Promotion Rules"

    def __str__(self):
        return f"{self.name} – {self.from_class} (Min {self.min_percentage}%)"