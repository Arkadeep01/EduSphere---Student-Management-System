from django.db import models
from django.conf import settings


class Exam(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("scheduled", "Scheduled"),
        ("published", "Published"),
        ("archived", "Archived"),
    ]

    name = models.CharField(max_length=200)
    date = models.DateField()
    time = models.TimeField(blank=True, null=True)
    room = models.CharField(max_length=100, blank=True)
    duration = models.CharField(max_length=50, blank=True)
    subject = models.ForeignKey(
        "student.Subject",
        on_delete=models.SET_NULL,
        null=True,
        related_name="exams",
    )
    classes = models.JSONField(default=list, blank=True, help_text="List of class names")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    academic_year = models.CharField(max_length=20, default="2026-27")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_exams",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.name} ({self.status})"


class ExamSchedule(models.Model):
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name="schedules",
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=100, blank=True)
    class_name = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.exam.name} – {self.date} ({self.start_time}-{self.end_time})"


class AnswerScriptUpload(models.Model):
    UPLOAD_STATUS_CHOICES = [
        ("pending_upload", "Pending Upload"),
        ("uploaded", "Uploaded"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
        ("assigned", "Assigned to Teacher"),
        ("evaluation_completed", "Evaluation Completed"),
        ("archived", "Archived"),
    ]

    EVALUATION_STATUS_CHOICES = [
        ("pending", "Pending Evaluation"),
        ("evaluating", "Evaluating"),
        ("completed", "Completed"),
    ]

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="answer_scripts")
    student = models.ForeignKey(
        "student.StudentProfile",
        on_delete=models.CASCADE,
        related_name="admin_answer_scripts",
    )
    subject = models.ForeignKey(
        "student.Subject",
        on_delete=models.CASCADE,
        related_name="admin_answer_scripts",
    )
    teacher = models.ForeignKey(
        "teacher.TeacherProfile",
        on_delete=models.SET_NULL,
        null=True,
        related_name="admin_evaluation_queue",
    )
    script_file = models.FileField(upload_to="staff_answer_scripts/", blank=True, null=True)

    upload_status = models.CharField(
        max_length=25, choices=UPLOAD_STATUS_CHOICES, default="pending_upload"
    )
    evaluation_status = models.CharField(
        max_length=20, choices=EVALUATION_STATUS_CHOICES, default="pending"
    )

    section = models.CharField(max_length=10, blank=True)
    roll_number = models.CharField(max_length=20, blank=True)
    registration_number = models.CharField(max_length=20, blank=True)
    script_number = models.CharField(max_length=20, blank=True)
    batch_id = models.CharField(max_length=50, blank=True, db_index=True)

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="staff_uploads",
    )
    uploaded_at = models.DateTimeField(blank=True, null=True)

    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="verified_uploads",
    )
    verified_at = models.DateTimeField(blank=True, null=True)

    verification_notes = models.TextField(blank=True)

    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    remarks = models.TextField(blank=True)
    draft_marks = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    draft_remarks = models.TextField(blank=True)
    evaluated_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.student.user.email} – {self.exam.name} ({self.get_upload_status_display()})"


class EvaluationTracking(models.Model):
    teacher = models.ForeignKey(
        "teacher.TeacherProfile",
        on_delete=models.CASCADE,
        related_name="evaluation_tracking",
    )
    subject = models.ForeignKey(
        "student.Subject",
        on_delete=models.CASCADE,
        related_name="evaluation_tracking",
    )
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="evaluation_tracking")
    total_scripts = models.IntegerField(default=0)
    pending = models.IntegerField(default=0)
    evaluating = models.IntegerField(default=0)
    completed = models.IntegerField(default=0)

    class Meta:
        unique_together = ("teacher", "exam", "subject")
        verbose_name = "Evaluation Tracking"

    def __str__(self):
        return f"{self.teacher.user.email} – {self.exam.name}"


class PublishedResult(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="published_results")
    student = models.ForeignKey(
        "student.StudentProfile",
        on_delete=models.CASCADE,
        related_name="admin_published_results",
    )
    subject = models.ForeignKey(
        "student.Subject",
        on_delete=models.CASCADE,
        related_name="admin_published_results",
    )
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=5, blank=True)
    published_at = models.DateTimeField(auto_now_add=True)
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="published_results",
    )

    class Meta:
        unique_together = ("exam", "student", "subject")
        ordering = ["-published_at"]

    def __str__(self):
        return f"{self.student.user.email} – {self.exam.name} ({self.subject.name})"
