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
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = AnswerScriptUpload
        fields = "__all__"

    def get_student_name(self, obj):
        return obj.student.user.email

    def get_teacher_name(self, obj):
        return obj.teacher.user.email if obj.teacher else None


class EvaluationTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationTracking
        fields = "__all__"


class PublishedResultSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = PublishedResult
        fields = "__all__"

    def get_student_name(self, obj):
        return obj.student.user.email
