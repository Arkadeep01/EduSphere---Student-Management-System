from django.db import models

from administration.models.cms import (
    AboutPageContent,
    GalleryImage,
    HomepageFeaturedImage,
    AdmissionPageContent,
)


class CMSService:
    @staticmethod
    def get_about():
        obj, _ = AboutPageContent.objects.get_or_create(pk=1)
        return obj

    @staticmethod
    def update_about(data):
        obj, _ = AboutPageContent.objects.get_or_create(pk=1)
        for key, value in data.items():
            setattr(obj, key, value)
        obj.save()
        return obj

    @staticmethod
    def list_gallery():
        return GalleryImage.objects.all().order_by("order", "-uploaded_at")

    @staticmethod
    def add_gallery_image(image, label):
        max_order = GalleryImage.objects.aggregate(models.Max("order"))["order__max"] or 0
        return GalleryImage.objects.create(image=image, label=label, order=max_order + 1)

    @staticmethod
    def delete_gallery_image(image_id):
        GalleryImage.objects.get(id=image_id).delete()

    @staticmethod
    def reorder_gallery(image_id, new_order):
        img = GalleryImage.objects.get(id=image_id)
        img.order = new_order
        img.save()
        return img

    @staticmethod
    def list_homepage_images():
        return HomepageFeaturedImage.objects.all().order_by("order", "-uploaded_at")

    @staticmethod
    def add_homepage_image(image, label):
        max_order = HomepageFeaturedImage.objects.aggregate(models.Max("order"))["order__max"] or 0
        return HomepageFeaturedImage.objects.create(image=image, label=label, order=max_order + 1)

    @staticmethod
    def delete_homepage_image(image_id):
        HomepageFeaturedImage.objects.get(id=image_id).delete()

    @staticmethod
    def get_admission_page():
        obj, _ = AdmissionPageContent.objects.get_or_create(pk=1)
        return obj

    @staticmethod
    def update_admission_page(data):
        obj, _ = AdmissionPageContent.objects.get_or_create(pk=1)
        for key, value in data.items():
            setattr(obj, key, value)
        obj.save()
        return obj
