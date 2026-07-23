from django.db import models
from django.conf import settings


class Letterhead(models.Model):
    name = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=[("active", "Active"), ("archived", "Archived")], default="active")
    is_default = models.BooleanField(default=False)
    branding = models.JSONField(default=dict, blank=True)
    logo = models.ImageField(upload_to="letterheads/logos/", blank=True, null=True)
    banner = models.ImageField(upload_to="letterheads/banners/", blank=True, null=True)
    header_spacing = models.IntegerField(default=40)
    footer_spacing = models.IntegerField(default=40)
    left_margin = models.IntegerField(default=20)
    right_margin = models.IntegerField(default=20)
    primary_color = models.CharField(max_length=20, default="#1e40af")
    secondary_color = models.CharField(max_length=20, default="#64748b")
    footer_text = models.TextField(blank=True)
    watermark_text = models.CharField(max_length=100, blank=True)
    signature_placeholder = models.TextField(blank=True)
    school_seal_placeholder = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_letterheads"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "name"]

    def __str__(self):
        return self.name
