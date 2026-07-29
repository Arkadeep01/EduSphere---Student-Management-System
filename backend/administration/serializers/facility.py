from rest_framework import serializers
from administration.models.facility import FacilityImage


class FacilityImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacilityImage
        fields = "__all__"
        read_only_fields = ["id", "uploaded_at", "uploaded_by"]


class FacilityImagePublicSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = FacilityImage
        fields = ["id", "name", "image", "description", "order"]

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None