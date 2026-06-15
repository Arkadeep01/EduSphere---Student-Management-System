from django.db import models


class SubjectRequestControl(models.Model):
    enabled = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Subject Request Control"
        verbose_name_plural = "Subject Request Controls"

    def __str__(self):
        return f"Subject Requests {'Enabled' if self.enabled else 'Disabled'}"
