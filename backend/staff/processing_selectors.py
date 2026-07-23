from django.db.models import Count, Q
from administration.models.processing import ScriptProcessing, ScriptBatchProcessing


def get_script_processing(script_id):
    try:
        return ScriptProcessing.objects.select_related(
            "script", "matched_student__user", "duplicate_of", "batch"
        ).get(script_id=script_id)
    except ScriptProcessing.DoesNotExist:
        return None


def list_script_processing(exam_id=None, subject_id=None, batch_id=None, status=None):
    qs = ScriptProcessing.objects.select_related(
        "script__exam", "script__subject", "script__student__user",
        "matched_student__user", "batch",
    ).all()
    if exam_id:
        qs = qs.filter(script__exam_id=exam_id)
    if subject_id:
        qs = qs.filter(script__subject_id=subject_id)
    if batch_id:
        qs = qs.filter(batch__batch_id=batch_id)
    if status:
        qs = qs.filter(verification_status=status)
    return qs.order_by("-created_at")


def get_batch_processing(batch_id):
    try:
        return ScriptBatchProcessing.objects.prefetch_related(
            "scripts__script__student__user"
        ).get(batch_id=batch_id)
    except ScriptBatchProcessing.DoesNotExist:
        return None


def list_batch_processing(exam_id=None, subject_id=None, status=None):
    qs = ScriptBatchProcessing.objects.select_related("exam", "subject", "processed_by").all()
    if exam_id:
        qs = qs.filter(exam_id=exam_id)
    if subject_id:
        qs = qs.filter(subject_id=subject_id)
    if status:
        qs = qs.filter(verification_status=status)
    return qs.order_by("-created_at")


def get_processing_stats(exam_id=None, subject_id=None):
    qs = ScriptProcessing.objects.all()
    if exam_id:
        qs = qs.filter(script__exam_id=exam_id)
    if subject_id:
        qs = qs.filter(script__subject_id=subject_id)
    stats = qs.aggregate(
        total=Count("id"),
        passed=Count("id", filter=Q(verification_status="passed")),
        failed=Count("id", filter=Q(verification_status="failed")),
        flagged=Count("id", filter=Q(verification_status="flagged")),
        pending=Count("id", filter=Q(verification_status="pending")),
        duplicates=Count("id", filter=Q(is_duplicate=True)),
    )
    return stats
