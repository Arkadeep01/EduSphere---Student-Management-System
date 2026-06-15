from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from administration.permissions import IsAdmin
from administration.services.export_service import ExportService
from administration.serializers.export import ExportLogSerializer


class ExportStudentsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        fmt = request.query_params.get("format", "csv")
        data = ExportService.export_students(request.user, fmt)
        return HttpResponse(data, content_type="text/csv")


class ExportTeachersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        fmt = request.query_params.get("format", "csv")
        data = ExportService.export_teachers(request.user, fmt)
        return HttpResponse(data, content_type="text/csv")


class ExportAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        fmt = request.query_params.get("format", "csv")
        data = ExportService.export_attendance(request.user, fmt)
        return HttpResponse(data, content_type="text/csv")
