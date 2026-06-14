from django.db import models
from django.conf import settings


class Subject(models.Model):
    TIER_CHOICES = [
        ("core", "Core"),
        ("specialized", "Specialized"),
        ("enrichment", "Enrichment"),
    ]

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES)
    teacher_name = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=100, blank=True, default="from-blue-500 to-indigo-500")
    progress = models.IntegerField(default=0)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.tier})"


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    roll_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    admission_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    father_name = models.CharField(max_length=100, blank=True)
    mother_name = models.CharField(max_length=100, blank=True)
    profile_photo = models.ImageField(upload_to="student_photos/", blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    class_assigned = models.CharField(max_length=20, blank=True, help_text="e.g. X-A, XI-B")
    section = models.CharField(max_length=10, blank=True)
    address = models.TextField(blank=True)
    gender = models.CharField(max_length=20, blank=True)
    blood_group = models.CharField(max_length=10, blank=True)

    class Meta:
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"

    def __str__(self):
        return f"{self.user.email} - {self.class_assigned or 'Unassigned'}"


class StudentSubject(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending Admin Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("selected", "Selected"),
        ("request_pending", "Request Pending"),
        ("not_selected", "Not Selected"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="subject_allocations",
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="student_allocations")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="not_selected")
    assigned_by_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "subject")
        verbose_name = "Student Subject"
        verbose_name_plural = "Student Subjects"

    def __str__(self):
        return f"{self.student.user.email} - {self.subject.name} ({self.status})"


class AdmissionDocument(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="admission_documents",
    )
    document = models.FileField(upload_to="admission_docs/")
    description = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.student.user.email} - {self.description or 'Document'}"


class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=False)  # Mandatory: cannot be empty
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="assignments")
    target_class = models.CharField(max_length=20, help_text="e.g. X-A")
    due_date = models.DateTimeField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_assignments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("submitted", "Submitted"),
        ("evaluated", "Evaluated"),
        ("late", "Late"),
    ]

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions",
    )
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="assignment_submissions",
    )
    file = models.FileField(upload_to="submissions/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    grade = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    remarks = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    evaluated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ("assignment", "student")
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.student.user.email} - {self.assignment.title} ({self.status})"


class Attendance(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=[("present", "Present"), ("absent", "Absent"), ("late", "Late")],
    )
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="marked_attendance",
    )
    class_assigned = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.student.user.email} - {self.date} ({self.status})"


class Result(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="results",
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam_name = models.CharField(max_length=100)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=5, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.user.email} - {self.subject.name} ({self.exam_name})"


class Timetable(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="timetable_entries",
    )
    day_of_week = models.IntegerField(choices=[(0, "Monday"), (1, "Tuesday"), (2, "Wednesday"), (3, "Thursday"), (4, "Friday"), (5, "Saturday")])
    start_time = models.TimeField()
    end_time = models.TimeField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    room = models.CharField(max_length=50, blank=True)
    is_library_session = models.BooleanField(default=False)

    class Meta:
        ordering = ["day_of_week", "start_time"]

    def __str__(self):
        return f"{self.student.user.email} - {self.subject.name} ({self.get_day_of_week_display()})"


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(
        max_length=50,
        choices=[
            ("timetable", "Timetable Change"),
            ("fee", "Fee Reminder"),
            ("exam", "Exam Update"),
            ("assignment", "Assignment"),
            ("general", "General"),
        ],
        default="general",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.title}"
