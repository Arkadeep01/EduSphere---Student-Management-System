from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from student.models import Assignment, AssignmentSubmission, StudentProfile, StudentSubject
from student.services import validate_elective_counts
from teacher.models import TeacherProfile, Subject
from authentication.models import CustomUser


class StudentSubjectValidationTests(TestCase):
    """Regression tests for Part 3 subject selection workflow."""

    def setUp(self):
        self.student_user = CustomUser.objects.create_user(
            email="student-subjects@example.com",
            password="StudentPass123!",
            role="student",
            first_name="Student",
            last_name="Subjects",
            is_active=True,
        )
        self.profile = StudentProfile.objects.create(
            user=self.student_user, class_assigned="XII", section="A"
        )
        # Create subjects matching real DB tiers:
        # specialized: Business Studies, Economics
        # enrichment: Geography
        # core: Mathematics
        self.sub_specialized_a, _ = Subject.objects.get_or_create(
            name="Business Studies", code="BST301", tier="specialized"
        )
        self.sub_specialized_b, _ = Subject.objects.get_or_create(
            name="Economics", code="ECO250", tier="specialized"
        )
        self.sub_enrichment, _ = Subject.objects.get_or_create(
            name="Geography", code="GEO210", tier="enrichment"
        )
        self.sub_core, _ = Subject.objects.get_or_create(
            name="Mathematics", code="MATH101", tier="core"
        )

    def test_enrichment_tier_matching(self):
        """Verify validate_elective_counts matches 'enrichment' tier correctly."""
        # Should pass: 2 specialized + 1 enrichment
        ids = [self.sub_specialized_a.id, self.sub_specialized_b.id, self.sub_enrichment.id]
        try:
            validate_elective_counts(self.profile, ids)
        except Exception as e:
            self.fail(f"validate_elective_counts raised unexpectedly: {e}")

    def test_insufficient_specialized_is_rejected(self):
        """Less than 2 specialized subjects must be rejected."""
        ids = [self.sub_specialized_a.id, self.sub_enrichment.id]
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError) as ctx:
            validate_elective_counts(self.profile, ids)
        self.assertIn("specialized", str(ctx.exception))

    def test_insufficient_enrichment_is_rejected(self):
        """Less than 1 enrichment subject must be rejected."""
        ids = [self.sub_specialized_a.id, self.sub_specialized_b.id]
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError) as ctx:
            validate_elective_counts(self.profile, ids)
        self.assertIn("enrichment", str(ctx.exception))

    def test_core_only_selection_is_rejected(self):
        """Selecting only core subjects (no electives) must be rejected."""
        ids = [self.sub_core.id]
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            validate_elective_counts(self.profile, ids)

    def test_empty_selection_is_rejected(self):
        """Empty selection must be rejected."""
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            validate_elective_counts(self.profile, [])


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
