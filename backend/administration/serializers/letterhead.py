from rest_framework import serializers
from administration.models.letterhead import Letterhead


class LetterheadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Letterhead
        fields = [
            "id", "name", "status", "is_default", "branding",
            "logo", "banner", "header_spacing", "footer_spacing",
            "left_margin", "right_margin", "primary_color", "secondary_color",
            "footer_text", "watermark_text", "signature_placeholder",
            "school_seal_placeholder", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
