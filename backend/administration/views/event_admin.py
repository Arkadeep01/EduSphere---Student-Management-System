from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.event_admin import EventAdminService
from administration.serializers.event import EventSerializer


class EventListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        events = EventAdminService.list_events()
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)

    def post(self, request):
        event = EventAdminService.create_event(request.data, request.user)
        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EventDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, event_id):
        event = EventAdminService.list_events().filter(id=event_id).first()
        serializer = EventSerializer(event)
        return Response(serializer.data)

    def patch(self, request, event_id):
        event = EventAdminService.update_event(event_id, request.data)
        serializer = EventSerializer(event)
        return Response(serializer.data)

    def delete(self, request, event_id):
        EventAdminService.delete_event(event_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class EventPublishView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, event_id):
        event = EventAdminService.update_status(event_id, "published")
        serializer = EventSerializer(event)
        return Response(serializer.data)


class EventArchiveView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, event_id):
        event = EventAdminService.update_status(event_id, "archived")
        serializer = EventSerializer(event)
        return Response(serializer.data)
