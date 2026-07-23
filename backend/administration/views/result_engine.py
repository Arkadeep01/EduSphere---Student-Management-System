from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.models import Exam, AnswerScriptUpload, PublishedResult
from administration.models.results import GradeBoundary, ResultPublication, StudentResult
from administration.services.result_engine import (
    generate_all_results,
    transition_workflow,
    compute_merit_rank,
    compute_class_ranks,
    compute_subject_rank,
    bulk_publish_results,
    render_report_card,
    render_marksheet,
    render_transcript,
    render_printable_result,
)
from administration.serializers.result_engine import (
    GradeBoundarySerializer,
    ResultPublicationSerializer,
    StudentResultSerializer,
    BulkGenerateSerializer,
    WorkflowTransitionSerializer,
    SubjectRankSerializer,
)
from administration.services.pdf_engine import (
    generate_report_card_pdf,
    generate_marksheet_pdf,
    generate_transcript_pdf,
    generate_printable_result_pdf,
)
from administration.models.audit_log import AuditLog


# ---------------------------------------------------------------------------
# Grade Boundaries
# ---------------------------------------------------------------------------

class GradeBoundaryListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        boundaries = GradeBoundary.objects.all()
        serializer = GradeBoundarySerializer(boundaries, many=True)
        return Response(serializer.data)

    def put(self, request):
        serializer = GradeBoundarySerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        GradeBoundary.objects.all().delete()
        boundaries = GradeBoundary.objects.bulk_create([
            GradeBoundary(**item) for item in serializer.validated_data
        ])
        result = GradeBoundarySerializer(boundaries, many=True)
        AuditLog.objects.create(
            action="update",
            model_name="GradeBoundary",
            object_id="all",
            user=request.user,
            description="Grade boundaries updated",
        )
        return Response(result.data)


# ---------------------------------------------------------------------------
# Result Publication Workflow
# ---------------------------------------------------------------------------

class ResultPublicationCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        exam_id = request.data.get("exam")
        if not exam_id:
            return Response({"detail": "exam is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            exam = Exam.objects.get(id=exam_id)
        except Exam.DoesNotExist:
            return Response({"detail": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)
        publication, created = ResultPublication.objects.get_or_create(
            exam=exam,
            defaults={
                "workflow_status": "draft",
                "created_by": request.user,
                "draft_at": timezone.now(),
                "draft_by": request.user,
            },
        )
        serializer = ResultPublicationSerializer(publication)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ResultPublicationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pub_id):
        try:
            publication = ResultPublication.objects.get(id=pub_id)
        except ResultPublication.DoesNotExist:
            return Response({"detail": "Publication not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ResultPublicationSerializer(publication)
        return Response(serializer.data)


class ResultPublicationListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        exam_id = request.query_params.get("exam")
        status_filter = request.query_params.get("status")
        qs = ResultPublication.objects.select_related("exam", "created_by").all()
        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        if status_filter:
            qs = qs.filter(workflow_status=status_filter)
        serializer = ResultPublicationSerializer(qs, many=True)
        return Response(serializer.data)


class GenerateResultsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pub_id):
        try:
            publication = ResultPublication.objects.get(id=pub_id)
        except ResultPublication.DoesNotExist:
            return Response({"detail": "Publication not found."}, status=status.HTTP_404_NOT_FOUND)
        if publication.is_locked:
            return Response({"detail": "Publication is locked."}, status=status.HTTP_400_BAD_REQUEST)
        results = generate_all_results(publication, request.user)
        serializer = StudentResultSerializer(results, many=True)
        AuditLog.objects.create(
            action="create",
            model_name="StudentResult",
            object_id=str(publication.id),
            user=request.user,
            description=f"Generated {len(results)} student results for publication {publication.id}",
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudentResultListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pub_id):
        try:
            publication = ResultPublication.objects.get(id=pub_id)
        except ResultPublication.DoesNotExist:
            return Response({"detail": "Publication not found."}, status=status.HTTP_404_NOT_FOUND)
        qs = StudentResult.objects.filter(publication=publication).select_related(
            "student__user"
        ).order_by("-percentage")
        serializer = StudentResultSerializer(qs, many=True)
        return Response(serializer.data)


class WorkflowTransitionView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pub_id):
        try:
            publication = ResultPublication.objects.get(id=pub_id)
        except ResultPublication.DoesNotExist:
            return Response({"detail": "Publication not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = WorkflowTransitionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            publication = transition_workflow(
                publication, ser.validated_data["target_status"], request.user
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ResultPublicationSerializer(publication)
        return Response(serializer.data)


class BulkPublishView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pub_id):
        try:
            publication = ResultPublication.objects.get(id=pub_id)
        except ResultPublication.DoesNotExist:
            return Response({"detail": "Publication not found."}, status=status.HTTP_404_NOT_FOUND)
        result = bulk_publish_results(publication, request.user)
        return Response(result)


# ---------------------------------------------------------------------------
# Ranks
# ---------------------------------------------------------------------------

class ComputeRankView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pub_id):
        try:
            publication = ResultPublication.objects.get(id=pub_id)
        except ResultPublication.DoesNotExist:
            return Response({"detail": "Publication not found."}, status=status.HTTP_404_NOT_FOUND)
        compute_merit_rank(publication)
        compute_class_ranks(publication)
        return Response({"detail": "Ranks computed."})


class SubjectRankView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pub_id):
        try:
            publication = ResultPublication.objects.get(id=pub_id)
        except ResultPublication.DoesNotExist:
            return Response({"detail": "Publication not found."}, status=status.HTTP_404_NOT_FOUND)
        rankings = compute_subject_rank(publication)
        data = []
        for sid, ranks in rankings.items():
            from student.models import Subject
            try:
                subj = Subject.objects.get(id=sid)
                sname = subj.name
            except Subject.DoesNotExist:
                sname = "Unknown"
            data.append({
                "subject_id": sid,
                "subject_name": sname,
                "rankings": ranks,
            })
        serializer = SubjectRankSerializer(data, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# PDF Generation
# ---------------------------------------------------------------------------

class ReportCardPDFView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_result_id):
        try:
            sr = StudentResult.objects.select_related(
                "student__user", "publication__exam"
            ).get(id=student_result_id)
        except StudentResult.DoesNotExist:
            return Response({"detail": "Student result not found."}, status=status.HTTP_404_NOT_FOUND)
        data = render_report_card(sr)
        pdf_buf = generate_report_card_pdf(data)
        filename = f"report_card_{sr.student.roll_number or sr.student.id}.pdf"
        return HttpResponse(pdf_buf.getvalue(), content_type="application/pdf",
                            headers={"Content-Disposition": f'attachment; filename="{filename}"'})


class MarksheetPDFView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pub_id):
        try:
            publication = ResultPublication.objects.get(id=pub_id)
        except ResultPublication.DoesNotExist:
            return Response({"detail": "Publication not found."}, status=status.HTTP_404_NOT_FOUND)
        data = render_marksheet(publication)
        pdf_buf = generate_marksheet_pdf(data)
        filename = f"marksheet_{publication.exam.name}_{publication.id}.pdf"
        return HttpResponse(pdf_buf.getvalue(), content_type="application/pdf",
                            headers={"Content-Disposition": f'attachment; filename="{filename}"'})


class TranscriptPDFView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_result_id):
        try:
            sr = StudentResult.objects.select_related(
                "student__user", "publication__exam"
            ).get(id=student_result_id)
        except StudentResult.DoesNotExist:
            return Response({"detail": "Student result not found."}, status=status.HTTP_404_NOT_FOUND)
        data = render_transcript(sr)
        pdf_buf = generate_transcript_pdf(data)
        filename = f"transcript_{sr.student.roll_number or sr.student.id}.pdf"
        return HttpResponse(pdf_buf.getvalue(), content_type="application/pdf",
                            headers={"Content-Disposition": f'attachment; filename="{filename}"'})


class PrintableResultPDFView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_result_id):
        try:
            sr = StudentResult.objects.select_related(
                "student__user", "publication__exam"
            ).get(id=student_result_id)
        except StudentResult.DoesNotExist:
            return Response({"detail": "Student result not found."}, status=status.HTTP_404_NOT_FOUND)
        data = render_printable_result(sr)
        pdf_buf = generate_printable_result_pdf(data)
        filename = f"printable_result_{sr.student.roll_number or sr.student.id}.pdf"
        return HttpResponse(pdf_buf.getvalue(), content_type="application/pdf",
                            headers={"Content-Disposition": f'attachment; filename="{filename}"'})
