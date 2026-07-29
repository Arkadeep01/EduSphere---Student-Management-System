from rest_framework import serializers
from administration.models.template import DocumentTemplate, GeneratedDocument


class DocumentTemplateListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DocumentTemplate
        fields = [
            "id", "name", "document_type", "description", "status",
            "version", "created_by_name", "approved_by_name",
            "approved_at", "created_at", "updated_at",
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return ""

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.email
        return ""


class DocumentTemplateDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DocumentTemplate
        fields = [
            "id", "name", "document_type", "description", "file",
            "placeholder_registry", "status", "version",
            "created_by", "created_by_name", "approved_by",
            "approved_by_name", "approved_at", "rejection_reason",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "placeholder_registry", "status", "version",
            "created_by", "approved_by", "approved_at",
            "created_at", "updated_at",
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return ""

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.email
        return ""


class DocumentTemplateCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    document_type = serializers.ChoiceField(choices=DocumentTemplate.DOCUMENT_TYPE_CHOICES)
    description = serializers.CharField(required=False, allow_blank=True)


class DocumentTemplateActivateSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject", "submit", "retire"])
    reason = serializers.CharField(required=False, allow_blank=True)


class GeneratedDocumentListSerializer(serializers.ModelSerializer):
    template_name = serializers.SerializerMethodField()
    generated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = GeneratedDocument
        fields = [
            "id", "template_name", "document_type", "reference_number",
            "recipient_name", "academic_session", "file_format",
            "generated_by_name", "generated_at", "is_archived",
        ]

    def get_template_name(self, obj):
        return obj.template.name if obj.template else ""

    def get_generated_by_name(self, obj):
        if obj.generated_by:
            return obj.generated_by.get_full_name() or obj.generated_by.email
        return ""


class GeneratedDocumentDetailSerializer(serializers.ModelSerializer):
    template_name = serializers.SerializerMethodField()
    generated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = GeneratedDocument
        fields = [
            "id", "template", "template_name", "template_version",
            "document_type", "reference_number",
            "recipient_user", "recipient_name", "recipient_entity",
            "academic_session", "context_data", "file", "file_format",
            "generated_by", "generated_by_name", "generated_at", "is_archived",
        ]
        read_only_fields = [
            "id", "reference_number", "file", "generated_by",
            "generated_at",
        ]

    def get_template_name(self, obj):
        return obj.template.name if obj.template else ""

    def get_generated_by_name(self, obj):
        if obj.generated_by:
            return obj.generated_by.get_full_name() or obj.generated_by.email
        return ""


class GenerateDocumentSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    recipient_user_id = serializers.IntegerField(required=False, allow_null=True)
    recipient_name = serializers.CharField(required=False, allow_blank=True)
    recipient_entity = serializers.CharField(required=False, allow_blank=True)
    academic_session = serializers.CharField(required=False, allow_blank=True)
    context_data = serializers.JSONField(default=dict, required=False)
    output_format = serializers.ChoiceField(choices=["docx", "pdf"], default="docx")


class PlaceholderValidateSerializer(serializers.Serializer):
    placeholders = serializers.ListField(child=serializers.CharField())
