from django.db import models
from django.conf import settings


class FeeStructure(models.Model):
    class_name = models.CharField(max_length=20)
    academic_session = models.CharField(max_length=20, default="2026-27")
    late_fine_per_day = models.DecimalField(max_digits=10, decimal_places=2, default=50)
    gst_enabled = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("class_name", "academic_session")
        ordering = ["class_name"]

    def __str__(self):
        return f"Class {self.class_name} – {self.academic_session}"


class FeeComponent(models.Model):
    FREQUENCY_CHOICES = [
        ("monthly", "Monthly"),
        ("annual", "Annual"),
        ("one-time", "One-Time"),
    ]

    structure = models.ForeignKey(
        FeeStructure, on_delete=models.CASCADE, related_name="components"
    )
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    is_optional = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} – ₹{self.amount}"


class StudentFeePayment(models.Model):
    STATUS_CHOICES = [
        ("not_paid", "Not Paid"),
        ("pending_verification", "Pending Verification"),
        ("paid", "Paid"),
        ("rejected", "Rejected"),
    ]
    REFUND_CHOICES = [
        ("none", "None"),
        ("initiated", "Initiated"),
        ("completed", "Completed"),
    ]

    student = models.ForeignKey(
        "student.StudentProfile", on_delete=models.CASCADE, related_name="fee_payments"
    )
    month = models.CharField(max_length=20)
    academic_session = models.CharField(max_length=20, default="2026-27")
    total_fee = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fine = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gst = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    scholarship_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default="not_paid")
    payment_method = models.CharField(max_length=30, blank=True, null=True)
    transaction_ref = models.CharField(max_length=100, blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="verified_payments"
    )
    verified_at = models.DateTimeField(blank=True, null=True)
    receipt_number = models.CharField(max_length=50, blank=True, null=True)
    advance_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    refund_status = models.CharField(max_length=20, choices=REFUND_CHOICES, default="none")
    refund_initiated_at = models.DateTimeField(blank=True, null=True)
    refund_completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "month", "academic_session")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.user.email} – {self.month} ({self.status})"


class StudentScholarship(models.Model):
    TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed"),
    ]

    student = models.ForeignKey(
        "student.StudentProfile", on_delete=models.CASCADE, related_name="scholarships"
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="approved_scholarships"
    )
    approved_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    revoked_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.user.email} – {self.get_type_display()} {self.value}"


class FinanceActivityLog(models.Model):
    ACTION_CHOICES = [
        ("structure_created", "Structure Created"),
        ("structure_updated", "Structure Updated"),
        ("structure_deleted", "Structure Deleted"),
        ("payment_verified", "Payment Verified"),
        ("payment_rejected", "Payment Rejected"),
        ("refund_initiated", "Refund Initiated"),
        ("refund_completed", "Refund Completed"),
        ("scholarship_granted", "Scholarship Granted"),
        ("scholarship_revoked", "Scholarship Revoked"),
        ("offline_payment", "Offline Payment Recorded"),
    ]

    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="finance_logs"
    )
    student = models.ForeignKey(
        "student.StudentProfile", on_delete=models.SET_NULL, null=True, blank=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_action_display()} – {self.created_at.date()}"
