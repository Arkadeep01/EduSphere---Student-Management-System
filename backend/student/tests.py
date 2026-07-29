from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from student.models import Assignment, AssignmentSubmission, StudentProfile
from teacher.models import TeacherProfile
from authentication.models import CustomUser


class StudentAssignmentVisibilityTests(TestCase):
    def setUp(self):
        self.student_user = CustomUser.objects.create_user(
            email="student-regression@example.com",
            password="StudentPass123!",
            role="student",
            first_name="Student",
            last_name="Regression",
            is_active=True,
        )
        self.teacher_user = CustomUser.objects.create_user(
            email="teacher-regression@example.com",
            password="TeacherPass123!",
            role="teacher",
            first_name="Teacher",
            last_name="Regression",
            is_active=True,
        )
        self.student_profile = StudentProfile.objects.create(user=self.student_user, class_assigned="XII", section="A")
        from student.models import Subject
        self.subject, _ = Subject.objects.get_or_create(name="English Literature", code="ENG110", tier="core")
        self.teacher_profile = TeacherProfile.objects.create(user=self.teacher_user, assigned_subject=self.subject)

        self.assignment = Assignment.objects.create(
            title="Regression Assignment",
            description="Regression test assignment",
            subject=self.subject,
            target_class="XII-A",
            created_by=self.teacher_user,
            due_date=timezone.now() + timezone.timedelta(days=7),
        )

    def test_student_sees_assignment_for_matching_class_and_section(self):
        from student.selectors import get_assignments_for_student

        assignments = get_assignments_for_student(self.student_profile)
        self.assertEqual(assignments.count(), 1)
        self.assertEqual(assignments.first().id, self.assignment.id)
