from django.db import models
from django.conf import settings


class ScriptBatchProcessing(models.Model):
    VERIFICATION_CHOICES = [
        ("pending", "Pending"),
        ("verifying", "Verifying"),
        ("passed", "All Passed"),
        ("failed", "One or More Failed"),
        ("flagged", "Flagged for Review"),
    ]

    batch_id = models.CharField(max_length=50, db_index=True)
    exam = models.ForeignKey(
        "administration.Exam", on_delete=models.CASCADE, related_name="batch_processing"
    )
    subject = models.ForeignKey(
        "student.Subject", on_delete=models.CASCADE, related_name="batch_processing"
    )
    verification_status = models.CharField(
        max_length=20, choices=VERIFICATION_CHOICES, default="pending"
    )
    total_scripts = models.IntegerField(default=0)
    passed_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    flagged_count = models.IntegerField(default=0)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    processing_log = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Script Batch Processing"
        verbose_name_plural = "Script Batch Processing"

    def __str__(self):
        return f"Batch {self.batch_id} - {self.get_verification_status_display()}"


class ScriptProcessing(models.Model):
    OCR_STATUS_CHOICES = [
        ("pending", "Pending OCR"),
        ("processing", "Processing OCR"),
        ("completed", "OCR Completed"),
        ("failed", "OCR Failed"),
    ]
    PROCESSING_STATUS_CHOICES = [
        ("pending", "Pending Processing"),
        ("extracting", "Extracting Metadata"),
        ("indexing", "Indexing Pages"),
        ("matching", "Matching Student"),
        ("validating", "Validating"),
        ("completed", "Processing Completed"),
        ("failed", "Processing Failed"),
    ]
    VERIFICATION_STATUS_CHOICES = [
        ("pending", "Pending Verification"),
        ("passed", "Verification Passed"),
        ("failed", "Verification Failed"),
        ("flagged", "Flagged for Review"),
    ]
    MATCH_STATUS_CHOICES = [
        ("matched", "Matched"),
        ("unmatched", "Unmatched"),
        ("ambiguous", "Ambiguous"),
    ]

    script = models.OneToOneField(
        "administration.AnswerScriptUpload",
        on_delete=models.CASCADE,
        related_name="processing",
    )
    batch = models.ForeignKey(
        ScriptBatchProcessing,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scripts",
    )

    ocr_status = models.CharField(
        max_length=20, choices=OCR_STATUS_CHOICES, default="pending"
    )
    ocr_attempted_at = models.DateTimeField(blank=True, null=True)
    ocr_completed_at = models.DateTimeField(blank=True, null=True)
    ocr_confidence = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True
    )
    ocr_error_message = models.TextField(blank=True)

    processing_status = models.CharField(
        max_length=20, choices=PROCESSING_STATUS_CHOICES, default="pending"
    )
    processing_started_at = models.DateTimeField(blank=True, null=True)
    processing_completed_at = models.DateTimeField(blank=True, null=True)

    verification_status = models.CharField(
        max_length=20, choices=VERIFICATION_STATUS_CHOICES, default="pending"
    )
    verified_at = models.DateTimeField(blank=True, null=True)

    extracted_metadata = models.JSONField(default=dict, blank=True)

    total_pages = models.IntegerField(blank=True, null=True)
    expected_pages = models.IntegerField(blank=True, null=True)
    missing_pages = models.JSONField(default=list, blank=True)
    duplicate_pages = models.JSONField(default=list, blank=True)

    matched_student = models.ForeignKey(
        "student.StudentProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="script_processing_matches",
    )
    match_confidence = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True
    )
    match_status = models.CharField(
        max_length=20, choices=MATCH_STATUS_CHOICES, default="unmatched"
    )

    detected_roll_number = models.CharField(max_length=20, blank=True)
    roll_verified = models.BooleanField(default=False)
    roll_mismatch_reason = models.TextField(blank=True)

    is_duplicate = models.BooleanField(default=False)
    duplicate_of = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="duplicates",
    )
    duplicate_confidence = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Script Processing"
        verbose_name_plural = "Script Processing"

    def __str__(self):
        return f"Processing {self.script.id} - {self.get_verification_status_display()}"
