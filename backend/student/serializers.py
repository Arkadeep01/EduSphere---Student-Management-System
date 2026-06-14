from rest_framework import serializers
from .models import (
    Subject, StudentProfile, StudentSubject, AdmissionDocument,
    Assignment, AssignmentSubmission, Attendance, Result, Timetable,
    Notification,
)


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code", "tier", "teacher_name", "description", "color", "progress"]


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", required=False)
    last_name = serializers.CharField(source="user.last_name", required=False)
    phone = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "roll_number", "admission_number", "father_name", "mother_name",
            "profile_photo", "date_of_birth", "class_assigned", "section",
            "address", "gender", "blood_group", "phone", "full_name",
        ]
        read_only_fields = ["roll_number", "admission_number"]

    def get_phone(self, obj):
        return obj.user.mobile if hasattr(obj.user, 'mobile') else ""

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        user = instance.user
        for attr, val in user_data.items():
            setattr(user, attr, val)
        user.save()
        return super().update(instance, validated_data)


class StudentSubjectSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    tier = serializers.CharField(source="subject.tier", read_only=True)

    class Meta:
        model = StudentSubject
        fields = [
            "id", "subject", "subject_name", "subject_code", "tier",
            "status", "assigned_by_admin",
        ]
        read_only_fields = ["status", "assigned_by_admin"]


class AdmissionDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionDocument
        fields = ["id", "document", "description", "uploaded_at"]
        read_only_fields = ["uploaded_at"]


class AssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id", "title", "description", "subject", "subject_name",
            "target_class", "due_date", "created_by", "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Description is mandatory.")
        return value


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = [
            "id", "assignment", "assignment_title", "student", "student_name",
            "file", "status", "grade", "remarks", "submitted_at", "evaluated_at",
        ]
        read_only_fields = ["status", "grade", "remarks", "submitted_at", "evaluated_at"]

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ["id", "student", "date", "status", "marked_by", "class_assigned", "created_at"]
        read_only_fields = ["marked_by", "created_at"]


class ResultSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    marks = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = [
            "id", "student", "subject", "subject_name", "exam_name",
            "marks_obtained", "total_marks", "marks", "total", "grade",
        ]

    def get_marks(self, obj):
        return obj.marks_obtained

    def get_total(self, obj):
        return obj.total_marks


class TimetableSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Timetable
        fields = [
            "id", "student", "day_of_week", "start_time", "end_time",
            "subject", "subject_name", "room", "is_library_session",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "is_read", "notification_type", "created_at"]
        read_only_fields = ["created_at"]
