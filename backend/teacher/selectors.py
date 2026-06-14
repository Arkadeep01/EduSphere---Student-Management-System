from django.db.models import Count, Q, Avg
from django.utils import timezone

from .models import (
    TeacherProfile, TeacherClassAssignment, TimetableEntry,
    LibrarySession, Resource, AnswerScript,
)
from student.models import StudentProfile, Subject, Attendance, Result


def get_teacher_dashboard_data(teacher_profile):
    """Aggregate dashboard metrics for a teacher."""
    today = timezone.now().date()
    subject = teacher_profile.assigned_subject
    total_students = StudentProfile.objects.filter(
        class_assigned__in=teacher_profile.class_assignments.values("class_name")
    ).count() if subject else 0

    pending_evaluations = AnswerScript.objects.filter(
        teacher=teacher_profile,
        evaluation_status="pending",
    ).count()

    return {
        "total_students": total_students,
        "pending_evaluations": pending_evaluations,
        "assigned_subject": subject.name if subject else None,
        "total_classes": teacher_profile.class_assignments.count(),
    }


def get_teacher_profile(user):
    """Get teacher profile for a user."""
    return TeacherProfile.objects.filter(user=user).select_related("user", "assigned_subject").first()


def get_assigned_classes(teacher_profile):
    """Get list of classes assigned to a teacher."""
    return teacher_profile.class_assignments.all()


def get_students_in_class(teacher_profile, class_name):
    """Get students belonging to a specific class."""
    return StudentProfile.objects.filter(
        class_assigned=class_name,
    ).select_related("user").order_by("roll_number")


def get_today_timetable(teacher_profile):
    """Get today's timetable entries for a teacher."""
    day = timezone.now().weekday()
    return TimetableEntry.objects.filter(
        teacher=teacher_profile,
        day_of_week=day,
    ).order_by("start_time")


def get_weekly_timetable(teacher_profile):
    """Get full weekly timetable for a teacher."""
    return TimetableEntry.objects.filter(
        teacher=teacher_profile,
    ).order_by("day_of_week", "start_time")


def get_evaluation_queue(teacher_profile):
    """Get answer scripts pending evaluation."""
    return AnswerScript.objects.filter(
        teacher=teacher_profile,
    ).select_related("student", "student__user", "subject").order_by("uploaded_at")


def get_pending_evaluations(teacher_profile):
    """Get only pending evaluation items."""
    return get_evaluation_queue(teacher_profile).filter(evaluation_status="pending")


def search_answer_scripts(teacher_profile, query):
    """Search answer scripts by student name or exam name."""
    return AnswerScript.objects.filter(
        teacher=teacher_profile,
    ).filter(
        Q(student__user__first_name__icontains=query) |
        Q(student__user__last_name__icontains=query) |
        Q(exam_name__icontains=query),
    ).select_related("student", "student__user")


def get_library_bookings(teacher_profile):
    """Get library bookings made by a teacher."""
    return LibrarySession.objects.filter(booked_by=teacher_profile).order_by("-date", "start_time")


def get_teacher_resources(teacher_profile):
    """Get resources uploaded by a teacher."""
    return Resource.objects.filter(teacher=teacher_profile).order_by("-uploaded_at")


def get_class_attendance_summary(teacher_profile, class_name, date=None):
    """Get attendance summary for a specific class."""
    students = get_students_in_class(teacher_profile, class_name)
    date = date or timezone.now().date()
    records = Attendance.objects.filter(student__in=students, date=date)
    return {
        "class_name": class_name,
        "date": date,
        "total_students": students.count(),
        "present": records.filter(status="present").count(),
        "absent": records.filter(status="absent").count(),
        "students": students,
    }
