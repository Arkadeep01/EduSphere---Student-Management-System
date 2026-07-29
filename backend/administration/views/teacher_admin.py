from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import serializers as drf_serializers

from administration.permissions import IsAdmin
from administration.permissions.combined import IsAdminOrDirector
from administration.services.teacher_admin import TeacherAdminService
from teacher.models import TeacherProfile
from teacher.serializers import TeacherProfileSerializer
from administration.serializers.teacher import (
    ClassTeacherAssignmentSerializer,
    TeacherSubjectAllocationSerializer,
)
from authentication.models import CustomUser


class AdminTeacherCreateSerializer(drf_serializers.Serializer):
    email = drf_serializers.EmailField()
    first_name = drf_serializers.CharField(max_length=150, default="", allow_blank=True)
    last_name = drf_serializers.CharField(max_length=150, default="", allow_blank=True)
    mobile = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    employee_id = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    date_of_birth = drf_serializers.DateField(required=False, allow_null=True)
    gender = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    phone = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    address = drf_serializers.CharField(default="", allow_blank=True)
    department = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    designation = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    personal_email = drf_serializers.EmailField(default="", allow_blank=True)
    qualification = drf_serializers.CharField(max_length=255, default="", allow_blank=True)
    experience = drf_serializers.IntegerField(required=False, allow_null=True)
    primary_subject = drf_serializers.IntegerField(required=False, allow_null=True)
    secondary_subjects = drf_serializers.ListField(child=drf_serializers.IntegerField(), required=False, default=list)

    def validate_email(self, value):
        email = value.strip().lower()
        if CustomUser.objects.filter(email=email).exists():
            raise drf_serializers.ValidationError("A user with this email already exists.")
        return email


class TeacherListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        teachers = TeacherAdminService.list_teachers()
        serializer = TeacherProfileSerializer(teachers, many=True)
        return Response(serializer.data)


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
    permission_classes = [IsAuthenticated, IsAdminOrDirector]

    def post(self, request, teacher_id):
        title = request.data.get("title", "Notification")
        message = request.data.get("message", "")
        result = TeacherAdminService.send_notification(teacher_id, title, message)
        if result is None:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)
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


class TeacherDeallocateSubjectView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, allocation_id):
        reason = request.data.get("reason", "").strip()
        if not reason:
            return Response({"error": "Reason is required for deallocation."}, status=status.HTTP_400_BAD_REQUEST)
        effective_date = request.data.get("effective_date")
        obj = TeacherAdminService.deallocate_subject(allocation_id, reason, request.user, effective_date)
        from administration.serializers.teacher import TeacherSubjectAllocationSerializer
        serializer = TeacherSubjectAllocationSerializer(obj)
        return Response(serializer.data)


class TeacherDraftAllocationsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        session_id = request.query_params.get("session_id")
        qs = TeacherSubjectAllocation.objects.filter(draft=True).select_related("teacher__user", "subject", "academic_session")
        if session_id:
            qs = qs.filter(academic_session_id=session_id)
        from administration.serializers.teacher import TeacherSubjectAllocationSerializer
        serializer = TeacherSubjectAllocationSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        session_id = request.data.get("session_id")
        action = request.data.get("action", "confirm")
        if action == "confirm":
            from administration.services.session_rollover_service import SessionRolloverService
            count = SessionRolloverService.confirm_draft_allocations(session_id, request.user)
            return Response({"confirmed": count, "status": "confirmed"})
        elif action == "reject":
            qs = TeacherSubjectAllocation.objects.filter(draft=True)
            if session_id:
                qs = qs.filter(academic_session_id=session_id)
            count = qs.count()
            qs.delete()
            return Response({"deleted": count, "status": "rejected"})
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)


class SubjectWithdrawalListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from student.models import SubjectWithdrawalRequest
        status_filter = request.query_params.get("status")
        qs = SubjectWithdrawalRequest.objects.select_related(
            "student__user", "subject", "replacement_subject"
        ).order_by("-created_at")
        if status_filter:
            qs = qs.filter(status=status_filter)
        data = []
        for r in qs:
            data.append({
                "id": r.id,
                "student_name": r.student.user.get_full_name() or r.student.user.email,
                "roll_number": r.student.roll_number or "",
                "class_assigned": r.student.class_assigned,
                "subject_name": r.subject.name,
                "replacement_name": r.replacement_subject.name if r.replacement_subject else None,
                "reason": r.reason,
                "has_marks": r.has_marks,
                "status": r.status,
                "created_at": r.created_at.isoformat(),
            })
        return Response(data)


class SubjectWithdrawalReviewView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, request_id):
        action = request.data.get("action")
        admin_remark = request.data.get("admin_remark", "")
        exceptional_override = request.data.get("exceptional_override", False)

        from student.services import approve_withdrawal, reject_withdrawal

        if action == "approve":
            req = approve_withdrawal(request_id, request.user, admin_remark, exceptional_override)
            return Response({"status": "approved", "id": req.id})
        elif action == "reject":
            req = reject_withdrawal(request_id, request.user, admin_remark)
            return Response({"status": "rejected", "id": req.id})
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)


class TeacherCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        from teacher.provisioning import TeacherProvisioningService
        ser = AdminTeacherCreateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        user, profile = TeacherProvisioningService.create_teacher(ser.validated_data)
        return Response({
            "success": True,
            "message": "Teacher account created. Temporary password set to DOB (DDMMYYYY).",
            "teacher_id": profile.id,
            "email": user.email,
        }, status=status.HTTP_201_CREATED)
