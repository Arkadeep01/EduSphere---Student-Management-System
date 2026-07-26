import os

from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import serializers

from .models import (
    Subject, StudentProfile, StudentSubject, AdmissionDocument,
    Assignment, AssignmentSubmission, SubmissionFile,
)
from .validators import (
    validate_assignment_file_extension,
    validate_assignment_file_size,
    ALLOWED_ASSIGNMENT_EXTENSIONS,
)


def create_student_profile(user, data):
    """Create or update a StudentProfile for the given user."""
    profile, created = StudentProfile.objects.update_or_create(
        user=user,
        defaults={
            "roll_number": data.get("roll_number", ""),
            "admission_number": data.get("admission_number", ""),
            "father_name": data.get("father_name", ""),
            "mother_name": data.get("mother_name", ""),
            "date_of_birth": data.get("date_of_birth"),
            "class_assigned": data.get("class_assigned", ""),
            "section": data.get("section", ""),
            "address": data.get("address", ""),
        },
    )
    return profile


def assign_core_subjects(student_profile):
    """Auto-assign core subjects to a student with the current academic session."""
    from administration.models import AcademicSession
    current_session = AcademicSession.objects.filter(is_current=True).first()
    core_subjects = Subject.objects.filter(tier="core")
    for subject in core_subjects:
        StudentSubject.objects.get_or_create(
            student=student_profile,
            subject=subject,
            defaults={
                "status": "approved",
                "assigned_by_admin": True,
                "academic_session": current_session,
            },
        )


def validate_elective_counts(student_profile, subject_ids):
    """Validate that the student has selected the correct number of electives."""
    chosen = Subject.objects.filter(id__in=subject_ids)
    specialized_count = chosen.filter(tier="specialized").count()
    enriched_count = chosen.filter(tier="enriched").count()

    errors = {}
    if specialized_count < 2:
        errors["specialized"] = "Minimum 2 specialized subjects required."
    if enriched_count < 1:
        errors["enriched"] = "Minimum 1 enriched subject required."

    if errors:
        raise serializers.ValidationError(errors)


def get_current_session():
    from administration.models import AcademicSession
    return AcademicSession.objects.filter(is_current=True).first()


def add_student_subject_selection(student_profile, subject_ids):
    """Student selects elective subjects (pending admin approval)."""
    validate_elective_counts(student_profile, subject_ids)

    # Remove existing pending selections for these tiers
    chosen = Subject.objects.filter(id__in=subject_ids)
    tiers = chosen.values_list("tier", flat=True).distinct()

    StudentSubject.objects.filter(
        student=student_profile,
        subject__tier__in=tiers,
        status="pending",
    ).delete()

    current_session = get_current_session()

    # Enforce max_additional_subjects limit
    from administration.models.subject_request import SubjectRequestControl
    ctrl, _ = SubjectRequestControl.objects.get_or_create(
        session=current_session,
        defaults={"max_additional_subjects": 2},
    )
    existing_non_core_count = StudentSubject.objects.filter(
        student=student_profile,
        status="approved",
    ).exclude(subject__tier="core").count()
    new_non_core_ids = [sid for sid in subject_ids if Subject.objects.get(id=sid).tier != "core"]
    if existing_non_core_count + len(new_non_core_ids) > ctrl.max_additional_subjects:
        raise ValidationError(
            f"Cannot add {len(new_non_core_ids)} additional subject(s). "
            f"Maximum additional subjects allowed is {ctrl.max_additional_subjects} "
            f"(currently have {existing_non_core_count})."
        )

    # Create new pending entries
    for subj_id in subject_ids:
        subject = Subject.objects.get(id=subj_id)
        if subject.tier != "core":
            StudentSubject.objects.get_or_create(
                student=student_profile,
                subject=subject,
                defaults={
                    "status": "pending",
                    "assigned_by_admin": False,
                    "academic_session": current_session,
                },
            )


def approve_student_subjects(student_profile, subject_ids):
    """Admin approves selected subject allocations."""
    StudentSubject.objects.filter(
        student=student_profile,
        subject_id__in=subject_ids,
        status="pending",
    ).update(status="approved")


def reject_student_subjects(student_profile, subject_ids):
    """Admin rejects selected subject requests."""
    StudentSubject.objects.filter(
        student=student_profile,
        subject_id__in=subject_ids,
        status="pending",
    ).update(status="rejected")


def admin_assign_subjects(student_profile, subject_ids):
    """Admin directly assigns subjects (skips approval)."""
    validate_elective_counts(student_profile, subject_ids)

    chosen = Subject.objects.filter(id__in=subject_ids)
    tiers = chosen.values_list("tier", flat=True).distinct()

    # Clear existing non-core allocations for these tiers
    StudentSubject.objects.filter(
        student=student_profile,
        subject__tier__in=tiers,
    ).delete()

    current_session = get_current_session()

    for subj_id in subject_ids:
        subject = Subject.objects.get(id=subj_id)
        if subject.tier != "core":
            StudentSubject.objects.get_or_create(
                student=student_profile,
                subject=subject,
                defaults={
                    "status": "approved",
                    "assigned_by_admin": True,
                    "academic_session": current_session,
                },
            )


def withdraw_subject(student_profile, subject_id, reason, replacement_subject_id=None):
    from student.models import SubjectWithdrawalRequest, Result

    subject = Subject.objects.get(id=subject_id)

    # Check if student has marks in this subject
    has_marks = Result.objects.filter(student=student_profile, subject=subject).exists()

    # For core subjects - block withdrawal
    if subject.tier == "core":
        raise ValidationError("Core subjects cannot be withdrawn.")

    # Create withdrawal request
    replacement = None
    if replacement_subject_id:
        replacement = Subject.objects.get(id=replacement_subject_id)

    request = SubjectWithdrawalRequest.objects.create(
        student=student_profile,
        subject=subject,
        replacement_subject=replacement,
        reason=reason,
        has_marks=has_marks,
        status="pending",
    )
    return request


def approve_withdrawal(request_or_id, reviewed_by, admin_remark="", exceptional_override=False):
    if isinstance(request_or_id, int):
        from student.models import SubjectWithdrawalRequest
        req = SubjectWithdrawalRequest.objects.get(id=request_or_id)
    else:
        req = request_or_id

    if req.has_marks and not exceptional_override:
        raise ValidationError("Student has marks in this subject. Use exceptional override to proceed.")

    # Update the StudentSubject to withdrawn
    StudentSubject.objects.filter(
        student=req.student,
        subject=req.subject,
    ).update(status="withdrawn")

    # If replacement, create new enrollment
    if req.replacement_subject:
        StudentSubject.objects.get_or_create(
            student=req.student,
            subject=req.replacement_subject,
            academic_session=get_current_session(),
            defaults={"status": "approved", "assigned_by_admin": True},
        )

    req.status = "approved"
    req.reviewed_by = reviewed_by
    req.admin_remark = admin_remark
    req.exceptional_override = exceptional_override
    req.reviewed_at = timezone.now()
    req.save()
    return req


def reject_withdrawal(request_or_id, reviewed_by, admin_remark=""):
    if isinstance(request_or_id, int):
        from student.models import SubjectWithdrawalRequest
        req = SubjectWithdrawalRequest.objects.get(id=request_or_id)
    else:
        req = request_or_id

    req.status = "rejected"
    req.reviewed_by = reviewed_by
    req.admin_remark = admin_remark
    req.reviewed_at = timezone.now()
    req.save()
    return req


def create_assignment(teacher_user, data):
    """Teacher creates an assignment for their subject."""
    description = data.get("description", "").strip()
    if not description:
        raise ValidationError("Description is mandatory.")

    assignment = Assignment.objects.create(
        title=data["title"],
        description=description,
        subject_id=data["subject"],
        target_class=data["target_class"],
        due_date=data["due_date"],
        created_by=teacher_user,
    )
    return assignment


def submit_assignment(assignment, student_profile):
    """Get or create a submission record for the student."""
    submission, created = AssignmentSubmission.objects.get_or_create(
        assignment=assignment,
        student=student_profile,
        defaults={"status": "submitted"},
    )
    return submission, created


def add_submission_file(submission, uploaded_file):
    """Validate and attach a file to a submission."""
    validate_assignment_file_extension(uploaded_file)
    validate_assignment_file_size(uploaded_file)
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    sf = SubmissionFile.objects.create(
        submission=submission,
        file=uploaded_file,
        original_name=uploaded_file.name,
        file_type=ext.lstrip("."),
        file_size=uploaded_file.size,
    )
    return sf


def remove_submission_file(submission_file):
    """Remove a file from a submission (also deletes from storage)."""
    submission_file.file.delete(save=False)
    submission_file.delete()


def evaluate_submission(submission, grade, remarks):
    """Teacher evaluates a submission."""
    from django.utils import timezone
    submission.grade = grade
    submission.remarks = remarks
    submission.status = "evaluated"
    submission.evaluated_at = timezone.now()
    submission.save()
    return submission
