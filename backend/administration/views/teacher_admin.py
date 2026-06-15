from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.teacher_admin import TeacherAdminService
from teacher.models import TeacherProfile
from teacher.serializers import TeacherProfileSerializer
from administration.serializers.teacher import (
    ClassTeacherAssignmentSerializer,
    TeacherSubjectAllocationSerializer,
)


class TeacherListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        teachers = TeacherAdminService.list_teachers()
        serializer = TeacherProfileSerializer(teachers, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        user = request.user
        profile = TeacherAdminService.create_teacher(user, data)
        serializer = TeacherProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TeacherDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, teacher_id):
        teacher = TeacherAdminService.get_teacher_detail(teacher_id)
        serializer = TeacherProfileSerializer(teacher)
        return Response(serializer.data)

    def patch(self, request, teacher_id):
        data = request.data
        teacher = TeacherProfile.objects.get(id=teacher_id)
        if "employee_id" in data:
            teacher.employee_id = data["employee_id"]
        if "qualification" in data:
            teacher.qualification = data["qualification"]
        if "experience" in data:
            teacher.experience = data["experience"]
        teacher.save()
        serializer = TeacherProfileSerializer(teacher)
        return Response(serializer.data)


class TeacherNotifyView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, teacher_id):
        title = request.data.get("title", "Notification")
        message = request.data.get("message", "")
        TeacherAdminService.send_notification(teacher_id, title, message)
        return Response({"status": "sent"})


class TeacherAssignClassTeacherView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, teacher_id):
        class_name = request.data.get("class_name")
        academic_year = request.data.get("academic_year", "2026-27")
        obj = TeacherAdminService.assign_class_teacher(teacher_id, class_name, academic_year)
        serializer = ClassTeacherAssignmentSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TeacherAllocateSubjectView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, teacher_id):
        subject_id = request.data.get("subject_id")
        assigned_classes = request.data.get("assigned_classes", [])
        academic_year = request.data.get("academic_year", "2026-27")
        obj = TeacherAdminService.allocate_subject(teacher_id, subject_id, assigned_classes, academic_year)
        serializer = TeacherSubjectAllocationSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TeacherAssignClassView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, teacher_id):
        class_name = request.data.get("class_name")
        from teacher.services import assign_class_to_teacher
        teacher = TeacherProfile.objects.get(id=teacher_id)
        obj = assign_class_to_teacher(teacher, class_name)
        return Response({"status": "assigned", "class_name": obj.class_name})


class TeacherAllocationsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        allocations = TeacherAdminService.get_allocations()
        serializer = TeacherSubjectAllocationSerializer(allocations, many=True)
        return Response(serializer.data)


class TeacherClassTeacherAssignmentsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        assignments = TeacherAdminService.get_class_teacher_assignments()
        serializer = ClassTeacherAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
