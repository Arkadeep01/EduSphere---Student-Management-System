from rest_framework import serializers
from administration.models.cms import (
    GalleryImage,
    HomepageFeaturedImage,
    AboutPageContent,
    AdmissionPageContent,
)


class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = "__all__"


class HomepageFeaturedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageFeaturedImage
        fields = "__all__"


class AboutPageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPageContent
        fields = "__all__"


class AdmissionPageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionPageContent
        fields = "__all__"
