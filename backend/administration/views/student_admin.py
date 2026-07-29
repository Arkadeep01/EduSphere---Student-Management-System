from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import serializers as drf_serializers

from administration.permissions import IsAdmin
from administration.permissions.combined import IsAdminOrDirector
from administration.services.student_admin import StudentAdminService
from student.models import StudentProfile, StudentSubject, Subject
from student.serializers import StudentProfileSerializer, StudentSubjectSerializer
from administration.serializers.admission import StudentRegistrationLogSerializer
from authentication.models import CustomUser


class AdminStudentCreateSerializer(drf_serializers.Serializer):
    email = drf_serializers.EmailField()
    first_name = drf_serializers.CharField(max_length=150, default="", allow_blank=True)
    last_name = drf_serializers.CharField(max_length=150, default="", allow_blank=True)
    mobile = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    father_name = drf_serializers.CharField(max_length=100, default="", allow_blank=True)
    mother_name = drf_serializers.CharField(max_length=100, default="", allow_blank=True)
    date_of_birth = drf_serializers.DateField(required=False, allow_null=True)
    class_assigned = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    section = drf_serializers.CharField(max_length=10, default="", allow_blank=True)
    address = drf_serializers.CharField(default="", allow_blank=True)
    gender = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    blood_group = drf_serializers.CharField(max_length=10, default="", allow_blank=True)
    roll_number = drf_serializers.CharField(max_length=20, default="", allow_blank=True)
    admission_number = drf_serializers.CharField(max_length=20, default="", allow_blank=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if CustomUser.objects.filter(email=email).exists():
            raise drf_serializers.ValidationError("A user with this email already exists.")
        return email


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
        from student.provisioning import StudentProvisioningService
        ser = AdminStudentCreateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        user, profile = StudentProvisioningService.create_student(ser.validated_data)
        result_ser = StudentProfileSerializer(profile)
        return Response(result_ser.data, status=status.HTTP_201_CREATED)


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
    permission_classes = [IsAuthenticated, IsAdminOrDirector]

    def get(self, request, student_id):
        notifications = StudentAdminService.get_notifications(student_id)
        if notifications is None:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        from student.serializers import NotificationSerializer
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def post(self, request, student_id):
        title = request.data.get("title", "Notification")
        message = request.data.get("message", "")
        result = StudentAdminService.send_notification(student_id, title, message)
        if result is None:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"status": "sent"})


class StudentDocumentsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_id):
        docs = StudentAdminService.get_student_documents(student_id)
        from student.serializers import AdmissionDocumentSerializer
        serializer = AdmissionDocumentSerializer(docs, many=True)
        return Response(serializer.data)


class PendingSubjectRequestsListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        class_name = request.query_params.get("class_name")
        qs = StudentAdminService.get_subject_requests()
        if class_name:
            qs = qs.filter(student__class_assigned__startswith=class_name)
        data = []
        for sr in qs:
            data.append({
                "id": sr.id,
                "student_id": sr.student.id,
                "student_name": sr.student.user.get_full_name() or sr.student.user.email,
                "roll_number": sr.student.roll_number or "",
                "class_assigned": sr.student.class_assigned,
                "section": sr.student.section,
                "subject_id": sr.subject.id,
                "subject_name": sr.subject.name,
                "subject_code": sr.subject.code,
                "subject_category": sr.subject.tier,
                "requested_on": sr.created_at.isoformat(),
                "status": sr.status,
            })
        return Response(data)


class StudentSubjectRejectView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, student_id):
        subject_ids = request.data.get("subject_ids", [])
        reason = request.data.get("reason", "")
        StudentAdminService.reject_subject_requests(student_id, subject_ids, reason)
        return Response({"status": "rejected"})


class StudentDeactivateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, student_id):
        remark = request.data.get("remark", "").strip()
        if not remark:
            return Response({"error": "Remark is required for deactivation."}, status=status.HTTP_400_BAD_REQUEST)
        StudentAdminService.deactivate_student(student_id, remark, request.user)
        return Response({"status": "deactivated", "remark": remark})


class ClassSubjectConfigView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from administration.models.academic import ClassSubjectConfig
        class_name = request.query_params.get("class_name")
        session_id = request.query_params.get("session_id")
        qs = ClassSubjectConfig.objects.select_related("academic_session").prefetch_related("subjects")
        if class_name:
            qs = qs.filter(class_name=class_name)
        if session_id:
            qs = qs.filter(academic_session_id=session_id)
        data = []
        for cfg in qs:
            data.append({
                "id": cfg.id,
                "class_name": cfg.class_name,
                "academic_session": cfg.academic_session.name,
                "session_id": cfg.academic_session_id,
                "max_additional_subjects": cfg.max_additional_subjects,
                "max_specialized": cfg.max_specialized,
                "max_enriched": cfg.max_enriched,
                "subjects": [{"id": s.id, "name": s.name, "tier": s.tier, "code": s.code} for s in cfg.subjects.all()],
            })
        return Response(data)

    def post(self, request):
        from administration.models.academic import ClassSubjectConfig
        from administration.models import AcademicSession
        data = request.data
        session = get_object_or_404(AcademicSession, id=data["academic_session_id"])
        cfg, created = ClassSubjectConfig.objects.get_or_create(
            class_name=data["class_name"],
            academic_session=session,
            defaults={
                "max_additional_subjects": data.get("max_additional_subjects", 2),
                "max_specialized": data.get("max_specialized", 2),
                "max_enriched": data.get("max_enriched", 2),
            },
        )
        if not created:
            cfg.max_additional_subjects = data.get("max_additional_subjects", cfg.max_additional_subjects)
            cfg.max_specialized = data.get("max_specialized", cfg.max_specialized)
            cfg.max_enriched = data.get("max_enriched", cfg.max_enriched)
            cfg.save()
        subject_ids = data.get("subject_ids", [])
        if subject_ids:
            cfg.subjects.set(subject_ids)
        return Response({"id": cfg.id, "class_name": cfg.class_name, "created": created}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
