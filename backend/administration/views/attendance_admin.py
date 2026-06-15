from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from administration.permissions import IsAdmin
from administration.services.attendance_admin import AttendanceAdminService


class AttendanceAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = AttendanceAdminService.get_analytics()
        return Response(data)


class FacultyAttendanceListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = AttendanceAdminService.get_faculty_attendance()
        return Response(data)


class FacultyAttendanceMarkView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        teacher_id = request.data.get("teacher_id")
        status_val = request.data.get("status")
        fa = AttendanceAdminService.mark_faculty_attendance(teacher_id, status_val, request.user)
        return Response({"status": fa.status, "teacher_id": teacher_id})
