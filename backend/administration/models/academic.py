from django.db import models


class AcademicSession(models.Model):
    name = models.CharField(max_length=100, help_text="e.g. 2026-27")
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False, help_text="Archived sessions are read-only")
    subject_request_enabled = models.BooleanField(default=True, help_text="Enable/disable subject requests for this session")
    subject_request_deadline = models.DateTimeField(blank=True, null=True, help_text="Deadline for subject requests")

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
    capacity = models.IntegerField(default=0, help_text="Maximum student capacity")
    effective_from = models.DateField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "classes"
        unique_together = ("name", "academic_session")

    def __str__(self):
        return f"{self.name} ({self.academic_session.name})"


class ClassSubjectConfig(models.Model):
    """Per-class subject configuration: limits and available subjects."""
    class_name = models.CharField(max_length=20, help_text="e.g. X-A")
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE, related_name="class_subject_configs")
    max_additional_subjects = models.IntegerField(default=2, help_text="Maximum additional subjects per student")
    max_specialized = models.IntegerField(default=2, help_text="Maximum specialized subjects")
    max_enriched = models.IntegerField(default=2, help_text="Maximum enriched subjects")
    subjects = models.ManyToManyField("student.Subject", blank=True, related_name="class_configs", help_text="Available subjects for this class")

    class Meta:
        unique_together = ("class_name", "academic_session")
        verbose_name = "Class Subject Configuration"

    def __str__(self):
        return f"{self.class_name} Config ({self.academic_session.name})"
