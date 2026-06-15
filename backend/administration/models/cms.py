from django.db import models


class GalleryImage(models.Model):
    image = models.ImageField(upload_to="gallery/")
    label = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    featured = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "uploaded_at"]
        verbose_name = "Gallery Image"
        verbose_name_plural = "Gallery Images"

    def __str__(self):
        return self.label or f"Image #{self.pk}"


class HomepageFeaturedImage(models.Model):
    image = models.ImageField(upload_to="homepage/")
    label = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    starred = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "uploaded_at"]

    def __str__(self):
        return self.label or f"Homepage Image #{self.pk}"


class AboutPageContent(models.Model):
    content = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    video_title = models.CharField(max_length=200, blank=True)
    featured_students = models.JSONField(
        default=list,
        blank=True,
        help_text="List of {name, achievement, class} objects",
    )
    top_students = models.JSONField(
        default=list,
        blank=True,
        help_text="List of {rank, name, class, percentage} objects",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "About Page Content"

    def __str__(self):
        return "About Page Content"


class AdmissionPageContent(models.Model):
    banner_info = models.TextField(blank=True, help_text="Banner text displayed on admission page")
    application_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    intake_capacity = models.IntegerField(default=0)
    important_dates = models.JSONField(
        default=list,
        blank=True,
        help_text="List of {event, date} objects",
    )
    notices = models.JSONField(
        default=list,
        blank=True,
        help_text="List of notice strings",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Admission Page Content"

    def __str__(self):
        return "Admission Page Content"
