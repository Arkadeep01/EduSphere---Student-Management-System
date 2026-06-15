from administration.models.document import DocumentStorage


class DocumentService:
    @staticmethod
    def upload_document(file, file_type, uploaded_by, related_model=None, related_id=None):
        doc = DocumentStorage.objects.create(
            file=file,
            file_type=file_type,
            original_filename=file.name,
            file_size=file.size,
            uploaded_by=uploaded_by,
            related_model=related_model,
            related_id=related_id,
        )
        return doc

    @staticmethod
    def list_documents(related_model=None, related_id=None):
        qs = DocumentStorage.objects.all()
        if related_model:
            qs = qs.filter(related_model=related_model)
        if related_id:
            qs = qs.filter(related_id=related_id)
        return qs

    @staticmethod
    def delete_document(doc_id):
        DocumentStorage.objects.get(id=doc_id).delete()
