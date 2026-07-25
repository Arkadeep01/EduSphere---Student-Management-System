import json
import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.conf import settings

logger = logging.getLogger(__name__)


class RealtimeManager:
    @classmethod
    def send_notification(cls, user_id: int, notification_data: dict):
        try:
            channel_layer = get_channel_layer()
            if channel_layer is None:
                logger.warning("Channel layer not configured, skipping realtime notification")
                return False

            group_name = f"user_{user_id}_notifications"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "notification.message",
                    "data": notification_data,
                },
            )
            return True
        except Exception as e:
            logger.error(f"Realtime send failed for user {user_id}: {str(e)}")
            return False

    @classmethod
    def broadcast_to_role(cls, role: str, notification_data: dict):
        try:
            channel_layer = get_channel_layer()
            if channel_layer is None:
                return False

            group_name = f"role_{role}_notifications"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "notification.message",
                    "data": notification_data,
                },
            )
            return True
        except Exception as e:
            logger.error(f"Realtime broadcast to role {role} failed: {str(e)}")
            return False

    @classmethod
    def send_unread_count(cls, user_id: int, count: int):
        try:
            channel_layer = get_channel_layer()
            if channel_layer is None:
                return False

            group_name = f"user_{user_id}_notifications"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "unread.count",
                    "data": {"unread_count": count},
                },
            )
            return True
        except Exception as e:
            logger.error(f"Realtime unread count send failed for user {user_id}: {str(e)}")
            return False