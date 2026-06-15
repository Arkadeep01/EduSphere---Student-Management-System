from rest_framework.permissions import BasePermission


from rest_framework import serializers
from administration.models.document import DocumentStorage


class DocumentStorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentStorage
        fields = "__all__"
