from rest_framework import serializers
from administration.models.rechecking import BlindRecheckingRequest
from administration.models.exam import Exam, AnswerScriptUpload, PublishedResult
from administration.models.results import StudentResult
from student.models import StudentProfile, Subject


class StudentResultForRecheckingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    exam_id = serializers.IntegerField()
    exam_name = serializers.CharField()
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()
    marks_obtained = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_marks = serializers.DecimalField(max_digits=5, decimal_places=2)
    grade = serializers.CharField()
    published_at = serializers.DateTimeField()
    has_active_request = serializers.BooleanField()
    rechecking_window_open = serializers.BooleanField()


class RecheckingRequestCreateSerializer(serializers.Serializer):
    exam_id = serializers.IntegerField()
    subject_id = serializers.IntegerField()


class RecheckingRequestListSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    original_evaluator_name = serializers.SerializerMethodField()
    second_evaluator_name = serializers.SerializerMethodField()

    class Meta:
        model = BlindRecheckingRequest
        fields = [
            "id", "student_name", "exam_name", "subject_name",
            "status", "marks_obtained_original", "total_marks_original",
            "grade_original", "marks_obtained_revised", "total_marks_revised",
            "grade_revised", "original_evaluator_name", "second_evaluator_name",
            "second_evaluator_status", "is_revised", "marks_difference",
            "rechecking_policy_applied", "rechecking_window_deadline",
            "requested_at", "approved_at", "rejected_reason", "completed_at",
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.email

    def get_exam_name(self, obj):
        return obj.exam.name if obj.exam else ""

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else ""

    def get_original_evaluator_name(self, obj):
        if obj.original_evaluator:
            return obj.original_evaluator.user.get_full_name() or obj.original_evaluator.user.email
        return ""

    def get_second_evaluator_name(self, obj):
        if obj.second_evaluator:
            return obj.second_evaluator.user.get_full_name() or obj.second_evaluator.user.email
        return ""


class RecheckingDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_roll_number = serializers.SerializerMethodField()
    student_class = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()
    exam_date = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    original_evaluator_name = serializers.SerializerMethodField()
    second_evaluator_name = serializers.SerializerMethodField()

    class Meta:
        model = BlindRecheckingRequest
        fields = [
            "id", "student_name", "student_roll_number", "student_class",
            "exam_name", "exam_date", "subject_name",
            "status", "marks_obtained_original", "total_marks_original",
            "grade_original", "marks_obtained_revised", "total_marks_revised",
            "grade_revised", "original_evaluator_name", "original_evaluator",
            "second_evaluator_name", "second_evaluator",
            "second_evaluator_marks", "second_evaluator_total_marks",
            "second_evaluator_remarks", "second_evaluator_status",
            "second_evaluator_script_id", "marks_difference",
            "rechecking_policy_applied", "is_revised",
            "rechecking_window_deadline", "requested_at", "approved_at",
            "rejected_reason", "completed_at",
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.email

    def get_student_roll_number(self, obj):
        return obj.student.roll_number or ""

    def get_student_class(self, obj):
        return obj.student.class_assigned or ""

    def get_exam_name(self, obj):
        return obj.exam.name if obj.exam else ""

    def get_exam_date(self, obj):
        return str(obj.exam.date) if obj.exam and obj.exam.date else ""

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else ""

    def get_original_evaluator_name(self, obj):
        if obj.original_evaluator:
            return obj.original_evaluator.user.get_full_name() or obj.original_evaluator.user.email
        return ""

    def get_second_evaluator_name(self, obj):
        if obj.second_evaluator:
            return obj.second_evaluator.user.get_full_name() or obj.second_evaluator.user.email
        return ""


class RecheckingApprovalSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject"])
    reason = serializers.CharField(required=False, allow_blank=True)
    second_evaluator_id = serializers.IntegerField(required=False)
    rechecking_policy = serializers.ChoiceField(
        choices=["use_higher", "use_average", "use_new", "use_policy"],
        required=False, default="use_policy",
    )
