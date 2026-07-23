from django.db import models


class SubjectRequestControl(models.Model):
    enabled = models.BooleanField(default=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Subject Request Control"
        verbose_name_plural = "Subject Request Controls"

    def __str__(self):
        return f"Subject Requests {'Enabled' if self.enabled else 'Disabled'}"
