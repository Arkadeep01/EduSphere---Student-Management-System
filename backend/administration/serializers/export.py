from rest_framework import serializers
from administration.models.export import ExportLog


class ExportLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportLog
        fields = "__all__"
