from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.exam_admin import ExamAdminService
from administration.serializers.exam import (
    ExamSerializer,
    AnswerScriptUploadSerializer,
    EvaluationTrackingSerializer,
    PublishedResultSerializer,
)


class ExamListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        exams = ExamAdminService.list_exams()
        serializer = ExamSerializer(exams, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        exam = ExamAdminService.create_exam(data, request.user)
        serializer = ExamSerializer(exam)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ExamPublishView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, exam_id):
        exam = ExamAdminService.update_exam_status(exam_id, "published")
        serializer = ExamSerializer(exam)
        return Response(serializer.data)


class ExamArchiveView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, exam_id):
        exam = ExamAdminService.update_exam_status(exam_id, "archived")
        serializer = ExamSerializer(exam)
        return Response(serializer.data)


class AnswerScriptUploadView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        data = request.data
        script = ExamAdminService.upload_answer_script(data)
        serializer = AnswerScriptUploadSerializer(script)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EvaluationTrackingView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = ExamAdminService.get_evaluation_tracking()
        serializer = EvaluationTrackingSerializer(data, many=True)
        return Response(serializer.data)


class PublishedResultCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        data = request.data
        result = ExamAdminService.publish_result(data, request.user)
        serializer = PublishedResultSerializer(result)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ExamAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = ExamAdminService.get_exam_analytics()
        return Response(data)
