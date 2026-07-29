from rest_framework import serializers
from administration.models.leadership import Leadership


class LeadershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leadership
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class LeadershipPublicSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Leadership
        fields = ["id", "name", "designation", "image", "quote", "order"]

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
