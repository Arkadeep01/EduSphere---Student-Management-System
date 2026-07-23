from rest_framework import serializers
from administration.models.fee import FeeStructure, FeeComponent, StudentFeePayment, StudentScholarship, FinanceActivityLog


class FeeComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeComponent
        fields = "__all__"
        read_only_fields = ["id"]


class FeeStructureSerializer(serializers.ModelSerializer):
    components = FeeComponentSerializer(many=True, read_only=True)

    class Meta:
        model = FeeStructure
        fields = "__all__"


class FeeStructureCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = ["class_name", "late_fine_per_day", "gst_enabled"]


class StudentFeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    section = serializers.SerializerMethodField()
    admission_number = serializers.SerializerMethodField()

    class Meta:
        model = StudentFeePayment
        fields = "__all__"

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.email

    def get_class_name(self, obj):
        return obj.student.class_assigned or ""

    def get_section(self, obj):
        return obj.student.section or ""

    def get_admission_number(self, obj):
        return obj.student.admission_number or ""


class StudentScholarshipSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentScholarship
        fields = "__all__"

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.email

    def get_class_name(self, obj):
        return obj.student.class_assigned or ""


class FinanceActivityLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = FinanceActivityLog
        fields = "__all__"

    def get_admin_name(self, obj):
        return obj.admin.email if obj.admin else "System"

    def get_student_name(self, obj):
        if obj.student:
            return obj.student.user.get_full_name() or obj.student.user.email
        return None
