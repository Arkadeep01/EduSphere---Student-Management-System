from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.admission_admin import AdmissionAdminService
from administration.serializers.admission import (
    AdmissionApplicationSerializer,
    StudentRegistrationLogSerializer,
)


class AdmissionApplicationListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        filters = {}
        if request.query_params.get("status"):
            filters["status"] = request.query_params["status"]
        if request.query_params.get("search"):
            filters["search"] = request.query_params["search"]
        apps = AdmissionAdminService.list_applications(filters)
        serializer = AdmissionApplicationSerializer(apps, many=True)
        return Response(serializer.data)


class AdmissionApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, application_id):
        from administration.models.admission import AdmissionApplication
        app = AdmissionApplication.objects.get(id=application_id)
        serializer = AdmissionApplicationSerializer(app)
        return Response(serializer.data)


class AdmissionApplicationApproveView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, application_id):
        app = AdmissionAdminService.approve_application(application_id)
        serializer = AdmissionApplicationSerializer(app)
        return Response(serializer.data)


class AdmissionApplicationRejectView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, application_id):
        app = AdmissionAdminService.reject_application(application_id)
        serializer = AdmissionApplicationSerializer(app)
        return Response(serializer.data)


class AdmissionCreateStudentView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, application_id):
        # In a real scenario, you'd create a user account first
        user = request.user
        profile = AdmissionAdminService.create_student_account(application_id, user)
        serializer = StudentRegistrationLogSerializer(
            profile.registration_logs.first()
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdmissionStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = AdmissionAdminService.get_stats()
        return Response(data)
