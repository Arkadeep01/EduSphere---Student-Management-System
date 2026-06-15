from rest_framework import serializers
from administration.models.notification import NotificationBroadcast


class NotificationBroadcastSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationBroadcast
        fields = "__all__"
