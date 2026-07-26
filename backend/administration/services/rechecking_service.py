import logging
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.conf import settings

from administration.models.rechecking import BlindRecheckingRequest
from administration.models.exam import AnswerScriptUpload, PublishedResult, Exam
from administration.models.results import GradeBoundary, ResultPublication, StudentResult
from administration.models.audit_log import AuditLog
from administration.services.result_engine import (
    calculate_grade, calculate_percentage, get_grade_boundaries,
    compute_student_result,
)
from notification.services.notification_service import NotificationService
from notification.models import NotificationType, Priority, TargetAudience
from student.models import StudentProfile, Subject
from teacher.models import TeacherProfile

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Window Management
# ---------------------------------------------------------------------------

def get_rechecking_deadline(reference_date=None):
    if reference_date is None:
        reference_date = timezone.now()
    return reference_date + timedelta(days=7)


def is_window_open(request_obj):
    if not request_obj.rechecking_window_deadline:
        return True
    return timezone.now() <= request_obj.rechecking_window_deadline


def close_expired_windows():
    now = timezone.now()
    expired = BlindRecheckingRequest.objects.filter(
        status__in=["pending_approval", "approved"],
        rechecking_window_deadline__lte=now,
    )
    count = 0
    for req in expired:
        req.status = "closed"
        req.save()
        AuditLog.objects.create(
            action="update",
            model_name="BlindRecheckingRequest",
            object_id=str(req.id),
            description=f"Rechecking request #{req.id} auto-closed (window expired)",
        )
        count += 1
    return count


# ---------------------------------------------------------------------------
# Eligibility
# ---------------------------------------------------------------------------

def get_eligible_results_for_student(student):
    published_results = PublishedResult.objects.filter(
        student=student
    ).select_related("exam", "subject")
    eligible = []
    for pr in published_results:
        active_exists = BlindRecheckingRequest.objects.filter(
            student=student,
            exam=pr.exam,
            subject=pr.subject,
            status__in=["pending_approval", "approved", "re_evaluating", "comparing"],
        ).exists()
        deadline = get_rechecking_deadline(
            timezone.make_aware(
                timezone.datetime.combine(pr.exam.date, timezone.datetime.min.time())
            ) if pr.exam.date else None
        )
        window_open = timezone.now() <= deadline
        eligible.append({
            "id": pr.id,
            "exam_id": pr.exam_id,
            "exam_name": pr.exam.name,
            "subject_id": pr.subject_id,
            "subject_name": pr.subject.name,
            "marks_obtained": pr.marks_obtained,
            "total_marks": pr.total_marks,
            "grade": pr.grade,
            "published_at": pr.published_at,
            "has_active_request": active_exists,
            "rechecking_window_open": window_open,
        })
    return eligible


# ---------------------------------------------------------------------------
# Request Lifecycle
# ---------------------------------------------------------------------------

@transaction.atomic
def create_rechecking_request(student, exam_id, subject_id):
    exam = Exam.objects.get(id=exam_id)
    subject = Subject.objects.get(id=subject_id)

    active_exists = BlindRecheckingRequest.objects.filter(
        student=student,
        exam=exam,
        subject=subject,
        status__in=["pending_approval", "approved", "re_evaluating", "comparing"],
    ).exists()
    if active_exists:
        raise ValueError("An active rechecking request already exists for this student, exam, and subject.")

    published = PublishedResult.objects.filter(
        exam=exam, student=student, subject=subject
    ).first()
    if not published:
        raise ValueError("No published result found for this exam and subject.")

    original_script = AnswerScriptUpload.objects.filter(
        exam=exam, student=student, subject=subject,
        evaluation_status="completed",
    ).select_related("teacher").first()

    deadline = get_rechecking_deadline(
        timezone.make_aware(
            timezone.datetime.combine(exam.date, timezone.datetime.min.time())
        ) if exam.date else timezone.now()
    )

    request_obj = BlindRecheckingRequest.objects.create(
        student=student,
        exam=exam,
        subject=subject,
        status="pending_approval",
        original_published_result=published,
        marks_obtained_original=published.marks_obtained,
        total_marks_original=published.total_marks,
        grade_original=published.grade,
        original_evaluator=original_script.teacher if original_script else None,
        original_script=original_script,
        rechecking_window_deadline=deadline,
    )

    AuditLog.objects.create(
        action="create",
        model_name="BlindRecheckingRequest",
        object_id=str(request_obj.id),
        description=f"Rechecking request created for {student.user.email} - {exam.name} ({subject.name})",
    )

    try:
        NotificationService.create_notification(
            notification_type=NotificationType.RECHECKING_REQUESTED,
            title="Rechecking Request Received",
            message=f"Rechecking requested for {exam.name} - {subject.name}.",
            priority=Priority.MEDIUM,
            target_audience=TargetAudience.SPECIFIC_STUDENTS,
            target_user_ids=[student.user_id],
            send_email=True,
            send_realtime=True,
            metadata={
                "rechecking_id": request_obj.id,
                "exam_name": exam.name,
                "subject_name": subject.name,
                "marks_obtained": str(published.marks_obtained),
                "total_marks": str(published.total_marks),
            },
        )
    except Exception:
        logger.exception("Failed to send rechecking request notification")

    return request_obj


@transaction.atomic
def approve_rechecking_request(request_id, admin_user, second_evaluator_id=None, policy="use_policy"):
    req = BlindRecheckingRequest.objects.select_related(
        "student", "exam", "subject", "original_script"
    ).get(id=request_id)

    if req.status != "pending_approval":
        raise ValueError(f"Cannot approve request in status {req.status}.")

    if not is_window_open(req):
        req.status = "closed"
        req.save()
        raise ValueError("Rechecking window has closed for this request.")

    req.status = "approved"
    req.approved_at = timezone.now()
    req.approved_by = admin_user
    req.rechecking_policy_applied = policy

    if second_evaluator_id:
        try:
            teacher = TeacherProfile.objects.get(id=second_evaluator_id)
            if teacher and req.original_evaluator and teacher.id == req.original_evaluator.id:
                raise ValueError("Second evaluator cannot be the same as the original evaluator.")
            req.second_evaluator = teacher
        except TeacherProfile.DoesNotExist:
            raise ValueError("Evaluator not found.")

    req.save()

    # Unlock the student's subject-level result for editing
    student_result = StudentResult.objects.filter(
        publication__exam=req.exam,
        student=req.student,
    ).first()
    if student_result and student_result.locked:
        student_result.locked = False
        student_result.save()
        req.student_result_unlocked = student_result
        req.save()

    AuditLog.objects.create(
        action="update",
        model_name="BlindRecheckingRequest",
        object_id=str(req.id),
        user=admin_user,
        description=f"Rechecking request #{req.id} approved by {admin_user.email}",
    )

    try:
        NotificationService.create_notification(
            notification_type=NotificationType.RECHECKING_APPROVED,
            title="Rechecking Request Approved",
            message=f"Your rechecking request for {req.exam.name} - {req.subject.name} has been approved.",
            priority=Priority.MEDIUM,
            target_audience=TargetAudience.SPECIFIC_STUDENTS,
            target_user_ids=[req.student.user_id],
            send_email=True,
            send_realtime=True,
            metadata={
                "rechecking_id": req.id,
                "exam_name": req.exam.name,
                "subject_name": req.subject.name,
            },
        )
    except Exception:
        logger.exception("Failed to send rechecking approval notification")

    # Auto-assign evaluator if provided
    if second_evaluator_id:
        assign_second_evaluator(req.id, second_evaluator_id, admin_user)

    return req


@transaction.atomic
def reject_rechecking_request(request_id, admin_user, reason=""):
    req = BlindRecheckingRequest.objects.get(id=request_id)
    if req.status != "pending_approval":
        raise ValueError(f"Cannot reject request in status {req.status}.")
    req.status = "rejected"
    req.rejected_at = timezone.now()
    req.rejected_reason = reason
    req.save()

    AuditLog.objects.create(
        action="update",
        model_name="BlindRecheckingRequest",
        object_id=str(req.id),
        user=admin_user,
        description=f"Rechecking request #{req.id} rejected by {admin_user.email}. Reason: {reason}",
    )

    try:
        NotificationService.create_notification(
            notification_type=NotificationType.RECHECKING_REJECTED,
            title="Rechecking Request Update",
            message=f"Your rechecking request for {req.exam.name} - {req.subject.name} was not approved.",
            priority=Priority.MEDIUM,
            target_audience=TargetAudience.SPECIFIC_STUDENTS,
            target_user_ids=[req.student.user_id],
            send_email=True,
            send_realtime=True,
            metadata={
                "rechecking_id": req.id,
                "exam_name": req.exam.name,
                "subject_name": req.subject.name,
                "reason": reason,
            },
        )
    except Exception:
        logger.exception("Failed to send rechecking rejection notification")

    return req


# ---------------------------------------------------------------------------
# Blind Evaluator Assignment
# ---------------------------------------------------------------------------

@transaction.atomic
def assign_second_evaluator(request_id, teacher_id, admin_user):
    req = BlindRecheckingRequest.objects.select_related("exam", "subject").get(id=request_id)
    if req.status not in ["approved", "re_evaluating"]:
        raise ValueError(f"Cannot assign evaluator in status {req.status}.")

    teacher = TeacherProfile.objects.get(id=teacher_id)
    if teacher == req.original_evaluator:
        raise ValueError("Second evaluator must be different from the original evaluator.")

    req.second_evaluator = teacher
    req.second_evaluator_status = "pending"
    req.second_evaluator_assigned_at = timezone.now()
    req.second_evaluator_script_id = f"RECHK-{req.id:05d}"
    if req.status == "approved":
        req.status = "re_evaluating"
    req.save()

    AuditLog.objects.create(
        action="update",
        model_name="BlindRecheckingRequest",
        object_id=str(req.id),
        user=admin_user,
        description=f"Second evaluator {teacher.user.email} assigned to rechecking request #{req.id}",
    )

    try:
        NotificationService.create_notification(
            notification_type=NotificationType.RECHECKING_ASSIGNED,
            title="Blind Re-evaluation Assigned",
            message=f"A blind re-evaluation script has been assigned for {req.exam.name} - {req.subject.name}.",
            priority=Priority.MEDIUM,
            target_audience=TargetAudience.SPECIFIC_TEACHERS,
            target_user_ids=[teacher.user_id],
            send_email=True,
            send_realtime=True,
            metadata={
                "rechecking_id": req.id,
                "exam_name": req.exam.name,
                "subject_name": req.subject.name,
                "script_id": req.second_evaluator_script_id,
                "teacher_name": teacher.user.get_full_name() or teacher.user.email,
            },
        )
    except Exception:
        logger.exception("Failed to send evaluator assignment notification")

    return req


# ---------------------------------------------------------------------------
# Teacher Re-evaluation (Blind)
# ---------------------------------------------------------------------------

def get_teacher_rechecking_queue(teacher):
    return BlindRecheckingRequest.objects.filter(
        second_evaluator=teacher,
        status__in=["re_evaluating"],
    ).select_related("exam", "subject").order_by("-second_evaluator_assigned_at")


def get_teacher_rechecking_completed(teacher):
    return BlindRecheckingRequest.objects.filter(
        second_evaluator=teacher,
        status__in=["completed", "comparing"],
    ).select_related("exam", "subject").order_by("-completed_at")


@transaction.atomic
def save_rechecking_draft(request_id, teacher, marks, remarks=""):
    req = BlindRecheckingRequest.objects.select_related("student").get(id=request_id)
    if req.second_evaluator_id != teacher.id:
        raise PermissionError("This script is not assigned to you.")
    if req.status != "re_evaluating":
        raise ValueError(f"Cannot save draft in status {req.status}.")

    req.second_evaluator_marks = marks
    req.second_evaluator_remarks = remarks
    if req.second_evaluator_status == "pending":
        req.second_evaluator_status = "evaluating"
    req.save()

    AuditLog.objects.create(
        action="update",
        model_name="BlindRecheckingRequest",
        object_id=str(req.id),
        description=f"Rechecking draft saved for request #{req.id} by evaluator {teacher.user.email}",
    )
    return req


@transaction.atomic
def submit_rechecking_evaluation(request_id, teacher, marks, total_marks, remarks=""):
    req = BlindRecheckingRequest.objects.select_related(
        "student", "exam", "subject", "original_evaluator"
    ).get(id=request_id)
    if req.second_evaluator_id != teacher.id:
        raise PermissionError("This script is not assigned to you.")
    if req.status != "re_evaluating":
        raise ValueError(f"Cannot submit evaluation in status {req.status}.")

    req.second_evaluator_marks = marks
    req.second_evaluator_total_marks = total_marks
    req.second_evaluator_remarks = remarks
    req.second_evaluator_status = "completed"
    req.second_evaluator_completed_at = timezone.now()
    req.status = "comparing"
    req.save()

    AuditLog.objects.create(
        action="update",
        model_name="BlindRecheckingRequest",
        object_id=str(req.id),
        description=f"Rechecking evaluation submitted for request #{req.id} by {teacher.user.email}",
    )

    try:
        NotificationService.create_notification(
            notification_type=NotificationType.RECHECKING_EVALUATION_COMPLETE,
            title="Re-evaluation Submitted",
            message=f"Blind re-evaluation for {req.exam.name} - {req.subject.name} has been submitted.",
            priority=Priority.MEDIUM,
            target_audience=TargetAudience.SPECIFIC_TEACHERS,
            target_user_ids=[teacher.user_id],
            send_email=True,
            send_realtime=True,
            metadata={
                "rechecking_id": req.id,
                "exam_name": req.exam.name,
                "subject_name": req.subject.name,
                "script_id": req.second_evaluator_script_id,
                "marks_obtained": str(marks),
                "total_marks": str(total_marks),
                "teacher_name": teacher.user.get_full_name() or teacher.user.email,
            },
        )
    except Exception:
        logger.exception("Failed to send evaluation complete notification")

    return req


# ---------------------------------------------------------------------------
# Comparison & Completion
# ---------------------------------------------------------------------------

@transaction.atomic
def compare_and_complete(request_id, admin_user):
    req = BlindRecheckingRequest.objects.select_related(
        "student", "exam", "subject", "original_evaluator", "second_evaluator",
    ).get(id=request_id)

    if req.status != "comparing":
        raise ValueError(f"Cannot compare results in status {req.status}.")

    if req.second_evaluator_status != "completed":
        raise ValueError("Second evaluation has not been submitted yet.")
    if not req.marks_obtained_original or not req.second_evaluator_marks:
        raise ValueError("Both evaluations must have marks recorded.")

    original = Decimal(str(req.marks_obtained_original or 0))
    new_marks = Decimal(str(req.second_evaluator_marks or 0))
    total = Decimal(str(req.total_marks_original or req.second_evaluator_total_marks or 0))
    diff = new_marks - original
    req.marks_difference = diff
    req.is_revised = diff != 0

    # Apply rechecking policy
    if req.rechecking_policy_applied == "use_higher":
        final_marks = max(original, new_marks)
    elif req.rechecking_policy_applied == "use_average":
        final_marks = (original + new_marks) / Decimal("2")
    elif req.rechecking_policy_applied == "use_new":
        final_marks = new_marks
    else:
        final_marks = new_marks  # use_policy defaults to new marks

    req.marks_obtained_revised = final_marks
    req.total_marks_revised = total
    pct = calculate_percentage(final_marks, total)
    grade_info = calculate_grade(pct)
    req.grade_revised = grade_info["grade"]

    # Update the PublishedResult for this specific student/subject
    published = PublishedResult.objects.filter(
        exam=req.exam, student=req.student, subject=req.subject
    ).first()
    if published:
        published.marks_obtained = final_marks
        published.total_marks = total
        published.grade = grade_info["grade"]
        published.save()
        req.revised_published_result = published

    # Recompute StudentResult for the student (only affected subjects)
    publication = ResultPublication.objects.filter(
        exam=req.exam, workflow_status="published"
    ).first()
    if publication:
        compute_student_result(publication, req.student)

    # Re-lock the student result
    if req.student_result_unlocked:
        req.student_result_unlocked.locked = True
        req.student_result_unlocked.save()

    req.status = "completed"
    req.completed_at = timezone.now()
    req.save()

    AuditLog.objects.create(
        action="update",
        model_name="BlindRecheckingRequest",
        object_id=str(req.id),
        user=admin_user,
        description=(
            f"Rechecking request #{req.id} completed. "
            f"Original: {original}/{total}, Revised: {final_marks}/{total}. "
            f"{'Revised (diff: ' + str(diff) + ')' if req.is_revised else 'No change.'}"
        ),
    )

    try:
        NotificationService.create_notification(
            notification_type=NotificationType.RECHECKING_COMPLETED,
            title="Rechecking Complete",
            message=(
                f"Your rechecking request for {req.exam.name} - {req.subject.name} has been completed. "
                f"{'Your result has been updated.' if req.is_revised else 'No change was made.'}"
            ),
            priority=Priority.HIGH if req.is_revised else Priority.MEDIUM,
            target_audience=TargetAudience.SPECIFIC_STUDENTS,
            target_user_ids=[req.student.user_id],
            send_email=True,
            send_realtime=True,
            metadata={
                "rechecking_id": req.id,
                "exam_name": req.exam.name,
                "subject_name": req.subject.name,
                "marks_obtained_original": str(original),
                "marks_obtained_revised": str(final_marks),
                "total_marks": str(total),
                "is_revised": req.is_revised,
            },
        )
    except Exception:
        logger.exception("Failed to send rechecking completion notification")

    return req
