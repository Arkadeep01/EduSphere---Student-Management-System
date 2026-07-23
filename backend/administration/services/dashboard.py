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
        today = timezone.now().date()
        months = []
        for i in range(6):
            month_start = today.replace(day=1) - timedelta(days=30 * i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            count = StudentProfile.objects.filter(
                user__date_joined__date__lte=month_end
            ).count()
            months.append({
                "month": month_start.strftime("%b"),
                "students": count,
                "revenue": 0,
            })
        months.reverse()
        return months

    @staticmethod
    def get_attendance_data():
        today = timezone.now().date()
        days = []
        for i in range(7):
            date = today - timedelta(days=6 - i)
            day_att = Attendance.objects.filter(date=date)
            total = day_att.count()
            present = day_att.filter(status="present").count()
            days.append({
                "day": date.strftime("%a"),
                "present": present,
                "absent": total - present,
                "total": total,
            })
        return days

    @staticmethod
    def get_exam_performance():
        from administration.models.exam import PublishedResult
        results = PublishedResult.objects.values("exam__subject__name").annotate(
            avg_score=Avg("marks_obtained"),
        )[:10]
        return [
            {"subject": r["exam__subject__name"], "average": float(r["avg_score"])}
            for r in results if r["exam__subject__name"]
        ]
