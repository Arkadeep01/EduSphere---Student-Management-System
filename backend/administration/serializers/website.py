from rest_framework import serializers
from administration.models.website import WebsiteImage


class WebsiteImageSerializer(serializers.ModelSerializer):
    slot_display = serializers.CharField(source="get_slot_display", read_only=True)

    class Meta:
        model = WebsiteImage
        fields = ["id", "slot", "slot_display", "image", "alt_text", "is_active", "uploaded_by", "created_at", "updated_at"]
        read_only_fields = ["id", "uploaded_by", "created_at", "updated_at"]


class WebsiteSlotPublicSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return {
            "slot": instance.slot,
            "image_url": instance.image.url if instance.image else None,
            "alt_text": instance.alt_text,
        }


class WebsiteSlotListSerializer(serializers.Serializer):
    def to_representation(self, slots_dict):
        result = {}
        for slot, instance in slots_dict.items():
            if instance and instance.is_active:
                result[slot] = {
                    "image_url": instance.image.url,
                    "alt_text": instance.alt_text,
                }
            else:
                result[slot] = None
        return result