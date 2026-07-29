from rest_framework import serializers
from administration.models.announcement import PublicAnnouncement


class PublicAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicAnnouncement
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class PublicAnnouncementPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicAnnouncement
        fields = ["id", "title", "content", "published_at"]
