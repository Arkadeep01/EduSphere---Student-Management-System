from datetime import date, timedelta
from django.db.models import Count, Q
from django.utils import timezone

from student.models import Attendance, StudentProfile
from administration.models.teacher import FacultyAttendance
from teacher.models import TeacherProfile


class AttendanceAdminService:
    @staticmethod
    def get_analytics():
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        records = Attendance.objects.filter(date__gte=week_ago)
        total = records.count()
        present = records.filter(status="present").count()
        absent = records.filter(status="absent").count()
        pct = round((present / total * 100) if total else 0, 1)

        by_class = []
        class_names = (
            StudentProfile.objects.exclude(class_assigned="")
            .values_list("class_assigned", flat=True)
            .distinct()
        )
        for cname in class_names:
            if not cname:
                continue
            class_records = records.filter(student__class_assigned__startswith=cname.split("-")[0])
            ctotal = class_records.count()
            cpresent = class_records.filter(status="present").count()
            by_class.append({
                "class": cname.split("-")[0],
                "present": round((cpresent / ctotal * 100) if ctotal else 0, 1),
            })

        return {
            "school": {"present": pct, "previous": pct - 2, "trend": "up" if pct >= 90 else "down"},
            "byClass": by_class,
            "weeklyTrend": [],
        }

    @staticmethod
    def get_faculty_attendance():
        today = timezone.now().date()
        teachers = TeacherProfile.objects.select_related("user", "assigned_subject").all()
        result = []
        for t in teachers:
            fa, _ = FacultyAttendance.objects.get_or_create(
                teacher=t,
                date=today,
                defaults={"status": "present", "marked_by": None},
            )
            monthly = FacultyAttendance.objects.filter(
                teacher=t, date__month=today.month, date__year=today.year
            )
            result.append({
                "id": t.id,
                "name": t.user.get_full_name() or t.user.email,
                "subject": t.assigned_subject.name if t.assigned_subject else "",
                "today": fa.status,
                "monthly": {
                    "present": monthly.filter(status="present").count(),
                    "absent": monthly.filter(status="absent").count(),
                    "leave": monthly.filter(status="leave").count(),
                    "halfDay": monthly.filter(status="half_day").count(),
                },
            })
        return result

    @staticmethod
    def mark_faculty_attendance(teacher_id, status, marked_by_user):
        today = timezone.now().date()
        teacher = TeacherProfile.objects.get(id=teacher_id)
        fa, _ = FacultyAttendance.objects.update_or_create(
            teacher=teacher,
            date=today,
            defaults={"status": status, "marked_by": marked_by_user},
        )
        return fa
