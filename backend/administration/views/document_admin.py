import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.document_service import DocumentService
from administration.serializers.document import DocumentStorageSerializer

ALLOWED_DOCUMENT_MIMETYPES = {
    "application/pdf",
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain", "text/csv",
}
MAX_DOCUMENT_SIZE_MB = 10
MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024


def validate_uploaded_file(file):
    if not file:
        raise ValueError("No file provided.")
    if file.size > MAX_DOCUMENT_SIZE_BYTES:
        raise ValueError(f"File size exceeds {MAX_DOCUMENT_SIZE_MB} MB limit.")
    ext = os.path.splitext(file.name)[1].lower()
    allowed_exts = {".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv"}
    if ext not in allowed_exts:
        raise ValueError(f"File extension '{ext}' is not allowed.")
    if hasattr(file, "content_type"):
        ct = file.content_type.split(";")[0].strip().lower()
        if ct not in ALLOWED_DOCUMENT_MIMETYPES:
            raise ValueError(f"File type '{ct}' is not allowed.")
    if ".." in file.name or "/" in file.name or "\\" in file.name:
        raise ValueError("Invalid filename.")


class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        file = request.FILES.get("file")
        try:
            validate_uploaded_file(file)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        file_type = request.data.get("file_type", "other")
        related_model = request.data.get("related_model", "")
        related_id = request.data.get("related_id")
        doc = DocumentService.upload_document(
            file=file,
            file_type=file_type,
            uploaded_by=request.user,
            related_model=related_model,
            related_id=related_id,
        )
        serializer = DocumentStorageSerializer(doc)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DocumentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        related_model = request.query_params.get("related_model")
        raw_related_id = request.query_params.get("related_id")
        related_id = None
        if raw_related_id is not None:
            try:
                related_id = int(raw_related_id)
            except (ValueError, TypeError):
                return Response({"error": "Invalid related_id"}, status=status.HTTP_400_BAD_REQUEST)
        docs = DocumentService.list_documents(
            related_model=related_model,
            related_id=related_id,
        )
        serializer = DocumentStorageSerializer(docs, many=True)
        return Response(serializer.data)


class DocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, doc_id):
        DocumentService.delete_document(doc_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
