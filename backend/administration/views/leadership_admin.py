from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsDirector
from administration.services.leadership import LeadershipService
from administration.serializers.leadership import LeadershipSerializer


class LeadershipListView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request):
        leaders = LeadershipService.list_all()
        serializer = LeadershipSerializer(leaders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LeadershipSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        obj = LeadershipService.create(serializer.validated_data)
        result = LeadershipSerializer(obj)
        return Response(result.data, status=status.HTTP_201_CREATED)


class LeadershipDetailView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request, leader_id):
        obj = LeadershipService.get(leader_id)
        serializer = LeadershipSerializer(obj)
        return Response(serializer.data)

    def patch(self, request, leader_id):
        serializer = LeadershipSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        obj = LeadershipService.update(leader_id, serializer.validated_data)
        result = LeadershipSerializer(obj)
        return Response(result.data)

    def delete(self, request, leader_id):
        LeadershipService.delete(leader_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
