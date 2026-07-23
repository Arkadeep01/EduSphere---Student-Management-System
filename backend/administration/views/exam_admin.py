from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone

from administration.permissions import IsAdmin
from administration.services.exam_admin import ExamAdminService
from administration.serializers.exam import (
    ExamSerializer,
    AnswerScriptUploadSerializer,
    EvaluationTrackingSerializer,
    PublishedResultSerializer,
)
from administration.models import AnswerScriptUpload
from administration.models.audit_log import AuditLog
from administration.models.notification import NotificationBroadcast


class ExamListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        exams = ExamAdminService.list_exams()
        serializer = ExamSerializer(exams, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        exam = ExamAdminService.create_exam(data, request.user)
        serializer = ExamSerializer(exam)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ExamPublishView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, exam_id):
        exam = ExamAdminService.update_exam_status(exam_id, "published")
        serializer = ExamSerializer(exam)
        return Response(serializer.data)


class ExamArchiveView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, exam_id):
        exam = ExamAdminService.update_exam_status(exam_id, "archived")
        serializer = ExamSerializer(exam)
        return Response(serializer.data)


class AnswerScriptUploadView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        data = request.data
        script = ExamAdminService.upload_answer_script(data, request.user)
        serializer = AnswerScriptUploadSerializer(script)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EvaluationTrackingView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = ExamAdminService.get_evaluation_tracking()
        serializer = EvaluationTrackingSerializer(data, many=True)
        return Response(serializer.data)


class PublishedResultCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        data = request.data
        result = ExamAdminService.publish_result(data, request.user)
        serializer = PublishedResultSerializer(result)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ExamAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = ExamAdminService.get_exam_analytics()
        return Response(data)


class AdminStaffUploadBatchesView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get("status")
        qs = AnswerScriptUpload.objects.exclude(batch_id="").values("batch_id").distinct()
        if status_filter:
            qs = AnswerScriptUpload.objects.filter(upload_status=status_filter).exclude(batch_id="")
            qs = qs.values("batch_id").distinct()
        batches = []
        for entry in qs:
            bid = entry["batch_id"]
            scripts = AnswerScriptUpload.objects.filter(batch_id=bid)
            first = scripts.first()
            batches.append({
                "batch_id": bid,
                "exam_name": first.exam.name if first else "",
                "subject_name": first.subject.name if first else "",
                "total": scripts.count(),
                "uploaded": scripts.filter(upload_status="uploaded").count(),
                "verified": scripts.filter(upload_status="verified").count(),
                "rejected": scripts.filter(upload_status="rejected").count(),
                "created_at": first.created_at if first else None,
                "uploaded_by": first.uploaded_by.email if first and first.uploaded_by else None,
            })
        batches.sort(key=lambda b: b["created_at"] or "", reverse=True)
        return Response(batches)


# ---- Staff Upload Verification (Admin) ----

class AdminVerifyBatchView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, batch_id):
        now = timezone.now()
        scripts = AnswerScriptUpload.objects.filter(batch_id=batch_id, upload_status="uploaded")
        count = scripts.update(
            upload_status="verified",
            verified_by=request.user,
            verified_at=now,
        )
        AuditLog.objects.create(
            action="update",
            model_name="AnswerScriptUpload",
            object_id=batch_id,
            user=request.user,
            description=f"Admin verified batch {batch_id} ({count} scripts)",
        )
        NotificationBroadcast.objects.create(
            title="Batch Verified",
            message=f"Admin verified batch {batch_id} ({count} scripts).",
            sent_by=request.user,
            recipient_type="all_teachers",
            status="sent",
            sent_at=now,
        )
        return Response({"batch_id": batch_id, "verified_count": count})


class AdminRejectBatchView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, batch_id):
        reason = request.data.get("reason", "Rejected by admin")
        now = timezone.now()
        scripts = AnswerScriptUpload.objects.filter(batch_id=batch_id, upload_status="uploaded")
        count = scripts.update(
            upload_status="rejected",
            verified_by=request.user,
            verified_at=now,
            verification_notes=reason,
        )
        AuditLog.objects.create(
            action="update",
            model_name="AnswerScriptUpload",
            object_id=batch_id,
            user=request.user,
            description=f"Admin rejected batch {batch_id} ({count} scripts): {reason}",
        )
        NotificationBroadcast.objects.create(
            title="Batch Rejected",
            message=f"Admin rejected batch {batch_id}. Reason: {reason}",
            sent_by=request.user,
            recipient_type="all_teachers",
            status="sent",
            sent_at=now,
        )
        return Response({"batch_id": batch_id, "rejected_count": count})


class AdminAssignScriptsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        script_ids = request.data.get("script_ids", [])
        teacher_id = request.data.get("teacher_id")
        if not script_ids or not teacher_id:
            return Response(
                {"detail": "script_ids and teacher_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from teacher.models import TeacherProfile
        try:
            teacher = TeacherProfile.objects.get(id=teacher_id)
        except TeacherProfile.DoesNotExist:
            return Response({"detail": "Teacher not found."}, status=status.HTTP_404_NOT_FOUND)
        count = AnswerScriptUpload.objects.filter(
            id__in=script_ids, upload_status="verified"
        ).update(teacher=teacher, upload_status="assigned")
        AuditLog.objects.create(
            action="update",
            model_name="AnswerScriptUpload",
            object_id=",".join(str(s) for s in script_ids),
            user=request.user,
            description=f"Admin assigned {count} scripts to teacher {teacher.user.email}",
        )
        NotificationBroadcast.objects.create(
            title="Scripts Assigned for Evaluation",
            message=f"{count} answer scripts assigned to you for evaluation.",
            sent_by=request.user,
            recipient_type="all_teachers",
            status="sent",
            sent_at=timezone.now(),
        )
        return Response({"assigned_count": count})
