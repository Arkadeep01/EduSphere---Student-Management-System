from django.db import models
from django.conf import settings


class ClassTeacherAssignment(models.Model):
    teacher = models.ForeignKey(
        "teacher.TeacherProfile",
        on_delete=models.CASCADE,
        related_name="class_teacher_assignments",
    )
    class_name = models.CharField(max_length=20, help_text="e.g. X, XI")
    academic_year = models.CharField(max_length=20, default="2026-27")
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["class_name", "academic_year"], name="unique_class_teacher_per_year"),
            models.UniqueConstraint(fields=["teacher", "class_name", "academic_year"], name="unique_teacher_class_year"),
        ]
        verbose_name = "Class Teacher Assignment"
        verbose_name_plural = "Class Teacher Assignments"

    def __str__(self):
        return f"{self.teacher.user.email} – Class {self.class_name} ({self.academic_year})"


class TeacherSubjectAllocation(models.Model):
    teacher = models.ForeignKey(
        "teacher.TeacherProfile",
        on_delete=models.CASCADE,
        related_name="subject_allocations",
    )
    subject = models.ForeignKey(
        "student.Subject",
        on_delete=models.CASCADE,
        related_name="teacher_allocations",
    )
    assigned_classes = models.JSONField(
        default=list,
        blank=True,
        help_text="List of class names e.g. ['X-A', 'X-B']",
    )
    academic_year = models.CharField(max_length=20, default="2026-27")
    academic_session = models.ForeignKey(
        "administration.AcademicSession",
        on_delete=models.CASCADE,
        null=True,
        related_name="teacher_allocations",
    )
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    deallocation_reason = models.TextField(blank=True)
    deallocation_date = models.DateField(blank=True, null=True)
    deallocated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deallocated_subjects",
    )
    draft = models.BooleanField(default=False, help_text="Draft allocation from rollover awaiting admin confirmation")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("teacher", "subject", "academic_session")
        verbose_name = "Teacher Subject Allocation"
        verbose_name_plural = "Teacher Subject Allocations"

    def __str__(self):
        return f"{self.teacher.user.email} – {self.subject.name} ({self.academic_year})"


class FacultyAttendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("leave", "Leave"),
        ("half_day", "Half Day"),
    ]

    teacher = models.ForeignKey(
        "teacher.TeacherProfile",
        on_delete=models.CASCADE,
        related_name="faculty_attendance",
    )
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="marked_faculty_attendance",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("teacher", "date")
        verbose_name = "Faculty Attendance"
        verbose_name_plural = "Faculty Attendances"

    def __str__(self):
        return f"{self.teacher.user.email} – {self.date} ({self.status})"
