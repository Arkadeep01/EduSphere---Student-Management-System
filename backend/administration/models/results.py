from django.db import models
from django.conf import settings


class GradeBoundary(models.Model):
    name = models.CharField(max_length=50)
    min_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    max_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    grade_point = models.DecimalField(max_digits=3, decimal_places=2)
    is_pass = models.BooleanField(default=True)
    remarks = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-max_percentage"]
        verbose_name = "Grade Boundary"
        verbose_name_plural = "Grade Boundaries"

    def __str__(self):
        return f"{self.name} ({self.min_percentage}-{self.max_percentage}%)"

    @classmethod
    def default_boundaries(cls):
        return [
            cls(name="A+", min_percentage=90, max_percentage=100, grade_point=4.00, is_pass=True, remarks="Outstanding"),
            cls(name="A", min_percentage=80, max_percentage=89.99, grade_point=3.70, is_pass=True, remarks="Excellent"),
            cls(name="B+", min_percentage=70, max_percentage=79.99, grade_point=3.30, is_pass=True, remarks="Very Good"),
            cls(name="B", min_percentage=60, max_percentage=69.99, grade_point=3.00, is_pass=True, remarks="Good"),
            cls(name="C+", min_percentage=50, max_percentage=59.99, grade_point=2.30, is_pass=True, remarks="Satisfactory"),
            cls(name="C", min_percentage=40, max_percentage=49.99, grade_point=2.00, is_pass=True, remarks="Pass"),
            cls(name="D", min_percentage=35, max_percentage=39.99, grade_point=1.00, is_pass=False, remarks="Marginal"),
            cls(name="F", min_percentage=0, max_percentage=34.99, grade_point=0.00, is_pass=False, remarks="Fail"),
        ]


class ResultPublication(models.Model):
    WORKFLOW_CHOICES = [
        ("draft", "Draft"),
        ("review", "Under Review"),
        ("approved", "Approved"),
        ("published", "Published"),
    ]

    exam = models.ForeignKey(
        "administration.Exam", on_delete=models.CASCADE, related_name="result_publications"
    )
    academic_session = models.ForeignKey(
        "administration.AcademicSession", on_delete=models.CASCADE, related_name="result_publications", null=True, blank=True
    )
    workflow_status = models.CharField(max_length=20, choices=WORKFLOW_CHOICES, default="draft")
    is_locked = models.BooleanField(default=False)
    locked_at = models.DateTimeField(blank=True, null=True)
    locked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="locked_publications",
    )
    draft_at = models.DateTimeField(blank=True, null=True)
    draft_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="drafted_publications",
    )
    review_at = models.DateTimeField(blank=True, null=True)
    review_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reviewed_publications",
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="approved_publications",
    )
    published_at = models.DateTimeField(blank=True, null=True)
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="published_publications",
    )
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="created_publications",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Result Publication"
        verbose_name_plural = "Result Publications"

    def __str__(self):
        return f"{self.exam.name} - {self.get_workflow_status_display()}"


class StudentResult(models.Model):
    publication = models.ForeignKey(
        ResultPublication, on_delete=models.CASCADE, related_name="student_results"
    )
    student = models.ForeignKey(
        "student.StudentProfile", on_delete=models.CASCADE, related_name="exam_results"
    )
    percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    total_marks_obtained = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True)
    total_marks_max = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True)
    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    is_pass = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)
    merit_rank = models.IntegerField(blank=True, null=True)
    class_rank = models.IntegerField(blank=True, null=True)
    subject_counts = models.IntegerField(default=0)
    passed_subjects = models.IntegerField(default=0)
    failed_subjects = models.IntegerField(default=0)
    locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-percentage"]
        unique_together = ("publication", "student")
        verbose_name = "Student Result"
        verbose_name_plural = "Student Results"

    def __str__(self):
        return f"{self.student.user.email} - {self.publication.exam.name} ({self.grade})"
