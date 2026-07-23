from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated

from administration.models import AnswerScriptUpload, Exam
from student.models import Subject
from .permissions import IsStaff
from .serializers import (
    StaffDashboardSerializer,
    StaffBatchSerializer,
    StaffAnswerScriptUploadSerializer,
    StaffProfileSerializer,
)
from .selectors import (
    get_staff_dashboard_data,
    get_upload_tasks,
    get_upload_history,
    get_rejected_uploads,
    get_staff_profile,
)
from .services import (
    create_upload_batch,
    upload_answer_script,
    replace_uploaded_file,
    delete_upload,
)


class StaffDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        data = get_staff_dashboard_data(request.user)
        serializer = StaffDashboardSerializer(data)
        return Response(serializer.data)


class StaffUploadTasksView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        tasks = get_upload_tasks(request.user)
        batches = {}
        for t in tasks:
            bid = t.batch_id or "ungrouped"
            if bid not in batches:
                batches[bid] = {
                    "batch_id": bid,
                    "exam_name": t.exam.name,
                    "subject_name": t.subject.name,
                    "total": 0,
                    "uploaded": 0,
                    "verified": 0,
                    "rejected": 0,
                    "created_at": t.created_at,
                }
            batches[bid]["total"] += 1
            if t.upload_status == "uploaded":
                batches[bid]["uploaded"] += 1
            elif t.upload_status == "verified":
                batches[bid]["verified"] += 1
            elif t.upload_status == "rejected":
                batches[bid]["rejected"] += 1
        serializer = StaffBatchSerializer(list(batches.values()), many=True)
        return Response(serializer.data)

    def post(self, request):
        exam_id = request.data.get("exam")
        subject_id = request.data.get("subject")
        scripts = request.data.get("scripts", [])
        if not exam_id or not subject_id or not scripts:
            return Response(
                {"detail": "exam, subject, and scripts are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from student.models import StudentProfile
        from administration.models import Exam
        try:
            exam = Exam.objects.get(id=exam_id)
            subject = Subject.objects.get(id=subject_id)
        except Exception:
            return Response({"detail": "Invalid exam or subject."}, status=status.HTTP_400_BAD_REQUEST)
        script_data_list = []
        for s in scripts:
            student = StudentProfile.objects.filter(id=s.get("student_id")).first()
            if not student:
                continue
            script_data_list.append({
                "student": student,
                "script_file": s.get("script_file"),
                "section": s.get("section", ""),
                "roll_number": s.get("roll_number", ""),
                "registration_number": s.get("registration_number", ""),
                "script_number": s.get("script_number", ""),
            })
        if not script_data_list:
            return Response(
                {"detail": "No valid students provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        batch_id, created_scripts = create_upload_batch(exam, subject, script_data_list, request.user)
        return Response(
            {"batch_id": batch_id, "count": len(created_scripts)},
            status=status.HTTP_201_CREATED,
        )


class StaffUploadView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        exam_id = request.query_params.get("exam")
        subject_id = request.query_params.get("subject")
        qs = AnswerScriptUpload.objects.select_related(
            "exam", "subject", "student__user"
        ).filter(upload_status="pending_upload")
        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        serializer = StaffAnswerScriptUploadSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        pk = request.data.get("script_id")
        script_file = request.FILES.get("script_file")
        if not pk or not script_file:
            return Response(
                {"detail": "script_id and script_file are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            script = AnswerScriptUpload.objects.get(id=pk, upload_status="pending_upload")
        except AnswerScriptUpload.DoesNotExist:
            return Response(
                {"detail": "Script not found or already uploaded."},
                status=status.HTTP_404_NOT_FOUND,
            )
        script = upload_answer_script(script, script_file, request.user)
        serializer = StaffAnswerScriptUploadSerializer(script)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StaffUploadDetailView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk):
        try:
            script = AnswerScriptUpload.objects.select_related(
                "exam", "subject", "student__user"
            ).get(id=pk, uploaded_by=request.user)
        except AnswerScriptUpload.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = StaffAnswerScriptUploadSerializer(script)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            script = AnswerScriptUpload.objects.get(id=pk, uploaded_by=request.user)
        except AnswerScriptUpload.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        new_file = request.FILES.get("script_file")
        if new_file:
            script = replace_uploaded_file(script, new_file, request.user)
        serializer = StaffAnswerScriptUploadSerializer(script)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            script = AnswerScriptUpload.objects.get(id=pk, uploaded_by=request.user)
        except AnswerScriptUpload.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        delete_upload(script, request.user)
        return Response({"detail": "Upload deleted."}, status=status.HTTP_200_OK)


class StaffUploadHistoryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        status_filter = request.query_params.get("status")
        qs = get_upload_history(request.user)
        if status_filter:
            qs = qs.filter(upload_status=status_filter)
        serializer = StaffAnswerScriptUploadSerializer(qs, many=True)
        return Response(serializer.data)


class StaffRejectedUploadsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        qs = get_rejected_uploads(request.user)
        serializer = StaffAnswerScriptUploadSerializer(qs, many=True)
        return Response(serializer.data)


class StaffProfileView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        profile = get_staff_profile(request.user)
        serializer = StaffProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = get_staff_profile(request.user)
        serializer = StaffProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
