from django.db.models import Count, Q
from administration.models import AnswerScriptUpload, StaffProfile


def get_staff_dashboard_data(user):
    total = AnswerScriptUpload.objects.filter(uploaded_by=user)
    recent = total.order_by("-uploaded_at")[:10]

    return {
        "pending_uploads": total.filter(upload_status="pending_upload").count(),
        "verified_scripts": total.filter(upload_status="verified").count(),
        "rejected_scripts": total.filter(upload_status="rejected").count(),
        "total_batches": total.values("batch_id").distinct().count(),
        "recent_uploads": [
            {
                "id": s.id,
                "student_name": s.student.user.get_full_name() or s.student.user.email,
                "exam_name": s.exam.name,
                "subject_name": s.subject.name,
                "upload_status": s.upload_status,
                "uploaded_at": s.uploaded_at,
            }
            for s in recent
        ],
    }


def get_upload_tasks(user):
    tasks = AnswerScriptUpload.objects.filter(
        Q(uploaded_by=user) | Q(upload_status="pending_upload"),
    )
    tasks = tasks.select_related("exam", "subject", "student__user").order_by("-created_at")
    return tasks


def get_upload_history(user):
    history = AnswerScriptUpload.objects.filter(uploaded_by=user)
    history = history.select_related("exam", "subject", "student__user").order_by("-uploaded_at")
    return history


def get_rejected_uploads(user):
    rejected = AnswerScriptUpload.objects.filter(uploaded_by=user, upload_status="rejected")
    rejected = rejected.select_related("exam", "subject", "student__user").order_by("-updated_at")
    return rejected


def get_staff_profile(user):
    profile, _ = StaffProfile.objects.get_or_create(user=user)
    return profile
