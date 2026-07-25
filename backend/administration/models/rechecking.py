from django.db import models
from django.conf import settings


class BlindRecheckingRequest(models.Model):
    STATUS_CHOICES = [
        ("pending_approval", "Pending Approval"),
        ("approved", "Approved – Awaiting Re-evaluation"),
        ("re_evaluating", "Re-evaluation In Progress"),
        ("comparing", "Comparing Results"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
        ("closed", "Closed – Window Expired"),
    ]

    EVALUATOR_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("evaluating", "Evaluating"),
        ("completed", "Completed"),
    ]

    POLICY_CHOICES = [
        ("use_higher", "Use Higher Marks"),
        ("use_average", "Use Average Marks"),
        ("use_new", "Use New Marks"),
        ("use_policy", "Use Institution Policy"),
    ]

    student = models.ForeignKey(
        "student.StudentProfile", on_delete=models.CASCADE, related_name="rechecking_requests"
    )
    exam = models.ForeignKey(
        "administration.Exam", on_delete=models.CASCADE, related_name="rechecking_requests"
    )
    subject = models.ForeignKey(
        "student.Subject", on_delete=models.CASCADE, related_name="rechecking_requests"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending_approval")

    # Original published result (snapshot before revision)
    original_published_result = models.ForeignKey(
        "administration.PublishedResult", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rechecking_original",
    )
    marks_obtained_original = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    total_marks_original = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    grade_original = models.CharField(max_length=5, blank=True)

    # Original evaluator reference
    original_evaluator = models.ForeignKey(
        "teacher.TeacherProfile", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="original_rechecking_scripts",
    )
    original_script = models.ForeignKey(
        "administration.AnswerScriptUpload", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rechecking_requests",
    )

    # Blind re-evaluation (second evaluator)
    second_evaluator = models.ForeignKey(
        "teacher.TeacherProfile", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rechecking_evaluations",
    )
    second_evaluator_script_id = models.CharField(max_length=20, blank=True, help_text="Anonymous script ID for blind evaluation (e.g. RECHK-XXXXX)")
    second_evaluator_marks = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    second_evaluator_total_marks = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    second_evaluator_remarks = models.TextField(blank=True)
    second_evaluator_status = models.CharField(
        max_length=20, choices=EVALUATOR_STATUS_CHOICES, default="pending"
    )
    second_evaluator_assigned_at = models.DateTimeField(blank=True, null=True)
    second_evaluator_completed_at = models.DateTimeField(blank=True, null=True)

    # Comparison
    marks_difference = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    rechecking_policy_applied = models.CharField(
        max_length=20, choices=POLICY_CHOICES, default="use_policy", blank=True
    )
    is_revised = models.BooleanField(default=False)

    # Revised result
    marks_obtained_revised = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    total_marks_revised = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    grade_revised = models.CharField(max_length=5, blank=True)
    revised_published_result = models.ForeignKey(
        "administration.PublishedResult", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rechecking_revisions",
    )
    student_result_unlocked = models.ForeignKey(
        "administration.StudentResult", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rechecking_unlocks",
    )

    # Window management
    rechecking_window_deadline = models.DateTimeField(blank=True, null=True)
    window_expired_notified = models.BooleanField(default=False)

    # Approval / rejection
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rechecking_approvals",
    )
    rejected_at = models.DateTimeField(blank=True, null=True)
    rejected_reason = models.TextField(blank=True)

    # Completion
    completed_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-requested_at"]
        unique_together = ("student", "exam", "subject", "status")
        verbose_name = "Blind Rechecking Request"
        verbose_name_plural = "Blind Rechecking Requests"

    def __str__(self):
        return f"Recheck #{self.id} – {self.student.user.email} – {self.exam.name} ({self.subject.name}) [{self.status}]"
