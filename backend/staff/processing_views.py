from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from administration.models import AnswerScriptUpload, Exam
from administration.models.processing import ScriptProcessing, ScriptBatchProcessing
from student.models import Subject
from .permissions import IsStaff
from .processing_serializers import (
    ScriptProcessingSerializer,
    ScriptProcessingStatsSerializer,
    ScriptBatchProcessingSerializer,
    ScriptProcessingPageCountSerializer,
    ScriptProcessingMetadataSerializer,
    ScriptProcessingMatchSerializer,
    ScriptProcessingRollSerializer,
    ScriptProcessingDuplicatePagesSerializer,
    ScriptProcessingFlagSerializer,
    ScriptProcessingPipelineSerializer,
)
from .processing_selectors import (
    get_script_processing,
    list_script_processing,
    get_batch_processing,
    list_batch_processing,
    get_processing_stats,
)
from .processing_services import (
    init_script_processing,
    count_pages,
    set_expected_pages,
    extract_script_metadata,
    detect_missing_pages,
    detect_duplicate_pages,
    match_student,
    verify_roll_number,
    check_duplicate_script,
    verify_script_processing,
    flag_script_processing,
    fail_script_processing,
    create_processing_batch,
    finalize_batch_verification,
    run_script_pipeline,
)


class ScriptProcessingInitView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        try:
            script = AnswerScriptUpload.objects.get(id=script_id)
        except AnswerScriptUpload.DoesNotExist:
            return Response(
                {"detail": "Script not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        processing = init_script_processing(script, request.user)
        serializer = ScriptProcessingSerializer(processing)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ScriptProcessingDetailView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ScriptProcessingSerializer(processing)
        return Response(serializer.data)


class ScriptProcessingPageCountView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = ScriptProcessingPageCountSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        processing = count_pages(processing, ser.validated_data["page_count"])
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingExpectedPagesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = ScriptProcessingPageCountSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        processing = set_expected_pages(processing, ser.validated_data["page_count"])
        processing = detect_missing_pages(processing)
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingMetadataView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = ScriptProcessingMetadataSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        processing = extract_script_metadata(processing, ser.validated_data["metadata"])
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingMatchView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = ScriptProcessingMatchSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        processing = match_student(
            processing,
            student_id=ser.validated_data.get("student_id"),
            confidence=ser.validated_data.get("confidence"),
        )
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingRollVerifyView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = ScriptProcessingRollSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        processing.detected_roll_number = ser.validated_data["detected_roll_number"]
        processing.save(update_fields=["detected_roll_number"])
        processing = verify_roll_number(processing)
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingDuplicatePagesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = ScriptProcessingDuplicatePagesSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        processing = detect_duplicate_pages(
            processing, ser.validated_data["duplicate_page_numbers"]
        )
        processing = check_duplicate_script(processing)
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingFinalizeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        all_passed = processing.roll_verified
        if processing.missing_pages:
            all_passed = False
        if processing.is_duplicate:
            all_passed = False
        if all_passed:
            processing = verify_script_processing(processing, request.user)
        else:
            processing = flag_script_processing(
                processing, request.user, reason="Checks failed during finalization"
            )
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingFlagView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = ScriptProcessingFlagSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        processing = flag_script_processing(processing, request.user, ser.validated_data["reason"])
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingFailView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = ScriptProcessingFlagSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        processing = fail_script_processing(processing, request.user, ser.validated_data["reason"])
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingPipelineView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, script_id):
        processing = get_script_processing(script_id)
        if not processing:
            return Response(
                {"detail": "Processing not found. Initialize first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        processing = run_script_pipeline(processing, request.user)
        result = ScriptProcessingSerializer(processing)
        return Response(result.data)


class ScriptProcessingListView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        exam_id = request.query_params.get("exam")
        subject_id = request.query_params.get("subject")
        batch_id = request.query_params.get("batch")
        status = request.query_params.get("status")
        qs = list_script_processing(exam_id, subject_id, batch_id, status)
        serializer = ScriptProcessingSerializer(qs, many=True)
        return Response(serializer.data)


class ScriptProcessingStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        exam_id = request.query_params.get("exam")
        subject_id = request.query_params.get("subject")
        stats = get_processing_stats(exam_id, subject_id)
        serializer = ScriptProcessingStatsSerializer(stats)
        return Response(serializer.data)


class BatchProcessingInitView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request):
        batch_id = request.data.get("batch_id")
        exam_id = request.data.get("exam")
        subject_id = request.data.get("subject")
        if not batch_id or not exam_id or not subject_id:
            return Response(
                {"detail": "batch_id, exam, and subject are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            exam = Exam.objects.get(id=exam_id)
            subject = Subject.objects.get(id=subject_id)
        except (Exam.DoesNotExist, Subject.DoesNotExist):
            return Response(
                {"detail": "Invalid exam or subject."},
                status=status.HTTP_404_NOT_FOUND,
            )
        batch = create_processing_batch(batch_id, exam, subject, request.user)
        scripts = AnswerScriptUpload.objects.filter(
            batch_id=batch_id, exam=exam, subject=subject
        )
        for script in scripts:
            sp, _ = ScriptProcessing.objects.get_or_create(script=script, defaults={"batch": batch})
            if not sp.batch:
                sp.batch = batch
                sp.save(update_fields=["batch"])
        batch.total_scripts = scripts.count()
        batch.save(update_fields=["total_scripts"])
        serializer = ScriptBatchProcessingSerializer(batch)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BatchProcessingDetailView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request, batch_id):
        batch = get_batch_processing(batch_id)
        if not batch:
            return Response(
                {"detail": "Batch processing not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ScriptBatchProcessingSerializer(batch)
        return Response(serializer.data)


class BatchProcessingFinalizeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, batch_id):
        batch = get_batch_processing(batch_id)
        if not batch:
            return Response(
                {"detail": "Batch processing not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        batch = finalize_batch_verification(batch, request.user)
        serializer = ScriptBatchProcessingSerializer(batch)
        return Response(serializer.data)


class BatchProcessingListView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        exam_id = request.query_params.get("exam")
        subject_id = request.query_params.get("subject")
        status = request.query_params.get("status")
        qs = list_batch_processing(exam_id, subject_id, status)
        serializer = ScriptBatchProcessingSerializer(qs, many=True)
        return Response(serializer.data)
