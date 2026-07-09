from django.db import models
from django.conf import settings


class ExportLog(models.Model):
    EXPORT_TYPE_CHOICES = [
        ("csv", "CSV"),
        ("excel", "Excel"),
        ("pdf", "PDF"),
        ("zip", "ZIP"),
        ("print", "Print"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="export_logs",
    )
    model_name = models.CharField(max_length=100, help_text="e.g. student, teacher, attendance")
    export_type = models.CharField(max_length=20, choices=EXPORT_TYPE_CHOICES)
    query_params = models.JSONField(default=dict, blank=True)
    file_path = models.CharField(max_length=500, blank=True)
    exported_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-exported_at"]
        verbose_name = "Export Log"
        verbose_name_plural = "Export Logs"

    def __str__(self):
        return f"{self.model_name} exported by {self.user.email} ({self.export_type})"
