from django.db import models


class Leadership(models.Model):
    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    image = models.ImageField(upload_to="leadership/", blank=True, null=True)
    quote = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "created_at"]
        verbose_name = "Leadership"
        verbose_name_plural = "Leadership"

    def __str__(self):
        return f"{self.name} — {self.designation}"
