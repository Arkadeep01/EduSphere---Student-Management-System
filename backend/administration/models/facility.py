from django.db import models
from django.conf import settings


class FacilityImage(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to="facilities/")
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "uploaded_at"]
        verbose_name = "Facility Image"
        verbose_name_plural = "Facility Images"

    def __str__(self):
        return self.name