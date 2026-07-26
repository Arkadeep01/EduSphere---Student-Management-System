from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsDirector
from administration.services.director_admin import DirectorAdminService
from administration.serializers.director import (
    DirectorUserSerializer,
    DirectorCreateAdminSerializer,
    DirectorCreateStaffSerializer,
)


class DirectorAdminListView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request):
        admins = DirectorAdminService.list_admins()
        serializer = DirectorUserSerializer(admins, many=True)
        return Response(serializer.data)


class DirectorAdminCreateView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def post(self, request):
        ser = DirectorCreateAdminSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        user = DirectorAdminService.create_admin(ser.validated_data)
        serializer = DirectorUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DirectorStaffListView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request):
        staff = DirectorAdminService.list_staff()
        serializer = DirectorUserSerializer(staff, many=True)
        return Response(serializer.data)


class DirectorStaffCreateView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def post(self, request):
        ser = DirectorCreateStaffSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        user = DirectorAdminService.create_staff(ser.validated_data)
        serializer = DirectorUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DirectorToggleActiveView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def post(self, request, user_id):
        user = DirectorAdminService.toggle_active(user_id)
        serializer = DirectorUserSerializer(user)
        return Response(serializer.data)


class DirectorChangeRoleView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def post(self, request, user_id):
        new_role = request.data.get("role")
        try:
            user = DirectorAdminService.change_role(user_id, new_role)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = DirectorUserSerializer(user)
        return Response(serializer.data)