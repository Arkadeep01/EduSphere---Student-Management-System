import datetime
import json

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from administration.permissions import IsAdmin
from administration.models.export import ExportLog
from administration.services.export_service import (
    ExportService, ZIPService, PrintService, _generate_filename, _generate_teacher_filename
)
from administration.serializers.export import ExportLogSerializer

CONTENT_TYPES = {
    "csv": "text/csv",
    "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pdf": "application/pdf",
    "zip": "application/zip",
    "html": "text/html",
}


def _export_response(data, fmt, filename):
    ct = CONTENT_TYPES.get(fmt, "text/csv")
    response = HttpResponse(data, content_type=ct)
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


# ---- Generic Module Export View ----

class GenericModuleExportView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_module_name(self):
        raise NotImplementedError

    def post(self, request):
        module = self.get_module_name()
        fmt = request.data.get("format", "csv")
        fields = request.data.get("fields")
        filters = request.data.get("filters")
        data = ExportService.export_module(request.user, module, fmt, fields, filters)
        filename = _generate_filename(filters, fmt, module.capitalize())
        return _export_response(data, fmt, filename)

    def get(self, request):
        module = self.get_module_name()
        fmt = request.query_params.get("format", "csv")
        data = ExportService.export_module(request.user, module, fmt)
        filename = _generate_filename(None, fmt, module.capitalize())
        return _export_response(data, fmt, filename)


# ---- Specific Export Views (backward compat + custom) ----


class ExportStudentsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        fmt = request.data.get("format", "csv")
        fields = request.data.get("fields")
        filters = request.data.get("filters")
        if not isinstance(fields, list):
            fields = ["name", "email", "roll_number", "class_assigned", "section"]
        data = ExportService.export_students(request.user, fmt, fields, filters)
        filename = _generate_filename(filters, fmt, "Students")
        return _export_response(data, fmt, filename)

    def get(self, request):
        fmt = request.query_params.get("format", "csv")
        data = ExportService.export_students(request.user, fmt)
        return HttpResponse(data, content_type="text/csv")


class ExportTeachersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        fmt = request.data.get("format", "csv")
        fields = request.data.get("fields")
        filters = request.data.get("filters")
        if not isinstance(fields, list):
            fields = ["name", "employee_id", "email", "assigned_subject", "experience"]
        data = ExportService.export_teachers(request.user, fmt, fields, filters)
        filename = _generate_teacher_filename(filters, fmt)
        return _export_response(data, fmt, filename)

    def get(self, request):
        fmt = request.query_params.get("format", "csv")
        data = ExportService.export_teachers(request.user, fmt)
        return HttpResponse(data, content_type="text/csv")


class ExportAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        fmt = request.data.get("format", "csv")
        fields = request.data.get("fields")
        filters = request.data.get("filters")
        if not isinstance(fields, list):
            fields = ["student", "class_assigned", "date", "status"]
        data = ExportService.export_attendance(request.user, fmt, fields, filters)
        filename = _generate_filename(filters, fmt, "Attendance")
        return _export_response(data, fmt, filename)

    def get(self, request):
        fmt = request.query_params.get("format", "csv")
        data = ExportService.export_attendance(request.user, fmt)
        return HttpResponse(data, content_type="text/csv")


class ExportClassesView(GenericModuleExportView):
    def get_module_name(self):
        return "classes"


class ExportExamsView(GenericModuleExportView):
    def get_module_name(self):
        return "exams"


class ExportAdmissionsView(GenericModuleExportView):
    def get_module_name(self):
        return "admissions"


class ExportContactsView(GenericModuleExportView):
    def get_module_name(self):
        return "contacts"


class ExportAuditLogsView(GenericModuleExportView):
    def get_module_name(self):
        return "audit_logs"


class ExportDocumentsView(GenericModuleExportView):
    def get_module_name(self):
        return "documents"


# ---- ZIP Export Views ----

class DocumentZIPDownloadView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        doc_ids = request.data.get("document_ids", [])
        if not doc_ids:
            return Response({"error": "No documents selected"}, status=status.HTTP_400_BAD_REQUEST)
        from administration.models.document import DocumentStorage
        qs = DocumentStorage.objects.filter(id__in=doc_ids)
        buffer = ZIPService.create_document_zip(qs)
        filename = f"Documents_{datetime.datetime.now().strftime('%Y%m%d')}.zip"
        return _export_response(buffer.getvalue(), "zip", filename)


class AdmissionZIPDownloadView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        admission_ids = request.data.get("admission_ids", [])
        if not admission_ids:
            return Response({"error": "No admissions selected"}, status=status.HTTP_400_BAD_REQUEST)
        buffer = ZIPService.create_admission_zip(admission_ids)
        filename = f"AdmissionDocuments_{datetime.datetime.now().strftime('%Y%m%d')}.zip"
        return _export_response(buffer.getvalue(), "zip", filename)


# ---- Print View ----

class PrintView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        module = request.data.get("module", "")
        fields = request.data.get("fields")
        filters = request.data.get("filters")
        html = PrintService.generate_print_html(request.user, module, fields, filters)
        return HttpResponse(html)


# ---- Export Log View ----

class ExportLogListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        logs = ExportLog.objects.select_related("user").all()[:100]
        serializer = ExportLogSerializer(logs, many=True)
        return Response(serializer.data)



