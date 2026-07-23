from django.db import models


class AcademicSession(models.Model):
    name = models.CharField(max_length=100, help_text="e.g. 2026-27")
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.name


class Class(models.Model):
    name = models.CharField(max_length=20, help_text="e.g. X-A")
    academic_session = models.ForeignKey(
        AcademicSession, on_delete=models.CASCADE, related_name="classes"
    )
    section = models.CharField(max_length=10, blank=True)

    class Meta:
        verbose_name_plural = "classes"
        unique_together = ("name", "academic_session")

    def __str__(self):
        return f"{self.name} ({self.academic_session.name})"
