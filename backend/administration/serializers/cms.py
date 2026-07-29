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
        read_only_fields = ["id", "uploaded_at"]


class GalleryImagePublicSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = ["id", "image", "label", "caption", "alt_text", "order"]

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


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
