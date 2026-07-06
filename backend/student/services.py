from django.db import transaction
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import (
    Subject, StudentProfile, StudentSubject, AdmissionDocument,
    Assignment, AssignmentSubmission,
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
    """Auto-assign core subjects to a student."""
    core_subjects = Subject.objects.filter(tier="core")
    for subject in core_subjects:
        StudentSubject.objects.get_or_create(
            student=student_profile,
            subject=subject,
            defaults={"status": "approved", "assigned_by_admin": True},
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

    # Create new pending entries
    for subj_id in subject_ids:
        subject = Subject.objects.get(id=subj_id)
        if subject.tier != "core":
            StudentSubject.objects.get_or_create(
                student=student_profile,
                subject=subject,
                defaults={"status": "pending", "assigned_by_admin": False},
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

    for subj_id in subject_ids:
        subject = Subject.objects.get(id=subj_id)
        if subject.tier != "core":
            StudentSubject.objects.get_or_create(
                student=student_profile,
                subject=subject,
                defaults={"status": "approved", "assigned_by_admin": True},
            )


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


def submit_assignment(assignment, student_profile, file):
    """Student submits an assignment file."""
    submission, created = AssignmentSubmission.objects.update_or_create(
        assignment=assignment,
        student=student_profile,
        defaults={"file": file, "status": "submitted"},
    )
    return submission


def evaluate_submission(submission, grade, remarks):
    """Teacher evaluates a submission."""
    from django.utils import timezone
    submission.grade = grade
    submission.remarks = remarks
    submission.status = "evaluated"
    submission.evaluated_at = timezone.now()
    submission.save()
    return submission
