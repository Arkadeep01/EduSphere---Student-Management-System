from django.db import models


class SubjectRequestControl(models.Model):
    session = models.ForeignKey(
        "administration.AcademicSession",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="subject_request_controls",
    )
    enabled = models.BooleanField(default=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    max_additional_subjects = models.IntegerField(default=2, help_text="Maximum additional subjects per student")

    class Meta:
        verbose_name = "Subject Request Control"
        verbose_name_plural = "Subject Request Controls"
        unique_together = ("session",)

    def __str__(self):
        return f"Subject Requests {'Enabled' if self.enabled else 'Disabled'}"
