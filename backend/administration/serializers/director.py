from rest_framework import serializers
from authentication.models import CustomUser
from administration.models.staff import StaffProfile


class DirectorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "first_name", "last_name", "mobile",
            "role", "is_active", "password_changed", "needs_activation",
            "date_joined",
        ]
        read_only_fields = [
            "id", "password_changed", "needs_activation", "date_joined",
        ]


class DirectorCreateAdminSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, default="", allow_blank=True)
    mobile = serializers.CharField(max_length=20, default="", allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email


class DirectorCreateStaffSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, default="", allow_blank=True)
    mobile = serializers.CharField(max_length=20, default="", allow_blank=True)
    department = serializers.CharField(max_length=100, default="", allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email