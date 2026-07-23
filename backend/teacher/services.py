from datetime import datetime
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

from .models import (
    TeacherProfile, TeacherClassAssignment, TimetableEntry,
    LibrarySession, Resource,
)
from administration.models import AnswerScriptUpload
from student.models import Attendance, StudentProfile, Subject


def get_or_create_teacher_profile(user):
    """Ensure teacher has a profile, creating one if needed."""
    profile, created = TeacherProfile.objects.get_or_create(user=user)
    return profile


def assign_class_to_teacher(teacher_profile, class_name):
    """Assign a class to a teacher."""
    assignment, created = TeacherClassAssignment.objects.get_or_create(
        teacher=teacher_profile,
        class_name=class_name,
    )
    return assignment


def create_timetable_entry(teacher_profile, data):
    """Add a timetable entry for a teacher."""
    entry = TimetableEntry.objects.create(
        teacher=teacher_profile,
        day_of_week=data["day_of_week"],
        start_time=data["start_time"],
        end_time=data["end_time"],
        class_name=data["class_name"],
        session_type=data.get("session_type", "regular"),
        room=data.get("room", ""),
    )
    return entry


def check_library_availability(room, date, start_time, end_time):
    """Check if the library room is available for a given slot."""
    conflicts = LibrarySession.objects.filter(
        room=room,
        date=date,
        start_time__lt=end_time,
        end_time__gt=start_time,
    )
    return not conflicts.exists()


def convert_to_library_session(timetable_entry, date):
    """Convert a regular timetable entry to a library session."""
    if timetable_entry.is_library_converted:
        raise ValidationError("This session is already converted to a library session.")

    # Check availability
    available = check_library_availability(
        room=timetable_entry.room,
        date=date,
        start_time=timetable_entry.start_time,
        end_time=timetable_entry.end_time,
    )
    if not available:
        raise ValidationError("Library room is not available for this slot.")

    # Create library session
    LibrarySession.objects.create(
        room=timetable_entry.room,
        date=date,
        start_time=timetable_entry.start_time,
        end_time=timetable_entry.end_time,
        booked_by=timetable_entry.teacher,
    )

    timetable_entry.is_library_converted = True
    timetable_entry.save(update_fields=["is_library_converted"])
    return timetable_entry


def toggle_attendance(student_profile, date, status, marked_by_user):
    """Mark or update attendance for a student."""
    from datetime import timedelta
    from django.utils import timezone
    cutoff = timezone.now().date() - timedelta(days=7)
    if date < cutoff:
        from django.core.exceptions import PermissionDenied
        raise PermissionDenied("Cannot mark attendance for dates more than 7 days in the past.")
    attendance, created = Attendance.objects.update_or_create(
        student=student_profile,
        date=date,
        defaults={
            "status": status,
            "marked_by": marked_by_user,
            "class_assigned": student_profile.class_assigned or "",
        },
    )
    return attendance


def bulk_mark_attendance(attendance_records, marked_by_user):
    """Mark attendance for multiple students on the same date."""
    results = []
    for record in attendance_records:
        result = toggle_attendance(
            student_profile=record["student"],
            date=record["date"],
            status=record["status"],
            marked_by_user=marked_by_user,
        )
        results.append(result)
    return results


def save_draft_marks(answer_script, marks, remarks):
    """Save draft marks for an answer script (teacher-side, not final)."""
    answer_script.draft_marks = marks
    answer_script.draft_remarks = remarks
    answer_script.evaluation_status = "evaluating"
    answer_script.save(update_fields=["draft_marks", "draft_remarks", "evaluation_status"])
    return answer_script


def submit_evaluation(answer_script, marks, total_marks, remarks):
    """Finalize evaluation for an answer script."""
    answer_script.marks_obtained = marks
    answer_script.total_marks = total_marks
    answer_script.remarks = remarks
    answer_script.evaluation_status = "completed"
    answer_script.upload_status = "evaluation_completed"
    answer_script.evaluated_at = timezone.now()
    answer_script.save(
        update_fields=[
            "marks_obtained", "total_marks", "remarks",
            "evaluation_status", "upload_status", "evaluated_at",
        ]
    )
    return answer_script


def upload_resource(teacher_profile, data, file):
    """Upload a teaching resource."""
    resource = Resource.objects.create(
        teacher=teacher_profile,
        title=data["title"],
        description=data.get("description", ""),
        file=file,
        resource_type=data["resource_type"],
        target_class=data.get("target_class", ""),
    )
    return resource


def replace_resource(resource, data, file=None):
    """Replace an existing resource's file and/or metadata."""
    if file:
        resource.file.delete(save=False)
        resource.file = file
        resource.file_size = file.size
    if "title" in data:
        resource.title = data["title"]
    if "description" in data:
        resource.description = data["description"]
    if "resource_type" in data:
        resource.resource_type = data["resource_type"]
    if "target_class" in data:
        resource.target_class = data["target_class"]
    resource.save()
    return resource


def delete_resource(resource):
    """Delete a resource and its file from storage."""
    resource.file.delete(save=False)
    resource.delete()


def increment_download_count(resource):
    """Increment the download counter for a resource."""
    resource.download_count += 1
    resource.save(update_fields=["download_count"])
    return resource


def get_available_teachers_for_subject(subject):
    """Get teachers assigned to a given subject."""
    return TeacherProfile.objects.filter(assigned_subject=subject).select_related("user")
