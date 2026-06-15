from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.notification_service import NotificationAdminService
from administration.serializers.notification import NotificationBroadcastSerializer


class NotificationBroadcastListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        broadcasts = NotificationAdminService.list_broadcasts()
        serializer = NotificationBroadcastSerializer(broadcasts, many=True)
        return Response(serializer.data)

    def post(self, request):
        broadcast = NotificationAdminService.create_broadcast(request.data, request.user)
        serializer = NotificationBroadcastSerializer(broadcast)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NotificationBroadcastSendView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, broadcast_id):
        broadcast = NotificationAdminService.send_broadcast(broadcast_id)
        serializer = NotificationBroadcastSerializer(broadcast)
        return Response(serializer.data)
