from django.db import transaction
from django.utils import timezone

from administration.models.exam import (
    Exam,
    ExamSchedule,
    AnswerScriptUpload,
    EvaluationTracking,
    PublishedResult,
)


class ExamAdminService:
    @staticmethod
    def list_exams():
        return Exam.objects.all().order_by("-date")

    @staticmethod
    def create_exam(data, user):
        exam = Exam.objects.create(**data, created_by=user)
        return exam

    @staticmethod
    def update_exam_status(exam_id, status):
        exam = Exam.objects.get(id=exam_id)
        exam.status = status
        exam.save()
        return exam

    @staticmethod
    def schedule_exam(exam_id, schedule_data):
        exam = Exam.objects.get(id=exam_id)
        schedule = ExamSchedule.objects.create(exam=exam, **schedule_data)
        return schedule

    @staticmethod
    def upload_answer_script(data):
        script = AnswerScriptUpload.objects.create(**data)
        return script

    @staticmethod
    def get_evaluation_tracking():
        return EvaluationTracking.objects.select_related("teacher__user", "subject", "exam").all()

    @staticmethod
    def get_exam_analytics():
        return {
            "totalExams": Exam.objects.count(),
            "publishedExams": Exam.objects.filter(status="published").count(),
            "pendingScripts": AnswerScriptUpload.objects.filter(evaluation_status="pending").count(),
            "completedScripts": AnswerScriptUpload.objects.filter(evaluation_status="completed").count(),
        }

    @staticmethod
    def publish_result(data, user):
        result = PublishedResult.objects.create(**data, published_by=user)
        return result
