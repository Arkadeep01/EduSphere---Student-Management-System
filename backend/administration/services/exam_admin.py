import uuid

from django.db import transaction
from django.utils import timezone

from administration.models.audit_log import AuditLog
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
    def upload_answer_script(data, user=None):
        batch_id = f"ADMIN-BATCH-{uuid.uuid4().hex[:8].upper()}"
        now = timezone.now()
        script = AnswerScriptUpload.objects.create(
            **data,
            uploaded_by=user,
            uploaded_at=now,
            upload_status="uploaded",
            batch_id=batch_id,
        )
        AuditLog.objects.create(
            action="upload",
            model_name="AnswerScriptUpload",
            object_id=str(script.id),
            user=user,
            description=f"Admin uploaded script via legacy upload - {script.exam.name}",
        )
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
