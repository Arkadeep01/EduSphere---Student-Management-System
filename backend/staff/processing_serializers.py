from rest_framework import serializers
from administration.models.processing import ScriptProcessing, ScriptBatchProcessing


class ScriptProcessingSerializer(serializers.ModelSerializer):
    script_id = serializers.IntegerField(source="script.id", read_only=True)
    student_name = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    batch_id = serializers.SerializerMethodField()
    matched_student_name = serializers.SerializerMethodField()
    duplicate_of_id = serializers.SerializerMethodField()

    class Meta:
        model = ScriptProcessing
        fields = [
            "id", "script_id", "batch_id",
            "ocr_status", "ocr_attempted_at", "ocr_completed_at",
            "ocr_confidence", "ocr_error_message",
            "processing_status", "processing_started_at", "processing_completed_at",
            "verification_status", "verified_at",
            "extracted_metadata",
            "total_pages", "expected_pages", "missing_pages", "duplicate_pages",
            "matched_student", "matched_student_name",
            "match_confidence", "match_status",
            "detected_roll_number", "roll_verified", "roll_mismatch_reason",
            "is_duplicate", "duplicate_of", "duplicate_of_id",
            "duplicate_confidence",
            "student_name", "exam_name", "subject_name",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "script_id", "batch_id",
            "ocr_status", "processing_status", "verification_status",
            "created_at", "updated_at",
            "student_name", "exam_name", "subject_name",
            "matched_student_name", "duplicate_of_id",
        ]

    def get_student_name(self, obj):
        student = obj.script.student
        return student.user.get_full_name() or student.user.email

    def get_exam_name(self, obj):
        return obj.script.exam.name

    def get_subject_name(self, obj):
        return obj.script.subject.name

    def get_batch_id(self, obj):
        if obj.batch:
            return obj.batch.batch_id
        return obj.script.batch_id

    def get_matched_student_name(self, obj):
        if obj.matched_student:
            return obj.matched_student.user.get_full_name() or obj.matched_student.user.email
        return ""

    def get_duplicate_of_id(self, obj):
        if obj.duplicate_of:
            return obj.duplicate_of.id
        return None


class ScriptProcessingStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    passed = serializers.IntegerField()
    failed = serializers.IntegerField()
    flagged = serializers.IntegerField()
    pending = serializers.IntegerField()
    duplicates = serializers.IntegerField()


class ScriptBatchProcessingSerializer(serializers.ModelSerializer):
    exam_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    processed_by_name = serializers.SerializerMethodField()
    scripts = ScriptProcessingSerializer(many=True, read_only=True)

    class Meta:
        model = ScriptBatchProcessing
        fields = [
            "id", "batch_id", "exam", "exam_name",
            "subject", "subject_name",
            "verification_status", "total_scripts",
            "passed_count", "failed_count", "flagged_count",
            "processed_by", "processed_by_name",
            "processing_log", "scripts",
            "created_at", "completed_at",
        ]
        read_only_fields = [
            "id", "batch_id", "verification_status",
            "total_scripts", "passed_count", "failed_count", "flagged_count",
            "processing_log", "scripts",
            "created_at", "completed_at",
            "exam_name", "subject_name", "processed_by_name",
        ]

    def get_exam_name(self, obj):
        return obj.exam.name

    def get_subject_name(self, obj):
        return obj.subject.name

    def get_processed_by_name(self, obj):
        if obj.processed_by:
            return obj.processed_by.email
        return ""


class ScriptProcessingPageCountSerializer(serializers.Serializer):
    page_count = serializers.IntegerField(min_value=1)


class ScriptProcessingMetadataSerializer(serializers.Serializer):
    metadata = serializers.JSONField()


class ScriptProcessingMatchSerializer(serializers.Serializer):
    student_id = serializers.IntegerField(required=False)
    confidence = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False
    )


class ScriptProcessingRollSerializer(serializers.Serializer):
    detected_roll_number = serializers.CharField(max_length=20)


class ScriptProcessingDuplicatePagesSerializer(serializers.Serializer):
    duplicate_page_numbers = serializers.ListField(
        child=serializers.IntegerField()
    )


class ScriptProcessingFlagSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class ScriptProcessingPipelineSerializer(serializers.Serializer):
    script_id = serializers.IntegerField()
