import os
import uuid

from django.db import models
from django.conf import settings


SLOT_DIR_MAP = {
    "home_hero": "website/home",
    "home_collage_1": "website/home",
    "home_collage_2": "website/home",
    "home_collage_3": "website/home",
    "about_hero": "website/about",
    "about_video_thumbnail": "website/about",
    "contact_hero": "website/contact",
    "facilities_hero": "website/facilities",
}


def website_image_upload_to(instance, filename):
    dir_name = SLOT_DIR_MAP.get(instance.slot, "website/other")
    ext = os.path.splitext(filename)[1].lower()
    safe_root = uuid.uuid4().hex
    return f"{dir_name}/{safe_root}{ext}"


class WebsiteImage(models.Model):
    class Slot(models.TextChoices):
        HOME_HERO = "home_hero", "Home Hero"
        HOME_COLLAGE_1 = "home_collage_1", "Home Collage 1"
        HOME_COLLAGE_2 = "home_collage_2", "Home Collage 2"
        HOME_COLLAGE_3 = "home_collage_3", "Home Collage 3"
        ABOUT_HERO = "about_hero", "About Hero"
        ABOUT_VIDEO_THUMBNAIL = "about_video_thumbnail", "About Video Thumbnail"
        CONTACT_HERO = "contact_hero", "Contact Hero"
        FACILITIES_HERO = "facilities_hero", "Facilities Hero"

    slot = models.CharField(
        max_length=50,
        choices=Slot.choices,
        unique=True,
        verbose_name="Website Slot",
        help_text="Each slot can have at most one active image.",
    )
    image = models.ImageField(upload_to=website_image_upload_to)
    alt_text = models.CharField(max_length=255, blank=True, help_text="Alt text for accessibility")
    is_active = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Website Image"
        verbose_name_plural = "Website Images"

    def __str__(self):
        return self.get_slot_display()