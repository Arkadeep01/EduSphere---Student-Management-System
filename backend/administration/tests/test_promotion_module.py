from datetime import date
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model

from administration.models import (
    AcademicSession, Class, PromotionLog, StudentPromotionHistory,
    PromotionRule, AcademicSessionRollover
)
from administration.services.promotion_service import (
    PromotionService, RepeatDetainService, SessionRolloverService, BulkPromotionService
)
from administration.models.fee import FeeStructure
from administration.models.results import GradeBoundary
from administration.models import ClassTeacherAssignment, TeacherSubjectAllocation
from student.models import StudentProfile, StudentSubject, Subject, Timetable
from teacher.models import TeacherProfile
from administration.models.audit_log import AuditLog

User = get_user_model()


class PromotionTestCase(TestCase):
    """Base test case with common setup."""
    
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="admin", email="admin@test.com", password="test123", is_staff=True
        )
        
        self.session_2023 = AcademicSession.objects.create(
            name="2023-24", start_date=date(2023, 4, 1), end_date=date(2024, 3, 31), is_current=True
        )
        self.session_2024 = AcademicSession.objects.create(
            name="2024-25", start_date=date(2024, 4, 1), end_date=date(2025, 3, 31), is_current=False
        )
        
        self.student_user = User.objects.create_user(
            username="student1", email="student1@test.com", password="test123"
        )
        self.student = StudentProfile.objects.create(
            user=self.student_user, class_assigned="X", section="A"
        )
        
        self.subject_math = Subject.objects.create(name="Mathematics", code="MATH", tier="core")
        self.subject_sci = Subject.objects.create(name="Science", code="SCI", tier="core")


class TestPromotion(PromotionTestCase):
    """Tests for single student promotion."""
    
    def test_promote_student_updates_class_assigned(self):
        """Verify StudentProfile.class_assigned reflects promoted class."""
        original_class = self.student.class_assigned
        
        result = PromotionService.promote_student(
            student_id=self.student.id,
            target_class="XI",
            target_section="B",
            action="promote",
            reason="Passed all exams",
            processed_by=self.admin_user,
            session_from=self.session_2023,
            session_to=self.session_2024
        )
        
        self.student.refresh_from_db()
        self.assertEqual(self.student.class_assigned, "XI")
        self.assertEqual(self.student.section, "B")
        self.assertNotEqual(self.student.class_assigned, original_class)
    
    def test_promotion_creates_history_record(self):
        """Verify StudentPromotionHistory tracks promotion."""
        result = PromotionService.promote_student(
            student_id=self.student.id,
            target_class="XI",
            action="promote",
            processed_by=self.admin_user
        )
        
        history = StudentPromotionHistory.objects.get(student=self.student)
        self.assertEqual(history.class_name, "XI")
        self.assertEqual(history.status, "promoted")
        self.assertEqual(history.academic_session, self.session_2023)
    
    def test_promotion_creates_promotion_log(self):
        """Verify PromotionLog records class transition."""
        result = PromotionService.promote_student(
            student_id=self.student.id,
            target_class="XI",
            action="promote",
            processed_by=self.admin_user
        )
        
        log = result["promotion_log"]
        self.assertEqual(log.from_class, "X")
        self.assertEqual(log.to_class, "XI")
        self.assertEqual(log.action, "promote")
        self.assertEqual(log.student, self.student)
    
    def test_promotion_creates_audit_log(self):
        """Verify AuditLog captures promotion."""
        PromotionService.promote_student(
            student_id=self.student.id,
            target_class="XI",
            action="promote",
            processed_by=self.admin_user
        )
        
        audit = AuditLog.objects.filter(
            action="promote",
            model_name="StudentProfile",
            object_id=str(self.student.id)
        ).first()
        self.assertIsNotNone(audit)
        self.assertIn("X", audit.description)
        self.assertIn("XI", audit.description)


class TestRepeatDetain(PromotionTestCase):
    """Tests for repeat and detain operations."""
    
    def test_repeat_student(self):
        """Repeat keeps student in same class."""
        result = RepeatDetainService.create_repeat_or_detain(
            student_id=self.student.id,
            action="repeat",
            reason="Failed exams",
            processed_by=self.admin_user
        )
        
        self.assertEqual(result.action, "repeat")
        self.assertEqual(result.from_class, "X")
        self.assertEqual(result.to_class, "X")
        self.student.refresh_from_db()
        self.assertEqual(self.student.class_assigned, "X")
    
    def test_detain_student(self):
        """Detain keeps student in same class."""
        result = RepeatDetainService.create_repeat_or_detain(
            student_id=self.student.id,
            action="detain",
            reason="Poor attendance",
            processed_by=self.admin_user
        )
        
        self.assertEqual(result.action, "detain")
        self.assertEqual(result.from_class, "X")
        self.assertEqual(result.to_class, "X")
        self.student.refresh_from_db()
        self.assertEqual(self.student.class_assigned, "X")


class TestBulkPromotion(PromotionTestCase):
    """Tests for bulk promotion operations."""
    
    def setUp(self):
        super().setUp()
        self.student2 = StudentProfile.objects.create(
            user=User.objects.create_user(username="student2", email="s2@test.com", password="test123"),
            class_assigned="X", section="A"
        )
        self.student3 = StudentProfile.objects.create(
            user=User.objects.create_user(username="student3", email="s3@test.com", password="test123"),
            class_assigned="X", section="B"
        )
    
    def test_bulk_promote_updates_all_class_assigned(self):
        """Bulk promotion updates class_assigned for all students."""
        student_ids = [self.student.id, self.student2.id, self.student3.id]
        
        result = BulkPromotionService.process_bulk_promotion({
            "student_ids": student_ids,
            "target_class": "XI",
            "target_section": "A",
            "action": "promote",
            "reason": "Year end promotion",
            "processed_by": self.admin_user,
        })
        
        self.assertEqual(result["students_processed"], 3)
        self.assertEqual(result["logs_created"], 3)
        
        for student in StudentProfile.objects.filter(id__in=student_ids):
            student.refresh_from_db()
            self.assertEqual(student.class_assigned, "XI")
            self.assertEqual(student.section, "A")
    
    def test_bulk_promotion_creates_history_for_each(self):
        """Bulk promotion creates history entry per student."""
        student_ids = [self.student.id, self.student2.id]
        
        BulkPromotionService.process_bulk_promotion({
            "student_ids": student_ids,
            "target_class": "XI",
            "action": "promote",
            "processed_by": self.admin_user,
        })
        
        histories = StudentPromotionHistory.objects.filter(student_id__in=student_ids)
        self.assertEqual(histories.count(), 2)
        for h in histories:
            self.assertEqual(h.class_name, "XI")
            self.assertEqual(h.status, "promoted")
    
    def test_bulk_promotion_creates_audit_log(self):
        """Bulk promotion creates single audit log."""
        student_ids = [self.student.id]
        
        BulkPromotionService.process_bulk_promotion({
            "student_ids": student_ids,
            "target_class": "XI",
            "action": "promote",
            "processed_by": self.admin_user,
        })
        
        audit = AuditLog.objects.filter(action="bulk_promotion").first()
        self.assertIsNotNone(audit)


class TestRollback(PromotionTestCase):
    """Tests for rollback operations."""
    
    def test_rollback_restores_class_assigned(self):
        """Rollback restores student's previous class."""
        PromotionService.promote_student(
            student_id=self.student.id,
            target_class="XI",
            action="promote",
            processed_by=self.admin_user
        )
        self.student.refresh_from_db()
        self.assertEqual(self.student.class_assigned, "XI")
        
        log = PromotionLog.objects.get(student=self.student, action="promote")
        rollback_log = RepeatDetainService.rollback(
            promotion_log_id=log.id,
            reason="Wrong class",
            processed_by=self.admin_user
        )
        
        self.student.refresh_from_db()
        self.assertEqual(self.student.class_assigned, "X")
        
        self.assertEqual(rollback_log.action, "rollback")
        self.assertEqual(rollback_log.from_class, "XI")
        self.assertEqual(rollback_log.to_class, "X")
        self.assertEqual(rollback_log.rollback_of, log)
        log.refresh_from_db()
        self.assertEqual(log.rollback_of, rollback_log)
    
    def test_rollback_preserves_history(self):
        """Rollback never deletes historical records."""
        PromotionService.promote_student(
            student_id=self.student.id,
            target_class="XI",
            action="promote",
            processed_by=self.admin_user
        )
        
        original_history_count = StudentPromotionHistory.objects.count()
        original_log_count = PromotionLog.objects.count()
        
        log = PromotionLog.objects.get(student=self.student, action="promote")
        RepeatDetainService.rollback(
            promotion_log_id=log.id,
            reason="Error",
            processed_by=self.admin_user
        )
        
        self.assertEqual(StudentPromotionHistory.objects.count(), original_history_count)
        self.assertEqual(PromotionLog.objects.count(), original_log_count + 1)
    
    def test_rollback_creates_audit_log(self):
        """Rollback creates audit trail."""
        PromotionService.promote_student(
            student_id=self.student.id,
            target_class="XI",
            action="promote",
            processed_by=self.admin_user
        )
        log = PromotionLog.objects.get(student=self.student, action="promote")
        
        RepeatDetainService.rollback(
            promotion_log_id=log.id,
            reason="Test rollback",
            processed_by=self.admin_user
        )
        
        audit = AuditLog.objects.filter(action="rollback", model_name="PromotionLog").first()
        self.assertIsNotNone(audit)


class TestSessionRollover(PromotionTestCase):
    """Tests for academic session rollover."""
    
    def setUp(self):
        super().setUp()
        self.teacher_user = User.objects.create_user(
            username="teacher1", email="t1@test.com", password="test123"
        )
        self.teacher = TeacherProfile.objects.create(user=self.teacher_user)
        
        TeacherSubjectAllocation.objects.create(
            teacher=self.teacher,
            subject=self.subject_math,
            assigned_classes=["X-A", "X-B"],
            academic_year=self.session_2023.name
        )
        
        StudentSubject.objects.create(
            student=self.student,
            subject=self.subject_math,
            academic_session=self.session_2023,
            status="approved",
            assigned_by_admin=True
        )
        
        Timetable.objects.create(
            student=self.student,
            day_of_week=0,
            start_time="09:00",
            end_time="10:00",
            subject=self.subject_math,
            room="101"
        )
        
        FeeStructure.objects.create(
            class_name="X",
            academic_session=self.session_2023.name,
            late_fine_per_day=50,
            is_active=True
        )
        
        GradeBoundary.objects.create(
            name="A", min_percentage=90, max_percentage=100, grade_point=10, is_pass=True
        )
        
        Class.objects.create(
            name="X", academic_session=self.session_2023, section="A", capacity=40
        )
        ClassTeacherAssignment.objects.create(
            teacher=self.teacher, class_name="X", academic_year=self.session_2023.name
        )
    
    def test_rollover_copies_teacher_allocations(self):
        """Teacher allocations carried forward to new session."""
        rollover = SessionRolloverService.create_rollover(
            from_session_id=self.session_2023.id,
            to_session_id=self.session_2024.id,
            copy_options=["teachers"],
            processed_by=self.admin_user
        )
        
        new_alloc = TeacherSubjectAllocation.objects.get(
            teacher=self.teacher,
            subject=self.subject_math,
            academic_year=self.session_2024.name
        )
        self.assertEqual(new_alloc.assigned_classes, ["X-A", "X-B"])
    
    def test_rollover_copies_student_subject_allocations(self):
        """Student subject allocations carried forward (not master Subject records)."""
        rollover = SessionRolloverService.create_rollover(
            from_session_id=self.session_2023.id,
            to_session_id=self.session_2024.id,
            copy_options=["subjects"],
            processed_by=self.admin_user
        )
        
        new_alloc = StudentSubject.objects.get(
            student=self.student,
            subject=self.subject_math,
            academic_session=self.session_2024
        )
        self.assertEqual(new_alloc.status, "not_selected")
        self.assertFalse(new_alloc.assigned_by_admin)
    
    def test_rollover_creates_new_timetable_entries(self):
        """Timetable entries created fresh (no academic_session field on Timetable)."""
        original_count = Timetable.objects.filter(student=self.student).count()
        
        SessionRolloverService.create_rollover(
            from_session_id=self.session_2023.id,
            to_session_id=self.session_2024.id,
            copy_options=["timetables"],
            processed_by=self.admin_user
        )
        
        new_count = Timetable.objects.filter(student=self.student).count()
        self.assertEqual(new_count, original_count * 2)
    
    def test_rollover_copies_fee_structures(self):
        """Fee structures copied with new session name."""
        SessionRolloverService.create_rollover(
            from_session_id=self.session_2023.id,
            to_session_id=self.session_2024.id,
            copy_options=["fee_structures"],
            processed_by=self.admin_user
        )
        
        new_fs = FeeStructure.objects.get(
            class_name="X",
            academic_session=self.session_2024.name
        )
        self.assertEqual(new_fs.late_fine_per_day, 50)
    
    def test_rollover_copies_class_structure(self):
        """Class structure and teacher assignments copied."""
        SessionRolloverService.create_rollover(
            from_session_id=self.session_2023.id,
            to_session_id=self.session_2024.id,
            copy_options=["classes"],
            processed_by=self.admin_user
        )
        
        new_class = Class.objects.get(name="X", academic_session=self.session_2024)
        self.assertEqual(new_class.section, "A")
        self.assertEqual(new_class.capacity, 40)
        
        new_cta = ClassTeacherAssignment.objects.get(
            teacher=self.teacher,
            class_name="X",
            academic_year=self.session_2024.name
        )
        self.assertIsNotNone(new_cta)
    
    def test_rollover_excludes_result_records(self):
        """Result records NOT copied during rollover."""
        from administration.models.results import ResultPublication, StudentResult
        
        publication = ResultPublication.objects.create(
            name="Term 1", academic_session=self.session_2023, status="published"
        )
        StudentResult.objects.create(
            student=self.student,
            publication=publication,
            total_marks_obtained=450,
            total_marks_max=500,
            is_pass=True
        )
        
        SessionRolloverService.create_rollover(
            from_session_id=self.session_2023.id,
            to_session_id=self.session_2024.id,
            copy_options=["all"],
            processed_by=self.admin_user
        )
        
        results_in_new = StudentResult.objects.filter(
            student=self.student,
            publication__academic_session=self.session_2024
        )
        self.assertEqual(results_in_new.count(), 0)
    
    def test_rollover_all_option_processes_everything_once(self):
        """copy_options=['all'] processes each item exactly once."""
        SessionRolloverService.create_rollover(
            from_session_id=self.session_2023.id,
            to_session_id=self.session_2024.id,
            copy_options=["all"],
            processed_by=self.admin_user
        )
        
        self.assertTrue(TeacherSubjectAllocation.objects.filter(academic_year=self.session_2024.name).exists())
        self.assertTrue(StudentSubject.objects.filter(academic_session=self.session_2024).exists())
        self.assertEqual(Timetable.objects.filter(student=self.student).count(), 2)
        self.assertTrue(FeeStructure.objects.filter(academic_session=self.session_2024.name).exists())
        self.assertTrue(Class.objects.filter(academic_session=self.session_2024).exists())
        
        rollover = AcademicSessionRollover.objects.get(from_session=self.session_2023, to_session=self.session_2024)
        self.assertEqual(rollover.status, "completed")


class TestArchive(PromotionTestCase):
    """Tests for archive functionality."""
    
    def test_mark_session_archived(self):
        """Archive sets is_archived=True on session."""
        self.assertFalse(self.session_2023.is_archived)
        
        SessionRolloverService.mark_session_as_archived(self.session_2023.id)
        
        self.session_2023.refresh_from_db()
        self.assertTrue(self.session_2023.is_archived)
    
    def test_archive_creates_audit_log(self):
        """Archive operation creates audit trail."""
        SessionRolloverService.mark_session_as_archived(self.session_2023.id)
        
        audit = AuditLog.objects.filter(action="archive", model_name="AcademicSession").first()
        self.assertIsNotNone(audit)
        self.assertTrue(audit.new_value.get("is_archived"))


class TestAcademicSession(PromotionTestCase):
    """Tests for academic session management."""
    
    def test_create_new_session(self):
        """New academic session can be created."""
        new_session = AcademicSession.objects.create(
            name="2025-26", start_date=date(2025, 4, 1), end_date=date(2026, 3, 31)
        )
        self.assertEqual(new_session.name, "2025-26")
        self.assertFalse(new_session.is_current)
        self.assertFalse(new_session.is_archived)
    
    def test_only_one_current_session(self):
        """Setting is_current=True unsets others."""
        new_session = AcademicSession.objects.create(
            name="2025-26", start_date=date(2025, 4, 1), end_date=date(2026, 3, 31), is_current=True
        )
        
        self.session_2023.refresh_from_db()
        self.assertFalse(self.session_2023.is_current)
        self.assertTrue(new_session.is_current)


class TestEdgeCases(PromotionTestCase):
    """Tests for edge cases and error conditions."""
    
    def test_duplicate_promotion_prevention(self):
        """Multiple promotions create separate history entries."""
        PromotionService.promote_student(
            student_id=self.student.id, target_class="XI", action="promote", processed_by=self.admin_user
        )
        first_class = self.student.class_assigned
        
        PromotionService.promote_student(
            student_id=self.student.id, target_class="XII", action="promote", processed_by=self.admin_user
        )
        
        self.student.refresh_from_db()
        self.assertEqual(self.student.class_assigned, "XII")
        
        histories = StudentPromotionHistory.objects.filter(student=self.student)
        self.assertEqual(histories.count(), 2)
        self.assertEqual(histories.first().class_name, "XII")
        self.assertEqual(histories.last().class_name, "XI")
    
    def test_invalid_promotion_action(self):
        """Invalid action raises error."""
        with self.assertRaises(Exception):
            PromotionService.promote_student(
                student_id=self.student.id,
                target_class="XI",
                action="invalid_action",
                processed_by=self.admin_user
            )
    
    def test_promote_nonexistent_student(self):
        """Promoting nonexistent student raises error."""
        with self.assertRaises(StudentProfile.DoesNotExist):
            PromotionService.promote_student(
                student_id=99999,
                target_class="XI",
                action="promote",
                processed_by=self.admin_user
            )
    
    def test_rollback_nonexistent_log(self):
        """Rolling back nonexistent log raises error."""
        with self.assertRaises(PromotionLog.DoesNotExist):
            RepeatDetainService.rollback(
                promotion_log_id=99999,
                reason="Test",
                processed_by=self.admin_user
            )
    
    def test_rollover_with_archived_source_fails(self):
        """Rollover from archived session should work (archive is read-only for modifications)."""
        self.session_2023.is_archived = True
        self.session_2023.save()
        
        rollover = SessionRolloverService.create_rollover(
            from_session_id=self.session_2023.id,
            to_session_id=self.session_2024.id,
            copy_options=["subjects"],
            processed_by=self.admin_user
        )
        self.assertEqual(rollover.status, "completed")


class TestPromotionRules(PromotionTestCase):
    """Tests for optional promotion rules."""
    
    def setUp(self):
        super().setUp()
        self.rule = PromotionRule.objects.create(
            name="X to XI Rule",
            from_class="X",
            min_percentage=40,
            min_attendance_percentage=75,
            max_failed_subjects=1,
            is_active=True
        )
        
        from administration.models.results import ResultPublication, StudentResult
        pub = ResultPublication.objects.create(
            name="Final", academic_session=self.session_2023, status="published"
        )
        StudentResult.objects.create(
            student=self.student, publication=pub,
            total_marks_obtained=450, total_marks_max=500, is_pass=True
        )
    
    def test_rule_based_promotion_eligible(self):
        """Eligible student passes rule-based promotion."""
        result = PromotionService.promote_student(
            student_id=self.student.id,
            target_class="XI",
            action="promote",
            rule_based=True,
            processed_by=self.admin_user
        )
        
        self.student.refresh_from_db()
        self.assertEqual(self.student.class_assigned, "XI")
    
    def test_manual_promotion_bypasses_rules(self):
        """Manual promotion always works regardless of rules."""
        self.student.class_assigned = "X"
        self.student.save()
        
        StudentResult.objects.filter(student=self.student).update(total_marks_obtained=100)
        
        result = PromotionService.promote_student(
            student_id=self.student.id,
            target_class="XI",
            action="promote",
            rule_based=False,
            processed_by=self.admin_user
        )
        
        self.student.refresh_from_db()
        self.assertEqual(self.student.class_assigned, "XI")