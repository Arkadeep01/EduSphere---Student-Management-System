from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.student_admin import StudentAdminService
from student.models import StudentProfile, StudentSubject, Subject
from student.serializers import StudentProfileSerializer
from administration.serializers.admission import StudentRegistrationLogSerializer


class StudentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        filters = {}
        if request.query_params.get("class_name"):
            filters["class_name"] = request.query_params["class_name"]
        if request.query_params.get("search"):
            filters["search"] = request.query_params["search"]
        students = StudentAdminService.list_students(filters)
        serializer = StudentProfileSerializer(students, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Admin creating a student profile (user should exist or be created)
        data = request.data
        user = request.user
        profile = StudentAdminService.create_student(user, data)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_id):
        student = StudentAdminService.get_student_detail(student_id)
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)

    def patch(self, request, student_id):
        student = StudentAdminService.update_student(student_id, request.data)
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)


class StudentSubjectApprovalView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, student_id):
        subject_ids = request.data.get("subject_ids", [])
        StudentAdminService.approve_subject_requests(student_id, subject_ids)
        return Response({"status": "approved"})


class StudentSubjectAssignmentView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, student_id):
        subject_ids = request.data.get("subject_ids", [])
        StudentAdminService.assign_subjects(student_id, subject_ids)
        return Response({"status": "assigned"})


class StudentNotificationsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_id):
        notifications = StudentAdminService.get_notifications(student_id)
        from student.serializers import NotificationSerializer
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def post(self, request, student_id):
        title = request.data.get("title", "Notification")
        message = request.data.get("message", "")
        StudentAdminService.send_notification(student_id, title, message)
        return Response({"status": "sent"})


class StudentDocumentsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_id):
        docs = StudentAdminService.get_student_documents(student_id)
        from student.serializers import AdmissionDocumentSerializer
        serializer = AdmissionDocumentSerializer(docs, many=True)
        return Response(serializer.data)
