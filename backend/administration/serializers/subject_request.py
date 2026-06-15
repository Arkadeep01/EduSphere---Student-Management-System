from rest_framework import serializers
from administration.models.subject_request import SubjectRequestControl


class SubjectRequestControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectRequestControl
        fields = "__all__"
