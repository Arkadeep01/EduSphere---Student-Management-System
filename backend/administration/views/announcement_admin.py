from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsDirector
from administration.services.announcement import PublicAnnouncementService
from administration.serializers.announcement import PublicAnnouncementSerializer


class PublicAnnouncementListView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request):
        announcements = PublicAnnouncementService.list_all()
        serializer = PublicAnnouncementSerializer(announcements, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PublicAnnouncementSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        obj = PublicAnnouncementService.create(serializer.validated_data)
        result = PublicAnnouncementSerializer(obj)
        return Response(result.data, status=status.HTTP_201_CREATED)


class PublicAnnouncementDetailView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request, announcement_id):
        obj = PublicAnnouncementService.get(announcement_id)
        serializer = PublicAnnouncementSerializer(obj)
        return Response(serializer.data)

    def patch(self, request, announcement_id):
        serializer = PublicAnnouncementSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        obj = PublicAnnouncementService.update(announcement_id, serializer.validated_data)
        result = PublicAnnouncementSerializer(obj)
        return Response(result.data)

    def delete(self, request, announcement_id):
        PublicAnnouncementService.delete(announcement_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
