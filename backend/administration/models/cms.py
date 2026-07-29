from django.db import models


class GalleryImage(models.Model):
    image = models.ImageField(upload_to="gallery/")
    label = models.CharField(max_length=100, blank=True)
    caption = models.CharField(max_length=255, blank=True, help_text="Display caption")
    alt_text = models.CharField(max_length=255, blank=True, help_text="Alt text for accessibility")
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
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

    mission = models.TextField(blank=True, help_text="Institution mission statement")
    mission_description = models.TextField(blank=True, help_text="Expanded mission description")
    pillars = models.JSONField(default=list, blank=True, help_text="List of {title, description} pillar objects")
    approach_title = models.CharField(max_length=255, blank=True, help_text="Educational approach title")
    approach_description = models.TextField(blank=True, help_text="Educational approach description")
    foundations = models.JSONField(default=list, blank=True, help_text="List of {title, description} foundation objects")
    milestones = models.JSONField(default=list, blank=True, help_text="List of {year, title, description} milestone objects")

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

    eligibility = models.TextField(blank=True, help_text="Admission eligibility criteria")
    fee_info = models.TextField(blank=True, help_text="Admission fee information")
    reservation_info = models.TextField(blank=True, help_text="Reservation/quota information")
    process_steps = models.JSONField(default=list, blank=True, help_text="List of {step, title, description} admission process steps")
    documents_required = models.JSONField(default=list, blank=True, help_text="List of required document descriptions")
    contact_info = models.TextField(blank=True, help_text="Admission office contact information")

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Admission Page Content"

    def __str__(self):
        return "Admission Page Content"
