from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.class_admin import ClassAdminService


class ClassListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        classes = ClassAdminService.list_classes()
        return Response(classes)

    def post(self, request):
        data = request.data
        result = ClassAdminService.create_class(
            name=data.get("name"),
            sections=data.get("sections", []),
            capacity=data.get("capacity", 40),
            academic_year=data.get("academic_year", "2026-27"),
        )
        return Response(result, status=status.HTTP_201_CREATED)


class ClassDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, class_name):
        detail = ClassAdminService.get_class_detail(class_name)
        return Response(detail)
