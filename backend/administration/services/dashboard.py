from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta

from student.models import StudentProfile
from teacher.models import TeacherProfile
from student.models import Attendance, Result
from administration.models.event import Event
from administration.models.exam import Exam


class DashboardService:
    @staticmethod
    def get_summary():
        total_students = StudentProfile.objects.count()
        total_teachers = TeacherProfile.objects.count()

        classes_set = set()
        for s in StudentProfile.objects.values_list("class_assigned", flat=True):
            if s:
                classes_set.add(s.split("-")[0] if "-" in s else s)
        total_classes = len(classes_set)

        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        attendance = Attendance.objects.filter(date__gte=week_ago)
        total_attendance = attendance.count()
        present_attendance = attendance.filter(status="present").count()
        attendance_pct = round((present_attendance / total_attendance * 100) if total_attendance else 0, 1)

        upcoming_exams = Exam.objects.filter(
            status__in=["scheduled", "published"],
            date__gte=today,
        ).count()

        upcoming_events = Event.objects.filter(
            status="published",
            date__gte=today,
        ).count()

        return {
            "students": total_students,
            "teachers": total_teachers,
            "classes": total_classes,
            "attendance": attendance_pct,
            "upcomingExams": upcoming_exams,
            "upcomingEvents": upcoming_events,
        }

    @staticmethod
    def get_student_growth():
        return []

    @staticmethod
    def get_attendance_data():
        return []

    @staticmethod
    def get_exam_performance():
        return []
