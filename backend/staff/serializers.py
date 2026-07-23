from rest_framework import serializers
from administration.models import AnswerScriptUpload, StaffProfile


class StaffDashboardSerializer(serializers.Serializer):
    pending_uploads = serializers.IntegerField()
    verified_scripts = serializers.IntegerField()
    rejected_scripts = serializers.IntegerField()
    total_batches = serializers.IntegerField()
    recent_uploads = serializers.ListField(child=serializers.DictField(), default=list)


class StaffBatchSerializer(serializers.Serializer):
    batch_id = serializers.CharField()
    exam_name = serializers.CharField()
    subject_name = serializers.CharField()
    total = serializers.IntegerField()
    uploaded = serializers.IntegerField()
    verified = serializers.IntegerField()
    rejected = serializers.IntegerField()
    created_at = serializers.DateTimeField()


class StaffAnswerScriptUploadSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()

    class Meta:
        model = AnswerScriptUpload
        fields = [
            "id", "exam", "student", "subject", "script_file",
            "upload_status", "evaluation_status",
            "section", "roll_number", "registration_number", "script_number",
            "batch_id", "uploaded_by", "uploaded_at",
            "verified_by", "verified_at", "verification_notes",
            "marks_obtained", "total_marks", "remarks",
            "created_at", "updated_at",
            "student_name", "student_email", "exam_name", "subject_name",
        ]
        read_only_fields = [
            "id", "upload_status", "evaluation_status",
            "uploaded_by", "uploaded_at",
            "verified_by", "verified_at", "verification_notes",
            "created_at", "updated_at",
            "student_name", "student_email", "exam_name", "subject_name",
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.email

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_exam_name(self, obj):
        return obj.exam.name

    def get_subject_name(self, obj):
        return obj.subject.name


class StaffProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = StaffProfile
        fields = ["id", "user", "email", "full_name", "employee_id", "department", "phone"]
        read_only_fields = ["id", "user", "email", "full_name"]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.email
