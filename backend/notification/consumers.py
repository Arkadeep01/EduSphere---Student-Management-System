import json
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

from notification.models import NotificationRecipient, ReadStatus, NotificationStatus

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = None
        query_string = self.scope.get("query_string", b"").decode()
        params = dict(p.split("=") for p in query_string.split("&") if "=" in p)
        token = params.get("token", None)

        if token:
            try:
                access_token = AccessToken(token)
                user_id = access_token.payload.get("user_id")
                self.user = await database_sync_to_async(User.objects.get)(id=user_id)
            except Exception as e:
                logger.warning(f"WebSocket auth failed: {str(e)}")
                await self.close(code=4001)
                return
        else:
            await self.close(code=4001)
            return

        self.user_group = f"user_{self.user.id}_notifications"
        self.role_group = f"role_{self.user.role}_notifications"

        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.channel_layer.group_add(self.role_group, self.channel_name)

        await self.accept()

        unread_count = await self.get_unread_count()
        await self.send_json({"type": "unread_count", "data": {"count": unread_count}})

    async def disconnect(self, close_code):
        if hasattr(self, "user_group"):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
        if hasattr(self, "role_group"):
            await self.channel_layer.group_discard(self.role_group, self.channel_name)

    async def receive_json(self, content):
        msg_type = content.get("type")

        if msg_type == "mark_read":
            notification_id = content.get("notification_id")
            if notification_id:
                await self.mark_notification_read(notification_id)
                unread = await self.get_unread_count()
                await self.send_json({"type": "unread_count", "data": {"count": unread}})

        elif msg_type == "mark_all_read":
            await self.mark_all_notifications_read()
            unread = await self.get_unread_count()
            await self.send_json({"type": "unread_count", "data": {"count": unread}})

        elif msg_type == "ping":
            await self.send_json({"type": "pong"})

    async def notification_message(self, event):
        await self.send_json({
            "type": "notification",
            "data": event["data"],
        })

    async def unread_count(self, event):
        await self.send_json({
            "type": "unread_count",
            "data": event["data"],
        })

    @database_sync_to_async
    def get_unread_count(self):
        return NotificationRecipient.objects.filter(
            user=self.user,
            read_status=ReadStatus.UNREAD,
            notification__status=NotificationStatus.ACTIVE,
        ).count()

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        NotificationRecipient.objects.filter(
            user=self.user,
            notification_id=notification_id,
        ).update(read_status=ReadStatus.READ, read_at=database_sync_to_async(lambda: None)())

    @database_sync_to_async
    def mark_all_notifications_read(self):
        NotificationRecipient.objects.filter(
            user=self.user,
            read_status=ReadStatus.UNREAD,
        ).update(read_status=ReadStatus.READ, read_at=database_sync_to_async(lambda: None)())