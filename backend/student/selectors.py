from django.db.models import Q, Count
from django.utils import timezone

from .models import (
    Subject, StudentProfile, StudentSubject, Assignment,
    AssignmentSubmission, Attendance, Result, Timetable, Notification,
)
from teacher.models import Resource


def get_student_dashboard_data(student_profile):
    """Aggregate dashboard metrics for a student."""
    today = timezone.now().date()
    subjects = Subject.objects.filter(
        studentsubject__student=student_profile,
        studentsubject__status="approved",
    )
    pending_assignments = Assignment.objects.filter(
        target_class=student_profile.class_assigned,
        due_date__gte=today,
    ).exclude(
        assignmentsubmission__student=student_profile,
        assignmentsubmission__status="submitted",
    ).count()
    return {
        "subjects": subjects,
        "total_subjects": subjects.count(),
        "pending_assignments": pending_assignments,
    }


def get_student_profile(user):
    """Get student profile for a user."""
    return StudentProfile.objects.filter(user=user).select_related("user").first()


def get_assigned_subjects(student_profile):
    """Get approved subjects for a student."""
    return Subject.objects.filter(
        studentsubject__student=student_profile,
        studentsubject__status="approved",
    )


def get_pending_subject_requests(student_profile):
    """Get subjects with pending approval."""
    return StudentSubject.objects.filter(
        student=student_profile,
        status="pending",
    ).select_related("subject")


def get_assignments_for_student(student_profile):
    """Get assignments relevant to the student's class."""
    return Assignment.objects.filter(
        target_class=student_profile.class_assigned,
    ).select_related("subject", "created_by")


def get_submissions_for_student(student_profile):
    """Get all submissions by a student."""
    return AssignmentSubmission.objects.filter(
        student=student_profile,
    ).select_related("assignment", "assignment__subject")


def get_attendance_for_student(student_profile, start_date=None, end_date=None):
    """Get attendance records, optionally filtered by date range."""
    qs = Attendance.objects.filter(student=student_profile)
    if start_date:
        qs = qs.filter(date__gte=start_date)
    if end_date:
        qs = qs.filter(date__lte=end_date)
    return qs.order_by("date")


def get_results_for_student(student_profile):
    """Get results for a student."""
    return Result.objects.filter(student=student_profile).select_related("subject")


def get_timetable_for_student(student_profile):
    """Get timetable for a student's class."""
    return Timetable.objects.filter(student=student_profile).order_by("day_of_week", "start_time")


def get_student_notifications(user, unread_only=False):
    """Get notifications for a student user."""
    qs = Notification.objects.filter(user=user)
    if unread_only:
        qs = qs.filter(is_read=False)
    return qs.order_by("-created_at")


def get_available_resources(student_profile):
    """Get resources shared with the student's class."""
    return Resource.objects.filter(target_class=student_profile.class_assigned)


def get_student_attendance_summary(student_profile):
    """Get attendance summary (present/total days)."""
    records = Attendance.objects.filter(student=student_profile)
    present = records.filter(status="present").count()
    total = records.count()
    return {
        "present": present,
        "absent": total - present,
        "total": total,
        "percentage": round((present / total) * 100, 2) if total > 0 else 0,
    }
