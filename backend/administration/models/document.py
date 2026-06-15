from django.db import models
from django.conf import settings


class DocumentStorage(models.Model):
    FILE_TYPE_CHOICES = [
        ("student", "Student Document"),
        ("teacher", "Teacher Document"),
        ("admission", "Admission Document"),
        ("answer_script", "Answer Script"),
        ("resource", "Resource File"),
        ("gallery", "Gallery Image"),
        ("profile", "Profile Image"),
        ("other", "Other"),
    ]

    file = models.FileField(upload_to="documents/")
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    original_filename = models.CharField(max_length=255, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    file_size = models.BigIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_documents",
    )
    related_model = models.CharField(max_length=100, blank=True, help_text="e.g. student, teacher, admission")
    related_id = models.IntegerField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Document Storage"
        verbose_name_plural = "Document Storage"

    def __str__(self):
        return self.original_filename or f"Document #{self.pk}"
