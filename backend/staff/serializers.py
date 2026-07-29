from rest_framework import serializers
from administration.models import AnswerScriptUpload, StaffProfile
from teacher.models import TeacherProfile
from authentication.models import CustomUser


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


# ── Staff Student Creation Serializer ────────────────────────────────


class StaffStudentCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, default="", allow_blank=True)
    last_name = serializers.CharField(max_length=150, default="", allow_blank=True)
    mobile = serializers.CharField(max_length=20, default="", allow_blank=True)
    father_name = serializers.CharField(max_length=100, default="", allow_blank=True)
    mother_name = serializers.CharField(max_length=100, default="", allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    class_assigned = serializers.CharField(max_length=20, default="", allow_blank=True)
    section = serializers.CharField(max_length=10, default="", allow_blank=True)
    address = serializers.CharField(default="", allow_blank=True)
    gender = serializers.CharField(max_length=20, default="", allow_blank=True)
    blood_group = serializers.CharField(max_length=10, default="", allow_blank=True)
    roll_number = serializers.CharField(max_length=20, default="", allow_blank=True)
    admission_number = serializers.CharField(max_length=20, default="", allow_blank=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email


# ── Staff Teacher Management Serializers ──────────────────────────────

class StaffTeacherCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, default="", allow_blank=True)
    mobile = serializers.CharField(max_length=20, default="", allow_blank=True)
    employee_id = serializers.CharField(max_length=20, default="", allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(max_length=20, default="", allow_blank=True)
    phone = serializers.CharField(max_length=20, default="", allow_blank=True)
    address = serializers.CharField(default="", allow_blank=True)
    department = serializers.CharField(max_length=20, default="", allow_blank=True)
    designation = serializers.CharField(max_length=20, default="", allow_blank=True)
    personal_email = serializers.EmailField(default="", allow_blank=True)
    qualification = serializers.CharField(max_length=255, default="", allow_blank=True)
    experience = serializers.IntegerField(required=False, allow_null=True)
    primary_subject = serializers.IntegerField(required=False, allow_null=True)
    secondary_subjects = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)

    def validate_email(self, value):
        email = value.strip().lower()
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email


class StaffTeacherUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = [
            "id", "employee_id", "date_of_birth", "gender", "phone",
            "address", "department", "designation", "personal_email",
            "qualification", "experience", "profile_photo",
        ]


class StaffTeacherListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    mobile = serializers.CharField(source="user.mobile", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    assigned_subject_name = serializers.CharField(source="assigned_subject.name", read_only=True)

    class Meta:
        model = TeacherProfile
        fields = [
            "id", "email", "first_name", "last_name", "mobile",
            "employee_id", "date_of_birth", "gender", "phone",
            "address", "department", "designation", "personal_email",
            "qualification", "experience", "assigned_subject",
            "assigned_subject_name", "status", "is_active",
        ]
