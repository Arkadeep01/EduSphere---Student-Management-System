from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin, IsStaff
from administration.models.rechecking import BlindRecheckingRequest
from administration.models.exam import Exam, PublishedResult
from administration.models.audit_log import AuditLog
from administration.serializers.rechecking import (
    RecheckingRequestListSerializer,
    RecheckingDetailSerializer,
    RecheckingApprovalSerializer,
)
from administration.services.rechecking_service import (
    approve_rechecking_request,
    reject_rechecking_request,
    assign_second_evaluator,
    compare_and_complete,
    close_expired_windows,
)
from teacher.models import TeacherProfile


# ---------------------------------------------------------------------------
# Admin: Rechecking List & Detail
# ---------------------------------------------------------------------------

class AdminRecheckingListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get("status", "")
        search = request.query_params.get("search", "")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))

        qs = BlindRecheckingRequest.objects.select_related(
            "student__user", "exam", "subject"
        ).order_by("-requested_at")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(
                student__user__email__icontains=search
            ) | qs.filter(
                student__user__first_name__icontains=search
            ) | qs.filter(
                exam__name__icontains=search
            ) | qs.filter(
                subject__name__icontains=search
            )

        total = qs.count()
        offset = (page - 1) * page_size
        items = qs[offset:offset + page_size]
        serializer = RecheckingRequestListSerializer(items, many=True)

        return Response({
            "results": serializer.data,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        })


class AdminRecheckingDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, request_id):
        try:
            req = BlindRecheckingRequest.objects.select_related(
                "student__user", "exam", "subject",
                "original_evaluator__user", "second_evaluator__user",
            ).get(id=request_id)
        except BlindRecheckingRequest.DoesNotExist:
            return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = RecheckingDetailSerializer(req)
        return Response(serializer.data)


class AdminRecheckingActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, request_id):
        ser = RecheckingApprovalSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        action = ser.validated_data["action"]

        try:
            if action == "approve":
                req = approve_rechecking_request(
                    request_id,
                    admin_user=request.user,
                    second_evaluator_id=ser.validated_data.get("second_evaluator_id"),
                    policy=ser.validated_data.get("rechecking_policy", "use_policy"),
                )
                serializer = RecheckingDetailSerializer(req)
                return Response(serializer.data)
            elif action == "reject":
                req = reject_rechecking_request(
                    request_id,
                    admin_user=request.user,
                    reason=ser.validated_data.get("reason", ""),
                )
                serializer = RecheckingDetailSerializer(req)
                return Response(serializer.data)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminRecheckingAssignEvaluatorView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, request_id):
        teacher_id = request.data.get("teacher_id")
        if not teacher_id:
            return Response({"detail": "teacher_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            req = assign_second_evaluator(request_id, teacher_id, request.user)
            serializer = RecheckingDetailSerializer(req)
            return Response(serializer.data)
        except (ValueError, TeacherProfile.DoesNotExist) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminRecheckingCompleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, request_id):
        try:
            req = compare_and_complete(request_id, request.user)
            serializer = RecheckingDetailSerializer(req)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminRecheckingCloseExpiredView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        count = close_expired_windows()
        return Response({"closed_count": count, "detail": f"{count} expired request(s) closed."})


class AdminRecheckingStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        total = BlindRecheckingRequest.objects.count()
        pending = BlindRecheckingRequest.objects.filter(status="pending_approval").count()
        approved = BlindRecheckingRequest.objects.filter(status="approved").count()
        re_evaluating = BlindRecheckingRequest.objects.filter(status="re_evaluating").count()
        comparing = BlindRecheckingRequest.objects.filter(status="comparing").count()
        completed = BlindRecheckingRequest.objects.filter(status="completed").count()
        rejected = BlindRecheckingRequest.objects.filter(status="rejected").count()
        closed = BlindRecheckingRequest.objects.filter(status="closed").count()
        revised = BlindRecheckingRequest.objects.filter(is_revised=True).count()

        return Response({
            "total": total,
            "pending_approval": pending,
            "approved": approved,
            "re_evaluating": re_evaluating,
            "comparing": comparing,
            "completed": completed,
            "rejected": rejected,
            "closed": closed,
            "revised": revised,
        })


class AdminEvaluatorListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        teachers = TeacherProfile.objects.select_related("user", "assigned_subject").all()
        data = [
            {
                "id": t.id,
                "email": t.user.email,
                "name": t.user.get_full_name() or t.user.email,
                "subject_name": t.assigned_subject.name if t.assigned_subject else "",
            }
            for t in teachers
        ]
        return Response(data)


# ---------------------------------------------------------------------------
# Staff: Rechecking Overview
# ---------------------------------------------------------------------------

class StaffRecheckingOverviewView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        status_filter = request.query_params.get("status", "")
        search = request.query_params.get("search", "")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))

        qs = BlindRecheckingRequest.objects.select_related(
            "student__user", "exam", "subject"
        ).order_by("-requested_at")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(
                student__user__email__icontains=search
            ) | qs.filter(
                student__user__first_name__icontains=search
            ) | qs.filter(
                exam__name__icontains=search
            )

        total = qs.count()
        offset = (page - 1) * page_size
        items = qs[offset:offset + page_size]
        serializer = RecheckingRequestListSerializer(items, many=True)

        return Response({
            "results": serializer.data,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        })


# ---------------------------------------------------------------------------
# Student: Rechecking
# ---------------------------------------------------------------------------

class StudentRecheckingEligibleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from student.models import StudentProfile
        try:
            student = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        from administration.services.rechecking_service import get_eligible_results_for_student
        data = get_eligible_results_for_student(student)
        return Response(data)


class StudentRecheckingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from student.models import StudentProfile
        try:
            student = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        exam_id = request.data.get("exam_id")
        subject_id = request.data.get("subject_id")
        if not exam_id or not subject_id:
            return Response({"detail": "exam_id and subject_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        from administration.services.rechecking_service import create_rechecking_request
        try:
            req = create_rechecking_request(student, exam_id, subject_id)
            serializer = RecheckingRequestListSerializer(req)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StudentRecheckingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from student.models import StudentProfile
        try:
            student = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        qs = BlindRecheckingRequest.objects.filter(student=student).select_related(
            "exam", "subject"
        ).order_by("-requested_at")
        serializer = RecheckingRequestListSerializer(qs, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Teacher: Blind Rechecking Evaluation
# ---------------------------------------------------------------------------

class TeacherRecheckingQueueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from student.permissions import IsTeacher
        if not IsTeacher().has_permission(request, self):
            return Response({"detail": "Teacher access required."}, status=status.HTTP_403_FORBIDDEN)

        from teacher.models import TeacherProfile
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
        except TeacherProfile.DoesNotExist:
            return Response({"detail": "Teacher profile not found."}, status=status.HTTP_404_NOT_FOUND)

        from administration.services.rechecking_service import get_teacher_rechecking_queue
        queue = get_teacher_rechecking_queue(teacher)
        data = []
        for req in queue:
            data.append({
                "id": req.id,
                "script_id": req.second_evaluator_script_id or f"RECHK-{req.id:05d}",
                "exam_name": req.exam.name,
                "subject_name": req.subject.name,
                "status": req.second_evaluator_status,
                "marks": req.second_evaluator_marks,
                "total_marks": req.second_evaluator_total_marks,
                "remarks": req.second_evaluator_remarks,
                "assigned_at": req.second_evaluator_assigned_at,
            })
        return Response(data)


class TeacherRecheckingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from student.permissions import IsTeacher
        if not IsTeacher().has_permission(request, self):
            return Response({"detail": "Teacher access required."}, status=status.HTTP_403_FORBIDDEN)

        from teacher.models import TeacherProfile
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
        except TeacherProfile.DoesNotExist:
            return Response({"detail": "Teacher profile not found."}, status=status.HTTP_404_NOT_FOUND)

        from administration.services.rechecking_service import get_teacher_rechecking_completed
        completed = get_teacher_rechecking_completed(teacher)
        data = []
        for req in completed:
            data.append({
                "id": req.id,
                "script_id": req.second_evaluator_script_id or f"RECHK-{req.id:05d}",
                "exam_name": req.exam.name,
                "subject_name": req.subject.name,
                "marks": req.second_evaluator_marks,
                "total_marks": req.second_evaluator_total_marks,
                "status": req.status,
                "is_revised": req.is_revised,
                "completed_at": req.completed_at,
            })
        return Response(data)


class TeacherRecheckingDraftView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        from student.permissions import IsTeacher
        if not IsTeacher().has_permission(request, self):
            return Response({"detail": "Teacher access required."}, status=status.HTTP_403_FORBIDDEN)

        from teacher.models import TeacherProfile
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
        except TeacherProfile.DoesNotExist:
            return Response({"detail": "Teacher profile not found."}, status=status.HTTP_404_NOT_FOUND)

        marks = request.data.get("marks")
        remarks = request.data.get("remarks", "")
        if marks is None:
            return Response({"detail": "marks is required."}, status=status.HTTP_400_BAD_REQUEST)

        from administration.services.rechecking_service import save_rechecking_draft
        try:
            req = save_rechecking_draft(request_id, teacher, marks, remarks)
            return Response({
                "id": req.id,
                "status": req.second_evaluator_status,
                "marks": req.second_evaluator_marks,
                "remarks": req.second_evaluator_remarks,
            })
        except (ValueError, PermissionError) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TeacherRecheckingSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        from student.permissions import IsTeacher
        if not IsTeacher().has_permission(request, self):
            return Response({"detail": "Teacher access required."}, status=status.HTTP_403_FORBIDDEN)

        from teacher.models import TeacherProfile
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
        except TeacherProfile.DoesNotExist:
            return Response({"detail": "Teacher profile not found."}, status=status.HTTP_404_NOT_FOUND)

        marks = request.data.get("marks")
        total_marks = request.data.get("total_marks")
        remarks = request.data.get("remarks", "")
        if marks is None or total_marks is None:
            return Response({"detail": "marks and total_marks are required."}, status=status.HTTP_400_BAD_REQUEST)

        from administration.services.rechecking_service import submit_rechecking_evaluation
        try:
            req = submit_rechecking_evaluation(request_id, teacher, marks, total_marks, remarks)
            return Response({
                "id": req.id,
                "status": req.status,
                "marks": req.second_evaluator_marks,
                "total_marks": req.second_evaluator_total_marks,
            })
        except (ValueError, PermissionError) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
