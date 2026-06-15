from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from administration.permissions import IsAdmin
from administration.services.dashboard import DashboardService
from administration.serializers.exam import ExamSerializer
from administration.serializers.event import EventSerializer


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = DashboardService.get_summary()
        return Response(data)


class DashboardStudentGrowthView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = DashboardService.get_student_growth()
        return Response(data)


class DashboardAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = DashboardService.get_attendance_data()
        return Response(data)


class DashboardExamPerformanceView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = DashboardService.get_exam_performance()
        return Response(data)
