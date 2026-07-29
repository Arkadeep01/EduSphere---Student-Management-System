from django.db import models
from django.conf import settings


class DocumentTemplate(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending_approval", "Pending Approval"),
        ("active", "Active"),
        ("retired", "Retired"),
    ]

    DOCUMENT_TYPE_CHOICES = [
        ("report_card", "Report Card"),
        ("marksheet", "Marksheet"),
        ("transcript", "Transcript"),
        ("fee_receipt", "Fee Receipt"),
        ("student_report", "Student Performance Report"),
        ("attendance_report", "Attendance Report"),
        ("transfer_certificate", "Transfer Certificate"),
        ("bonafide", "Bonafide Certificate"),
        ("conduct_certificate", "Conduct Certificate"),
        ("custom", "Custom Document"),
    ]

    DOC_TYPE_PREFIX_MAP = {
        "report_card": "RC", "marksheet": "MS", "transcript": "TR",
        "fee_receipt": "FR", "student_report": "SR", "attendance_report": "AR",
        "transfer_certificate": "TC", "bonafide": "BF", "conduct_certificate": "CC",
        "custom": "CD",
    }

    name = models.CharField(max_length=200)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to="templates/", help_text="DOCX template file with {{ placeholders }}")
    placeholder_registry = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    version = models.PositiveIntegerField(default=1)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_templates"
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_templates"
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["document_type", "-version"]
        verbose_name = "Document Template"
        verbose_name_plural = "Document Templates"
        constraints = [
            models.UniqueConstraint(
                fields=["document_type"],
                condition=models.Q(status="active"),
                name="unique_active_template_per_type",
            )
        ]

    def __str__(self):
        return f"{self.name} v{self.version} ({self.get_status_display()})"


class GeneratedDocument(models.Model):
    DOCUMENT_TYPE_CHOICES = DocumentTemplate.DOCUMENT_TYPE_CHOICES

    template = models.ForeignKey(
        DocumentTemplate, on_delete=models.SET_NULL, null=True, related_name="generated_documents"
    )
    template_version = models.PositiveIntegerField()
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    reference_number = models.CharField(max_length=100, unique=True)
    recipient_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="received_documents"
    )
    recipient_name = models.CharField(max_length=200, blank=True)
    recipient_entity = models.CharField(max_length=200, blank=True, help_text="e.g. Class, Department")
    academic_session = models.CharField(max_length=50, blank=True)
    context_data = models.JSONField(default=dict, blank=True)
    file = models.FileField(upload_to="generated_documents/")
    file_format = models.CharField(max_length=10, default="docx")
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="generated_documents"
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    is_archived = models.BooleanField(default=False)

    class Meta:
        ordering = ["-generated_at"]
        verbose_name = "Generated Document"
        verbose_name_plural = "Generated Documents"

    def __str__(self):
        return f"{self.reference_number} - {self.recipient_name}"
