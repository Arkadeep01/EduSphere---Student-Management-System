from django.db import models
from django.conf import settings
from student.models import Subject
from student.validators import FileExtensionValidator, FileSizeValidator


class TeacherProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="teacher_profile",
    )
    employee_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    assigned_subject = models.ForeignKey(
        Subject,
        on_delete=models.SET_NULL,
        null=True,
        related_name="teachers",
        help_text="Single subject this teacher is assigned to",
    )
    qualification = models.CharField(max_length=255, blank=True)
    experience = models.IntegerField(blank=True, null=True, help_text="Years of experience")
    profile_photo = models.ImageField(upload_to="teacher_photos/", blank=True, null=True)

    class Meta:
        verbose_name = "Teacher Profile"
        verbose_name_plural = "Teacher Profiles"

    def __str__(self):
        return f"{self.user.email} - {self.assigned_subject}"


class TeacherClassAssignment(models.Model):
    """Maps a teacher to the classes/sections they teach for their subject."""
    teacher = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name="class_assignments",
    )
    class_name = models.CharField(max_length=20, help_text="e.g. X-A, XI-B")

    class Meta:
        unique_together = ("teacher", "class_name")
        verbose_name = "Teacher Class Assignment"
        verbose_name_plural = "Teacher Class Assignments"

    def __str__(self):
        return f"{self.teacher.user.email} - {self.class_name}"


class TimetableEntry(models.Model):
    DAY_CHOICES = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
    ]
    SESSION_TYPE_CHOICES = [
        ("regular", "Regular Class"),
        ("lab", "Lab"),
        ("library", "Library Session"),
        ("recess", "Recess"),
    ]

    teacher = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name="timetable_entries",
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    class_name = models.CharField(max_length=20, help_text="e.g. X-A")
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES, default="regular")
    room = models.CharField(max_length=50, blank=True)
    is_library_converted = models.BooleanField(default=False)

    class Meta:
        ordering = ["day_of_week", "start_time"]
        verbose_name = "Timetable Entry"
        verbose_name_plural = "Timetable Entries"

    def __str__(self):
        return f"{self.teacher.user.email} - {self.class_name} ({self.get_day_of_week_display()} {self.start_time})"


class LibrarySession(models.Model):
    """Tracks library room bookings to check availability."""
    room = models.CharField(max_length=50)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    booked_by = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name="library_bookings",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("room", "date", "start_time", "end_time")
        ordering = ["-date", "start_time"]

    def __str__(self):
        return f"{self.room} - {self.date} ({self.start_time}-{self.end_time})"


class Resource(models.Model):
    TYPE_CHOICES = [
        ("note", "Note"),
        ("video", "Video"),
        ("document", "Document"),
        ("reference", "Reference"),
    ]
    ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".mp4", ".zip"]
    MAX_SIZE_BYTES = 100 * 1024 * 1024  # 100 MB

    teacher = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name="resources",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(
        upload_to="resources/",
        validators=[FileExtensionValidator(ALLOWED_EXTENSIONS), FileSizeValidator(MAX_SIZE_BYTES)],
    )
    file_size = models.PositiveIntegerField(blank=True, null=True, editable=False)
    download_count = models.PositiveIntegerField(default=0, editable=False)
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    target_class = models.CharField(max_length=20, blank=True, help_text="e.g. X-A")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def save(self, *args, **kwargs):
        if self.file and not self.file_size:
            try:
                self.file_size = self.file.size
            except Exception:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.resource_type})"


class AnswerScript(models.Model):
    EVALUATION_STATUS_CHOICES = [
        ("pending", "Pending Evaluation"),
        ("evaluating", "Evaluating"),
        ("completed", "Completed"),
    ]

    student = models.ForeignKey(
        "student.StudentProfile",
        on_delete=models.CASCADE,
        related_name="answer_scripts",
    )
    teacher = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name="evaluation_queue",
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam_name = models.CharField(max_length=100)
    script_file = models.FileField(upload_to="answer_scripts/")
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    remarks = models.TextField(blank=True)
    evaluation_status = models.CharField(
        max_length=20, choices=EVALUATION_STATUS_CHOICES, default="pending"
    )
    draft_marks = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    draft_remarks = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    evaluated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Answer Script"
        verbose_name_plural = "Answer Scripts"

    def __str__(self):
        return f"{self.student.user.email} - {self.exam_name} ({self.evaluation_status})"


class QuestionMarks(models.Model):
    answer_script = models.ForeignKey(
        AnswerScript,
        on_delete=models.CASCADE,
        related_name="question_marks",
    )
    question_label = models.CharField(max_length=50)  # e.g. "Q1", "Q2"
    question_title = models.CharField(max_length=200, blank=True)  # e.g. "Algebra"
    max_marks = models.DecimalField(max_digits=5, decimal_places=2)
    obtained_marks = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = "Question Marks"
        verbose_name_plural = "Question Marks"

    def __str__(self):
        return f"{self.question_label} ({self.obtained_marks}/{self.max_marks})"
