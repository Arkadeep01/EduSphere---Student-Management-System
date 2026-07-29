from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ("create", "Create"),
        ("update", "Update"),
        ("delete", "Delete"),
        ("login", "Login"),
        ("logout", "Logout"),
        ("export", "Export"),
        ("upload", "Upload"),
        ("download", "Download"),
        ("rate_limit_exceeded", "Rate Limit Exceeded"),
        ("access_denied", "Access Denied"),
        ("fee_correction", "Fee Correction"),
        ("fee_refund", "Fee Refund"),
        ("promotion", "Promotion"),
        ("rollback", "Rollback"),
        ("result_publish", "Result Published"),
        ("rechecking", "Rechecking"),
        ("role_change", "Role Change"),
        ("deactivation", "Deactivation"),
        ("github_linked", "GitHub Account Linked"),
        ("github_unlinked", "GitHub Account Unlinked"),
        ("github_login_failed_unbound", "GitHub Login Failed - Unbound Account"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} {self.model_name} by {self.user} at {self.created_at}"
