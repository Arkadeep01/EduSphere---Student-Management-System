import csv
import io

from django.http import HttpResponse

from administration.models.export import ExportLog
from student.models import StudentProfile
from teacher.models import TeacherProfile
from student.models import Attendance


class ExportService:
    @staticmethod
    def export_students(user, file_format="csv"):
        qs = StudentProfile.objects.select_related("user").all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Name", "Email", "Roll Number", "Class", "Section"])
        for s in qs:
            writer.writerow([
                s.user.get_full_name(),
                s.user.email,
                s.roll_number,
                s.class_assigned,
                s.section,
            ])
        ExportLog.objects.create(
            user=user,
            model_name="student",
            export_type=file_format,
        )
        return output.getvalue()

    @staticmethod
    def export_teachers(user, file_format="csv"):
        qs = TeacherProfile.objects.select_related("user", "assigned_subject").all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Name", "Email", "Employee ID", "Subject", "Experience"])
        for t in qs:
            writer.writerow([
                t.user.get_full_name(),
                t.user.email,
                t.employee_id,
                t.assigned_subject.name if t.assigned_subject else "",
                t.experience,
            ])
        ExportLog.objects.create(
            user=user,
            model_name="teacher",
            export_type=file_format,
        )
        return output.getvalue()

    @staticmethod
    def export_attendance(user, file_format="csv"):
        qs = Attendance.objects.select_related("student__user").all()[:1000]
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Student", "Date", "Status", "Class"])
        for a in qs:
            writer.writerow([
                a.student.user.email,
                a.date,
                a.status,
                a.class_assigned,
            ])
        ExportLog.objects.create(
            user=user,
            model_name="attendance",
            export_type=file_format,
        )
        return output.getvalue()
