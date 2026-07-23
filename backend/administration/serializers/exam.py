from rest_framework import serializers
from administration.models.exam import (
    Exam,
    ExamSchedule,
    AnswerScriptUpload,
    EvaluationTracking,
    PublishedResult,
)


class ExamSerializer(serializers.ModelSerializer):
    subject_name = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = "__all__"

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else None


class ExamScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamSchedule
        fields = "__all__"


class AnswerScriptUploadSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AnswerScriptUpload
        fields = "__all__"

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.email

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_teacher_name(self, obj):
        return obj.teacher.user.email if obj.teacher else None

    def get_uploaded_by_name(self, obj):
        return obj.uploaded_by.email if obj.uploaded_by else None

    def get_verified_by_name(self, obj):
        return obj.verified_by.email if obj.verified_by else None


class EvaluationTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationTracking
        fields = "__all__"


class PublishedResultSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    exam_name = serializers.CharField(source="exam.name", read_only=True)

    class Meta:
        model = PublishedResult
        fields = "__all__"

    def get_student_name(self, obj):
        return obj.student.user.email
