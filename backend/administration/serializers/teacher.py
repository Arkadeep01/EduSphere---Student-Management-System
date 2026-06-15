from rest_framework import serializers
from administration.models.teacher import (
    ClassTeacherAssignment,
    TeacherSubjectAllocation,
    FacultyAttendance,
)


class ClassTeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = ClassTeacherAssignment
        fields = "__all__"

    def get_teacher_name(self, obj):
        return obj.teacher.user.email


class TeacherSubjectAllocationSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherSubjectAllocation
        fields = "__all__"

    def get_teacher_name(self, obj):
        return obj.teacher.user.email

    def get_subject_name(self, obj):
        return obj.subject.name


class FacultyAttendanceSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = FacultyAttendance
        fields = "__all__"

    def get_teacher_name(self, obj):
        return obj.teacher.user.email
