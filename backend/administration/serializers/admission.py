from rest_framework import serializers
from administration.models.admission import (
    AdmissionApplication,
    AdmissionVerification,
    StudentRegistrationLog,
)


class AdmissionApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionApplication
        fields = "__all__"


class AdmissionVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionVerification
        fields = "__all__"


class StudentRegistrationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentRegistrationLog
        fields = "__all__"
