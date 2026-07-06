from rest_framework import serializers
from .models import (
    TeacherProfile, TeacherClassAssignment, TimetableEntry,
    LibrarySession, Resource, AnswerScript,
)
from student.models import StudentProfile


class TeacherProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    assigned_subject_name = serializers.CharField(
        source="assigned_subject.name", read_only=True
    )

    class Meta:
        model = TeacherProfile
        fields = [
            "id", "email", "employee_id", "assigned_subject",
            "assigned_subject_name", "qualification", "experience",
            "profile_photo",
        ]
        read_only_fields = ["employee_id"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        user = instance.user
        for attr, val in user_data.items():
            setattr(user, attr, val)
        user.save()
        return super().update(instance, validated_data)


class TeacherClassAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherClassAssignment
        fields = ["id", "teacher", "class_name"]


class TimetableEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimetableEntry
        fields = [
            "id", "teacher", "day_of_week", "start_time", "end_time",
            "class_name", "session_type", "room", "is_library_converted",
        ]
        read_only_fields = ["is_library_converted"]


class LibrarySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibrarySession
        fields = ["id", "room", "date", "start_time", "end_time", "booked_by", "created_at"]
        read_only_fields = ["booked_by", "created_at"]


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            "id", "teacher", "title", "description", "file", "file_size",
            "download_count", "resource_type", "target_class", "uploaded_at",
        ]
        read_only_fields = ["teacher", "file_size", "download_count", "uploaded_at"]


class AnswerScriptSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    roll_number = serializers.CharField(source="student.roll_number", read_only=True)

    class Meta:
        model = AnswerScript
        fields = [
            "id", "student", "student_name", "roll_number", "teacher",
            "subject", "exam_name", "script_file", "marks_obtained",
            "total_marks", "remarks", "evaluation_status",
            "draft_marks", "draft_remarks", "uploaded_at", "evaluated_at",
        ]
        read_only_fields = [
            "teacher", "marks_obtained", "remarks", "evaluation_status",
            "draft_marks", "draft_remarks", "evaluated_at",
        ]

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"
