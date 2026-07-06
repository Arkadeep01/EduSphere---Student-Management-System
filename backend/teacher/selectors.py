from django.db.models import Count, Q, Avg, F, FloatField, ExpressionWrapper, Value
from django.utils import timezone
from django.db.models.functions import Coalesce

from .models import (
    TeacherProfile, TeacherClassAssignment, TimetableEntry,
    LibrarySession, Resource, AnswerScript,
)
from student.models import StudentProfile, Subject, Attendance, Result, AssignmentSubmission


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


def get_class_student_performance(teacher_profile, class_name):
    """Get performance data for all students in a class.

    Returns a dict with class info and student performance records including
    attendance percentage, assignment average, midterm results, and overall progress.
    """
    students = get_students_in_class(teacher_profile, class_name)
    subject = teacher_profile.assigned_subject
    now = timezone.now().date()

    performance_data = []
    for student in students:
        total_days = Attendance.objects.filter(student=student).count()
        present_days = Attendance.objects.filter(
            student=student, status="present"
        ).count()
        attendance_pct = round((present_days / total_days * 100) if total_days > 0 else 0, 1)

        graded_submissions = AssignmentSubmission.objects.filter(
            student=student,
            status="evaluated",
            grade__isnull=False,
        )
        assignment_avg = graded_submissions.aggregate(
            avg=Avg("grade")
        )["avg"] or 0
        assignment_avg = round(float(assignment_avg), 1)

        midterm_result = None
        if subject:
            latest_result = Result.objects.filter(
                student=student, subject=subject
            ).order_by("-created_at").first()
            if latest_result:
                pct = round(
                    float(latest_result.marks_obtained)
                    / float(latest_result.total_marks) * 100, 1
                ) if latest_result.total_marks else 0
                midterm_result = {
                    "marks_obtained": float(latest_result.marks_obtained),
                    "total_marks": float(latest_result.total_marks),
                    "percentage": pct,
                    "grade": latest_result.grade,
                }

        overall_progress = round(assignment_avg * 0.5 + (midterm_result["percentage"] if midterm_result else 0) * 0.5, 1)

        performance_data.append({
            "id": student.id,
            "roll_number": student.roll_number or f"STU{student.id:04d}",
            "name": f"{student.user.first_name} {student.user.last_name}",
            "class": class_name,
            "attendance_percentage": attendance_pct,
            "assignment_average": assignment_avg,
            "assignment_rank": 0,
            "midterm": midterm_result,
            "overall_progress": overall_progress,
        })

    performance_data.sort(key=lambda x: x["assignment_average"], reverse=True)
    for idx, record in enumerate(performance_data, start=1):
        record["assignment_rank"] = idx

    return {
        "class_name": class_name,
        "subject": subject.name if subject else None,
        "teacher": teacher_profile.user.get_full_name() or teacher_profile.user.email,
        "total_students": len(performance_data),
        "students": performance_data,
    }
