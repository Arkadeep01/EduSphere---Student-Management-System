from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.document_service import DocumentService
from administration.serializers.document import DocumentStorageSerializer


class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        file = request.FILES.get("file")
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
        related_id = request.query_params.get("related_id")
        docs = DocumentService.list_documents(
            related_model=related_model,
            related_id=related_id and int(related_id),
        )
        serializer = DocumentStorageSerializer(docs, many=True)
        return Response(serializer.data)


class DocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, doc_id):
        DocumentService.delete_document(doc_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
