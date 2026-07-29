from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from authentication.models import CustomUser
from student.models import Assignment, AssignmentSubmission, StudentProfile
from teacher.models import TeacherProfile


class TeacherSubmissionValidationTests(TestCase):
    def setUp(self):
        self.teacher_user = CustomUser.objects.create_user(
            email="teacher-grading@example.com",
            password="TeacherPass123!",
            role="teacher",
            first_name="Teacher",
            last_name="Grading",
            is_active=True,
        )
        self.student_user = CustomUser.objects.create_user(
            email="student-grading@example.com",
            password="StudentPass123!",
            role="student",
            first_name="Student",
            last_name="Grading",
            is_active=True,
        )
        from student.models import Subject
        self.subject, _ = Subject.objects.get_or_create(name="English Literature", code="ENG110", tier="core")
        self.teacher_profile = TeacherProfile.objects.create(user=self.teacher_user, assigned_subject=self.subject)
        self.student_profile = StudentProfile.objects.create(user=self.student_user, class_assigned="XII", section="A")
        self.assignment = Assignment.objects.create(
            title="Grading Assignment",
            description="Regression grading test",
            subject=self.subject,
            target_class="XII-A",
            created_by=self.teacher_user,
            due_date=timezone.now() + timezone.timedelta(days=30),
        )
        self.submission = AssignmentSubmission.objects.create(
            assignment=self.assignment,
            student=self.student_profile,
            status="submitted",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.teacher_user)

    def test_missing_grade_is_rejected_with_bad_request(self):
        response = self.client.post(
            f"/api/teacher/submissions/{self.submission.id}/marks/",
            {"remarks": "Missing grade"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("grade is required", response.data["error"])
