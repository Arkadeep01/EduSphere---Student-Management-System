from django.db import models
from django.conf import settings


class AdmissionApplication(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    applicant_name = models.CharField(max_length=100)
    applicant_email = models.EmailField()
    father_name = models.CharField(max_length=100, blank=True)
    mother_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    previous_school = models.CharField(max_length=200, blank=True)
    previous_board = models.CharField(max_length=100, blank=True)
    stream = models.CharField(max_length=50, blank=True, help_text="e.g. Science, Commerce, Arts")
    entrance_test_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    entrance_test_total = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    marks_json = models.JSONField(default=list, blank=True, help_text="List of {subject, pass, obtained, total}")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name = "Admission Application"
        verbose_name_plural = "Admission Applications"

    def __str__(self):
        return f"{self.applicant_name} ({self.status})"


class AdmissionVerification(models.Model):
    application = models.OneToOneField(
        AdmissionApplication,
        on_delete=models.CASCADE,
        related_name="verification",
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="admission_verifications",
    )
    verified_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("verified", "Verified"), ("info_requested", "Info Requested")],
        default="pending",
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Admission Verification"
        verbose_name_plural = "Admission Verifications"

    def __str__(self):
        return f"{self.application.applicant_name} – {self.status}"


class StudentRegistrationLog(models.Model):
    student_profile = models.ForeignKey(
        "student.StudentProfile",
        on_delete=models.CASCADE,
        related_name="registration_logs",
    )
    admission_application = models.ForeignKey(
        AdmissionApplication,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="registration_logs",
    )
    registered_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_student_registrations",
    )

    class Meta:
        ordering = ["-registered_at"]
        verbose_name = "Student Registration Log"
        verbose_name_plural = "Student Registration Logs"

    def __str__(self):
        return f"{self.student_profile.user.email} registered on {self.registered_at.date()}"
