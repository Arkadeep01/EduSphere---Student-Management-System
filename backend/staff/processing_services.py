import uuid
from django.utils import timezone
from django.db import transaction
from django.db.models import Count
from administration.models.audit_log import AuditLog
from administration.models.notification import NotificationBroadcast
from administration.models.processing import ScriptProcessing, ScriptBatchProcessing
from administration.models.exam import AnswerScriptUpload
from student.models import StudentProfile


def init_script_processing(script, user=None):
    processing, created = ScriptProcessing.objects.get_or_create(script=script)
    return processing


def index_script_pages(processing):
    processing.processing_status = "indexing"
    processing.save(update_fields=["processing_status"])
    return processing


def extract_script_metadata(processing, metadata=None):
    if metadata:
        existing = processing.extracted_metadata
        existing.update(metadata)
        processing.extracted_metadata = existing
    processing.processing_status = "extracting"
    processing.save(update_fields=["processing_status", "extracted_metadata"])
    return processing


def count_pages(processing, page_count):
    processing.total_pages = page_count
    processing.save(update_fields=["total_pages"])
    return processing


def set_expected_pages(processing, expected):
    processing.expected_pages = expected
    if expected and processing.total_pages is not None and processing.total_pages < expected:
        existing = list(processing.missing_pages)
        for p in range(processing.total_pages + 1, expected + 1):
            if p not in existing:
                existing.append(p)
        processing.missing_pages = existing
    processing.save(update_fields=["expected_pages", "missing_pages"])
    return processing


def detect_missing_pages(processing):
    if processing.expected_pages and processing.total_pages is not None:
        if processing.total_pages < processing.expected_pages:
            missing = list(range(processing.total_pages + 1, processing.expected_pages + 1))
            processing.missing_pages = missing
        else:
            processing.missing_pages = []
    processing.save(update_fields=["missing_pages"])
    return processing


def detect_duplicate_pages(processing, duplicate_page_numbers=None):
    if duplicate_page_numbers:
        processing.duplicate_pages = duplicate_page_numbers
    processing.save(update_fields=["duplicate_pages"])
    return processing


def match_student(processing, student_id=None, confidence=None):
    if student_id:
        try:
            student = StudentProfile.objects.get(id=student_id)
            processing.matched_student = student
            processing.match_status = "matched"
            processing.match_confidence = confidence or 100.00
        except StudentProfile.DoesNotExist:
            processing.match_status = "unmatched"
    else:
        script = processing.script
        roll = script.roll_number
        reg = script.registration_number
        if roll:
            match_qs = StudentProfile.objects.filter(roll_number=roll)
            if match_qs.exists():
                processing.matched_student = match_qs.first()
                processing.match_status = "matched"
                processing.match_confidence = 95.00
            elif reg:
                match_qs = StudentProfile.objects.filter(admission_number=reg)
                if match_qs.exists():
                    processing.matched_student = match_qs.first()
                    processing.match_status = "matched"
                    processing.match_confidence = 90.00
                else:
                    processing.match_status = "unmatched"
            else:
                processing.match_status = "unmatched"
    processing.save(
        update_fields=[
            "matched_student", "match_status", "match_confidence",
        ]
    )
    return processing


def verify_roll_number(processing):
    script = processing.script
    detected = processing.detected_roll_number
    expected = script.roll_number
    if detected and expected:
        if detected.strip().upper() == expected.strip().upper():
            processing.roll_verified = True
            processing.roll_mismatch_reason = ""
        else:
            processing.roll_verified = False
            processing.roll_mismatch_reason = (
                f"Detected roll '{detected}' does not match expected roll '{expected}'"
            )
    elif expected and not detected:
        processing.roll_verified = False
        processing.roll_mismatch_reason = "Roll number could not be detected from script"
    else:
        processing.roll_verified = True
        processing.roll_mismatch_reason = ""
    processing.save(
        update_fields=["roll_verified", "roll_mismatch_reason"]
    )
    return processing


def check_duplicate_script(processing):
    script = processing.script
    threshold = processing.duplicate_confidence or 80.00
    existing = AnswerScriptUpload.objects.filter(
        exam=script.exam,
        subject=script.subject,
        student=script.student,
    ).exclude(id=script.id)
    if existing.exists():
        prior = ScriptProcessing.objects.filter(script__in=existing).first()
        processing.is_duplicate = True
        processing.duplicate_of = prior
        processing.duplicate_confidence = threshold
    else:
        processing.is_duplicate = False
        processing.duplicate_of = None
        processing.duplicate_confidence = None
    processing.save(
        update_fields=["is_duplicate", "duplicate_of", "duplicate_confidence"]
    )
    return processing


def verify_script_processing(processing, user=None):
    now = timezone.now()
    processing.processing_status = "completed"
    processing.processing_completed_at = now
    processing.verification_status = "passed"
    processing.verified_at = now
    processing.save(
        update_fields=[
            "processing_status", "processing_completed_at",
            "verification_status", "verified_at",
        ]
    )
    AuditLog.objects.create(
        action="update",
        model_name="ScriptProcessing",
        object_id=str(processing.id),
        user=user,
        description=(
            f"Script processing completed for script {processing.script.id} "
            f"- status: {processing.get_verification_status_display()}"
        ),
    )
    return processing


def flag_script_processing(processing, user=None, reason=""):
    now = timezone.now()
    processing.verification_status = "flagged"
    processing.verified_at = now
    processing.save(update_fields=["verification_status", "verified_at"])
    AuditLog.objects.create(
        action="update",
        model_name="ScriptProcessing",
        object_id=str(processing.id),
        user=user,
        description=f"Script processing flagged for script {processing.script.id}: {reason}",
    )
    return processing


def fail_script_processing(processing, user=None, reason=""):
    now = timezone.now()
    processing.processing_status = "failed"
    processing.verification_status = "failed"
    processing.processing_completed_at = now
    processing.verified_at = now
    processing.save(
        update_fields=[
            "processing_status", "verification_status",
            "processing_completed_at", "verified_at",
        ]
    )
    AuditLog.objects.create(
        action="update",
        model_name="ScriptProcessing",
        object_id=str(processing.id),
        user=user,
        description=f"Script processing failed for script {processing.script.id}: {reason}",
    )
    return processing


@transaction.atomic
def create_processing_batch(batch_id, exam, subject, user):
    batch, created = ScriptBatchProcessing.objects.get_or_create(
        batch_id=batch_id,
        exam=exam,
        subject=subject,
        defaults={
            "total_scripts": 0,
            "processed_by": user,
        },
    )
    return batch


@transaction.atomic
def finalize_batch_verification(batch, user=None):
    scripts = batch.scripts.all()
    total = scripts.count()
    passed = scripts.filter(verification_status="passed").count()
    failed = scripts.filter(verification_status="failed").count()
    flagged = scripts.filter(verification_status="flagged").count()

    batch.total_scripts = total
    batch.passed_count = passed
    batch.failed_count = failed
    batch.flagged_count = flagged
    batch.completed_at = timezone.now()

    if failed > 0 or flagged > 0:
        batch.verification_status = "failed" if failed > 0 else "flagged"
    else:
        batch.verification_status = "passed"

    batch.processing_log = batch.processing_log + [
        {
            "timestamp": timezone.now().isoformat(),
            "event": "batch_verification_finalized",
            "total": total,
            "passed": passed,
            "failed": failed,
            "flagged": flagged,
        }
    ]
    batch.save()

    AuditLog.objects.create(
        action="update",
        model_name="ScriptBatchProcessing",
        object_id=batch.batch_id,
        user=user,
        description=(
            f"Batch {batch.batch_id} verification {batch.verification_status}: "
            f"{passed}/{total} passed, {failed} failed, {flagged} flagged"
        ),
    )

    NotificationBroadcast.objects.create(
        title="Batch Processing Complete",
        message=(
            f"Batch {batch.batch_id} processing completed: "
            f"{passed}/{total} passed, {failed} failed, {flagged} flagged."
        ),
        sent_by=user,
        recipient_type="all_teachers",
        status="sent",
        sent_at=timezone.now(),
    )

    return batch


def run_script_pipeline(processing, user=None):
    processing.processing_started_at = timezone.now()
    processing.save(update_fields=["processing_started_at"])
    processing = detect_missing_pages(processing)
    processing = match_student(processing)
    processing = verify_roll_number(processing)
    processing = check_duplicate_script(processing)
    processing = verify_script_processing(processing, user)
    return processing
