from rest_framework import serializers
from administration.models.results import GradeBoundary, ResultPublication, StudentResult


class GradeBoundarySerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeBoundary
        fields = "__all__"


class ResultPublicationSerializer(serializers.ModelSerializer):
    exam_name = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ResultPublication
        fields = [
            "id", "exam", "exam_name", "academic_session",
            "workflow_status", "is_locked",
            "locked_at", "locked_by",
            "draft_at", "draft_by",
            "review_at", "review_by",
            "approved_at", "approved_by",
            "published_at", "published_by",
            "note", "created_by", "created_by_name",
            "student_count",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "workflow_status", "is_locked",
            "locked_at", "locked_by",
            "draft_at", "draft_by",
            "review_at", "review_by",
            "approved_at", "approved_by",
            "published_at", "published_by",
            "created_at", "updated_at",
            "exam_name", "student_count", "created_by_name",
        ]

    def get_exam_name(self, obj):
        return obj.exam.name

    def get_student_count(self, obj):
        return obj.student_results.count()

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.email
        return ""


class StudentResultSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    roll_number = serializers.SerializerMethodField()
    class_assigned = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentResult
        fields = [
            "id", "publication", "student", "student_name", "student_email",
            "roll_number", "class_assigned", "exam_name",
            "percentage", "total_marks_obtained", "total_marks_max",
            "grade", "grade_point", "is_pass", "remarks",
            "merit_rank", "class_rank",
            "subject_counts", "passed_subjects", "failed_subjects",
            "locked", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "percentage", "total_marks_obtained", "total_marks_max",
            "grade", "grade_point", "is_pass", "remarks",
            "merit_rank", "class_rank",
            "subject_counts", "passed_subjects", "failed_subjects",
            "locked", "created_at", "updated_at",
            "student_name", "student_email", "roll_number",
            "class_assigned", "exam_name",
        ]
        extra_kwargs = {"created_at": {"read_only": True}, "updated_at": {"read_only": True}}

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.email

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_roll_number(self, obj):
        return obj.student.roll_number or ""

    def get_class_assigned(self, obj):
        return obj.student.class_assigned or ""

    def get_exam_name(self, obj):
        return obj.publication.exam.name


class BulkGenerateSerializer(serializers.Serializer):
    exam = serializers.IntegerField()


class WorkflowTransitionSerializer(serializers.Serializer):
    target_status = serializers.ChoiceField(
        choices=["draft", "review", "approved", "published"]
    )


class SubjectRankSerializer(serializers.Serializer):
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField(read_only=True)
    rankings = serializers.ListField(child=serializers.DictField(), read_only=True)


class ExportResultSerializer(serializers.Serializer):
    format = serializers.ChoiceField(choices=["pdf", "html", "csv"])
