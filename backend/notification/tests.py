import json
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status

from .models import (
    Notification, NotificationRecipient, NotificationSchedule,
    EmailTemplate, NotificationType, Priority, NotificationStatus,
    TargetAudience, ReadStatus,
)
from administration.models.notification import NotificationBroadcast

User = get_user_model()


class NotificationTestBase(TestCase):
    def setUp(self):
        self.client = Client()

        self.admin = User.objects.create_user(
            email="admin@test.com", username="admin", password="pass123",
            role="admin", is_active=True, password_changed=True,
        )
        self.director = User.objects.create_user(
            email="director@test.com", username="director", password="pass123",
            role="director", is_active=True, password_changed=True,
        )
        self.teacher_a = User.objects.create_user(
            email="teachera@test.com", username="teachera", password="pass123",
            role="teacher", is_active=True, password_changed=True,
        )
        self.teacher_b = User.objects.create_user(
            email="teacherb@test.com", username="teacherb", password="pass123",
            role="teacher", is_active=True, password_changed=True,
        )
        self.student_a = User.objects.create_user(
            email="studenta@test.com", username="studenta", password="pass123",
            role="student", is_active=True, password_changed=True,
        )
        self.student_b = User.objects.create_user(
            email="studentb@test.com", username="studentb", password="pass123",
            role="student", is_active=True, password_changed=True,
        )
        self.staff = User.objects.create_user(
            email="staff@test.com", username="staff", password="pass123",
            role="staff", is_active=True, password_changed=True,
        )

        from student.models import StudentProfile, Subject
        from teacher.models import TeacherProfile, TeacherClassAssignment
        from administration.models.teacher import TeacherSubjectAllocation

        subj = Subject.objects.create(name="Mathematics", code="MATH01", tier="core")

        self.teacher_a_profile = TeacherProfile.objects.create(
            user=self.teacher_a, assigned_subject=subj,
        )
        self.teacher_b_profile = TeacherProfile.objects.create(
            user=self.teacher_b,
        )
        self.student_a_profile = StudentProfile.objects.create(
            user=self.student_a, class_assigned="X-A", roll_number="S001",
        )
        self.student_b_profile = StudentProfile.objects.create(
            user=self.student_b, class_assigned="XI-B", roll_number="S002",
        )

        TeacherClassAssignment.objects.create(
            teacher=self.teacher_a_profile, class_name="X-A",
        )
        TeacherSubjectAllocation.objects.create(
            teacher=self.teacher_a_profile, subject=subj,
            assigned_classes=["X-A"], is_active=True,
        )

        self.notif = Notification.objects.create(
            notification_type=NotificationType.SCHOOL_ANNOUNCEMENT,
            title="Test Notification", message="Test body",
            sender=self.admin, target_audience=TargetAudience.ALL_STUDENTS,
        )
        self.recip_a = NotificationRecipient.objects.create(
            notification=self.notif, user=self.student_a,
        )
        self.recip_b = NotificationRecipient.objects.create(
            notification=self.notif, user=self.student_b,
        )

        self.email_template = EmailTemplate.objects.create(
            name="test_template", subject="Test {{ title }}",
            body_html="<p>{{ message }}</p>",
        )

        self.schedule = NotificationSchedule.objects.create(
            notification_type=NotificationType.FEE_REMINDER,
        )

        self.broadcast = NotificationBroadcast.objects.create(
            title="Broadcast", message="Hello",
            recipient_type="all_students", sent_by=self.admin,
        )

    def login(self, user):
        self.client.login(username=user.email, password="pass123")

    def assert_status(self, response, expected_status):
        self.assertEqual(response.status_code, expected_status,
                         f"Expected {expected_status}, got {response.status_code}. Body: {response.content[:500]}")


class DoesNotExist500PathsTest(NotificationTestBase):
    def test_email_template_detail_get_nonexistent(self):
        self.login(self.admin)
        resp = self.client.get("/api/notifications/email-templates/9999/")
        self.assert_status(resp, 404)

    def test_email_template_detail_patch_nonexistent(self):
        self.login(self.admin)
        resp = self.client.patch("/api/notifications/email-templates/9999/",
                                  data=json.dumps({"subject": "New"}), content_type="application/json")
        self.assert_status(resp, 404)

    def test_email_template_detail_delete_nonexistent(self):
        self.login(self.admin)
        resp = self.client.delete("/api/notifications/email-templates/9999/")
        self.assert_status(resp, 404)

    def test_email_template_preview_nonexistent(self):
        self.login(self.admin)
        resp = self.client.post("/api/notifications/email-templates/preview/",
                                 data=json.dumps({"template_id": 9999}), content_type="application/json")
        self.assert_status(resp, 404)

    def test_notification_detail_delete_nonexistent(self):
        self.login(self.admin)
        resp = self.client.delete("/api/notifications/notifications/9999/")
        self.assert_status(resp, 404)

    def test_notification_mark_read_nonexistent(self):
        self.login(self.student_a)
        resp = self.client.post("/api/notifications/notifications/9999/read/")
        self.assert_status(resp, 404)

    def test_priority_override_nonexistent(self):
        self.login(self.admin)
        resp = self.client.post("/api/notifications/priorities/override/",
                                 data=json.dumps({"notification_id": 9999, "new_priority": "high"}),
                                 content_type="application/json")
        self.assert_status(resp, 404)

    def test_schedule_detail_get_nonexistent(self):
        self.login(self.admin)
        resp = self.client.get("/api/notifications/schedules/9999/")
        self.assert_status(resp, 404)

    def test_schedule_detail_patch_nonexistent(self):
        self.login(self.admin)
        resp = self.client.patch("/api/notifications/schedules/9999/",
                                  data=json.dumps({"is_active": False}), content_type="application/json")
        self.assert_status(resp, 404)

    def test_schedule_detail_delete_nonexistent(self):
        self.login(self.admin)
        resp = self.client.delete("/api/notifications/schedules/9999/")
        self.assert_status(resp, 404)

    def test_retry_nonexistent_recipient(self):
        self.login(self.admin)
        resp = self.client.post("/api/notifications/retry/9999/")
        self.assert_status(resp, 404)

    def test_admin_broadcast_send_nonexistent(self):
        self.login(self.admin)
        resp = self.client.post("/api/admin/notifications/9999/send/")
        self.assert_status(resp, 404)

    def test_admin_student_notification_send_nonexistent_student(self):
        self.login(self.admin)
        resp = self.client.post("/api/admin/students/9999/notifications/",
                                 data=json.dumps({"title": "Hi", "message": "Test"}),
                                 content_type="application/json")
        self.assert_status(resp, 404)

    def test_admin_teacher_notify_nonexistent(self):
        self.login(self.admin)
        resp = self.client.post("/api/admin/teachers/9999/notify/",
                                 data=json.dumps({"title": "Hi", "message": "Test"}),
                                 content_type="application/json")
        self.assert_status(resp, 404)


class DirectorAccessTest(NotificationTestBase):
    def test_director_can_view_analytics(self):
        self.login(self.director)
        resp = self.client.get("/api/notifications/analytics/")
        self.assert_status(resp, 200)

    def test_director_can_view_delivery_logs(self):
        self.login(self.director)
        resp = self.client.get("/api/notifications/delivery-logs/")
        self.assert_status(resp, 200)

    def test_director_can_view_audit_logs(self):
        self.login(self.director)
        resp = self.client.get("/api/notifications/audit-logs/")
        self.assert_status(resp, 200)

    def test_director_can_view_schedules(self):
        self.login(self.director)
        resp = self.client.get("/api/notifications/schedules/")
        self.assert_status(resp, 200)

    def test_director_cannot_create_schedule(self):
        self.login(self.director)
        resp = self.client.post("/api/notifications/schedules/",
                                 data=json.dumps({"notification_type": "fee_reminder"}),
                                 content_type="application/json")
        self.assert_status(resp, 403)

    def test_director_cannot_override_priority(self):
        self.login(self.director)
        resp = self.client.post("/api/notifications/priorities/override/",
                                 data=json.dumps({"notification_id": 1, "new_priority": "high"}),
                                 content_type="application/json")
        self.assert_status(resp, 403)

    def test_director_cannot_retry(self):
        self.login(self.director)
        resp = self.client.post("/api/notifications/retry/1/")
        self.assert_status(resp, 403)

    def test_director_can_view_admin_broadcasts(self):
        self.login(self.director)
        resp = self.client.get("/api/admin/notifications/")
        self.assert_status(resp, 200)

    def test_director_can_create_admin_broadcast(self):
        self.login(self.director)
        resp = self.client.post("/api/admin/notifications/",
                                 data=json.dumps({"title": "Dir Msg", "message": "Hello", "recipient_type": "all_students"}),
                                 content_type="application/json")
        self.assert_status(resp, 201)

    def test_director_can_send_broadcast(self):
        self.login(self.director)
        b = NotificationBroadcast.objects.create(
            title="Test", message="Msg", recipient_type="all_students", sent_by=self.director,
        )
        resp = self.client.post(f"/api/admin/notifications/{b.id}/send/")
        self.assert_status(resp, 200)

    def test_director_can_send_student_notification(self):
        self.login(self.director)
        resp = self.client.post(f"/api/admin/students/{self.student_a_profile.id}/notifications/",
                                 data=json.dumps({"title": "Hello", "message": "World"}),
                                 content_type="application/json")
        self.assert_status(resp, 200)

    def test_director_can_send_teacher_notification(self):
        self.login(self.director)
        resp = self.client.post(f"/api/admin/teachers/{self.teacher_a_profile.id}/notify/",
                                 data=json.dumps({"title": "Hello", "message": "World"}),
                                 content_type="application/json")
        self.assert_status(resp, 200)


class AdminAccessTest(NotificationTestBase):
    def test_admin_can_view_analytics(self):
        self.login(self.admin)
        resp = self.client.get("/api/notifications/analytics/")
        self.assert_status(resp, 200)

    def test_admin_can_view_delivery_logs(self):
        self.login(self.admin)
        resp = self.client.get("/api/notifications/delivery-logs/")
        self.assert_status(resp, 200)

    def test_admin_can_view_audit_logs(self):
        self.login(self.admin)
        resp = self.client.get("/api/notifications/audit-logs/")
        self.assert_status(resp, 200)

    def test_admin_can_override_priority(self):
        self.login(self.admin)
        resp = self.client.post("/api/notifications/priorities/override/",
                                 data=json.dumps({"notification_id": self.notif.id, "new_priority": "high"}),
                                 content_type="application/json")
        self.assert_status(resp, 200)

    def test_admin_can_retry(self):
        self.login(self.admin)
        resp = self.client.post(f"/api/notifications/retry/{self.recip_a.id}/")
        self.assert_status(resp, 200)

    def test_admin_can_create_schedule(self):
        self.login(self.admin)
        resp = self.client.post("/api/notifications/schedules/",
                                 data=json.dumps({"notification_type": "fee_reminder"}),
                                 content_type="application/json")
        self.assert_status(resp, 201)


class TeacherOwnershipTest(NotificationTestBase):
    def test_teacher_can_send_to_own_class(self):
        self.login(self.teacher_a)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "class_announcement",
                                     "title": "Class Update", "message": "Test",
                                     "target_audience": "specific_class",
                                     "target_class": "X-A",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 201)

    def test_teacher_cannot_send_to_unassigned_class(self):
        self.login(self.teacher_a)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "class_announcement",
                                     "title": "Class Update", "message": "Test",
                                     "target_audience": "specific_class",
                                     "target_class": "XI-B",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 403)

    def test_teacher_cannot_send_to_unassigned_subject(self):
        self.login(self.teacher_a)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "subject_announcement",
                                     "title": "Subj Update", "message": "Test",
                                     "target_audience": "specific_subject",
                                     "target_subject": "Physics",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 403)

    def test_teacher_cannot_broadcast_all_students(self):
        self.login(self.teacher_a)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "school_announcement",
                                     "title": "All", "message": "Test",
                                     "target_audience": "all_students",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 403)

    def test_teacher_b_cannot_use_teacher_a_scope(self):
        self.login(self.teacher_b)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "class_announcement",
                                     "title": "Hack", "message": "Test",
                                     "target_audience": "specific_class",
                                     "target_class": "X-A",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 403)

    def test_teacher_cannot_delete_other_teacher_notification(self):
        notif = Notification.objects.create(
            notification_type=NotificationType.CLASS_ANNOUNCEMENT,
            title="By Teacher A", message="Body",
            sender=self.teacher_a,
        )
        self.login(self.teacher_b)
        resp = self.client.delete(f"/api/notifications/notifications/{notif.id}/")
        self.assert_status(resp, 403)

    def test_teacher_can_delete_own_notification(self):
        notif = Notification.objects.create(
            notification_type=NotificationType.CLASS_ANNOUNCEMENT,
            title="Own", message="Body",
            sender=self.teacher_a,
        )
        self.login(self.teacher_a)
        resp = self.client.delete(f"/api/notifications/notifications/{notif.id}/")
        self.assert_status(resp, 204)

    def test_teacher_with_no_profile_gets_403(self):
        no_profile_teacher = User.objects.create_user(
            email="noprofile@test.com", username="noprofile", password="pass123",
            role="teacher", is_active=True, password_changed=True,
        )
        self.login(no_profile_teacher)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "class_announcement",
                                     "title": "No Profile", "message": "Test",
                                     "target_audience": "specific_class",
                                     "target_class": "X-A",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 403)


class StaffScopeTest(NotificationTestBase):
    def test_staff_cannot_send_to_specific_class(self):
        self.login(self.staff)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "class_announcement",
                                     "title": "Staff Hack", "message": "Test",
                                     "target_audience": "specific_class",
                                     "target_class": "X-A",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 403)

    def test_staff_cannot_send_to_specific_subject(self):
        self.login(self.staff)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "subject_announcement",
                                     "title": "Staff Hack", "message": "Test",
                                     "target_audience": "specific_subject",
                                     "target_subject": "Mathematics",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 403)

    def test_staff_cannot_broadcast_all_students(self):
        self.login(self.staff)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "school_announcement",
                                     "title": "Staff Hack", "message": "Test",
                                     "target_audience": "all_students",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 403)


class StudentIsolationTest(NotificationTestBase):
    def test_student_can_read_own_notification(self):
        self.login(self.student_a)
        resp = self.client.get(f"/api/notifications/notifications/{self.notif.id}/")
        self.assert_status(resp, 200)

    def test_student_cannot_read_other_student_notification_directly(self):
        n2 = Notification.objects.create(
            notification_type=NotificationType.SCHOOL_ANNOUNCEMENT,
            title="Only B", message="Body",
            sender=self.admin,
        )
        NotificationRecipient.objects.create(notification=n2, user=self.student_b)
        self.login(self.student_a)
        resp = self.client.get(f"/api/notifications/notifications/{n2.id}/")
        self.assert_status(resp, 404)

    def test_student_list_own_notifications_only(self):
        self.login(self.student_a)
        resp = self.client.get("/api/notifications/notifications/")
        self.assert_status(resp, 200)
        data = resp.json()
        for item in data["results"]:
            self.assertEqual(item["recipient_id"], self.recip_a.id)

    def test_student_cannot_create_notifications(self):
        self.login(self.student_a)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "school_announcement",
                                     "title": "Hack", "message": "Test",
                                     "target_audience": "all_students",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 403)

    def test_student_can_mark_own_read(self):
        self.login(self.student_a)
        resp = self.client.post(f"/api/notifications/notifications/{self.notif.id}/read/")
        self.assert_status(resp, 200)

    def test_student_cannot_mark_others_read(self):
        self.login(self.student_a)
        resp = self.client.post("/api/notifications/notifications/9999/read/")
        self.assert_status(resp, 404)


class AnonymousProtectionTest(NotificationTestBase):
    def test_anonymous_cannot_access_any_endpoint(self):
        endpoints = [
            ("GET", "/api/notifications/notifications/"),
            ("POST", "/api/notifications/notifications/"),
            ("GET", "/api/notifications/analytics/"),
            ("GET", "/api/notifications/delivery-logs/"),
            ("GET", "/api/notifications/audit-logs/"),
            ("GET", "/api/notifications/schedules/"),
        ]
        for method, url in endpoints:
            if method == "GET":
                resp = self.client.get(url)
            else:
                resp = self.client.post(url, content_type="application/json")
            self.assertIn(resp.status_code, (401, 403),
                          f"Anonymous access to {url} returned {resp.status_code}")


class MalformedInputTest(NotificationTestBase):
    def test_create_notification_missing_fields(self):
        self.login(self.admin)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({}),
                                 content_type="application/json")
        self.assert_status(resp, 400)

    def test_create_notification_invalid_type(self):
        self.login(self.admin)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "invalid_type",
                                     "title": "Test", "message": "Body",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 400)

    def test_bulk_read_empty_ids(self):
        self.login(self.student_a)
        resp = self.client.post("/api/notifications/notifications/bulk-read/",
                                 data=json.dumps({"notification_ids": []}),
                                 content_type="application/json")
        self.assert_status(resp, 200)

    def test_priority_override_invalid_priority(self):
        self.login(self.admin)
        resp = self.client.post("/api/notifications/priorities/override/",
                                 data=json.dumps({"notification_id": 1, "new_priority": "ultra"}),
                                 content_type="application/json")
        self.assert_status(resp, 400)

    def test_email_template_preview_missing_template_id(self):
        self.login(self.admin)
        resp = self.client.post("/api/notifications/email-templates/preview/",
                                 data=json.dumps({}),
                                 content_type="application/json")
        self.assert_status(resp, 400)


class ObjectLevelAuthorizationTest(NotificationTestBase):
    def test_admin_can_delete_any_notification(self):
        self.login(self.admin)
        resp = self.client.delete(f"/api/notifications/notifications/{self.notif.id}/")
        self.assert_status(resp, 204)

    def test_sender_can_delete_own(self):
        n = Notification.objects.create(
            notification_type=NotificationType.CLASS_ANNOUNCEMENT,
            title="Self delete", message="Body",
            sender=self.teacher_a,
        )
        self.login(self.teacher_a)
        resp = self.client.delete(f"/api/notifications/notifications/{n.id}/")
        self.assert_status(resp, 204)

    def test_non_sender_non_admin_cannot_delete(self):
        n = Notification.objects.create(
            notification_type=NotificationType.CLASS_ANNOUNCEMENT,
            title="Others", message="Body",
            sender=self.teacher_a,
        )
        self.login(self.teacher_b)
        resp = self.client.delete(f"/api/notifications/notifications/{n.id}/")
        self.assert_status(resp, 403)


class ValidTeacherFlowTest(NotificationTestBase):
    def test_teacher_valid_class_notification_succeeds(self):
        self.login(self.teacher_a)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "class_announcement",
                                     "title": "Valid Class Notif",
                                     "message": "For my class",
                                     "target_audience": "specific_class",
                                     "target_class": "X-A",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 201)
        data = resp.json()
        self.assertEqual(data["title"], "Valid Class Notif")

    def test_teacher_valid_subject_notification_succeeds(self):
        self.login(self.teacher_a)
        resp = self.client.post("/api/notifications/notifications/",
                                 data=json.dumps({
                                     "notification_type": "subject_announcement",
                                     "title": "Valid Subject Notif",
                                     "message": "For my subject",
                                     "target_audience": "specific_subject",
                                     "target_subject": "Mathematics",
                                 }),
                                 content_type="application/json")
        self.assert_status(resp, 201)


class DeleteReadNotificationsThrottleTest(NotificationTestBase):
    def setUp(self):
        super().setUp()
        from django.core.cache import cache
        cache.clear()

        from rest_framework.throttling import SimpleRateThrottle
        self._original_throttle_rates = SimpleRateThrottle.THROTTLE_RATES.copy()
        SimpleRateThrottle.THROTTLE_RATES["notification_cleanup"] = "5/minute"

        self.url = "/api/notifications/notifications/delete-read/"

        notif = Notification.objects.create(
            notification_type=NotificationType.SCHOOL_ANNOUNCEMENT,
            title="Cleanup Test", message="Body",
            sender=self.admin,
        )
        self.recip_a_read = NotificationRecipient.objects.create(
            notification=notif, user=self.student_a, read_status=ReadStatus.READ,
        )
        self.recip_b_unread = NotificationRecipient.objects.create(
            notification=notif, user=self.student_b, read_status=ReadStatus.UNREAD,
        )
        notif2 = Notification.objects.create(
            notification_type=NotificationType.SCHOOL_ANNOUNCEMENT,
            title="Other User Notif", message="Body",
            sender=self.admin,
        )
        NotificationRecipient.objects.create(
            notification=notif2, user=self.student_b, read_status=ReadStatus.READ,
        )

    def tearDown(self):
        from rest_framework.throttling import SimpleRateThrottle
        SimpleRateThrottle.THROTTLE_RATES.clear()
        SimpleRateThrottle.THROTTLE_RATES.update(self._original_throttle_rates)
        super().tearDown()

    def test_authenticated_normal_request_below_threshold(self):
        self.login(self.student_a)
        resp = self.client.post(self.url, content_type="application/json")
        self.assert_status(resp, 200)
        self.assertEqual(resp.json()["deleted"], 1)

    def test_throttle_threshold_enforcement(self):
        self.login(self.student_a)
        for i in range(5):
            resp = self.client.post(self.url, content_type="application/json")
            self.assertEqual(resp.status_code, 200,
                             f"Request {i+1}/5 should be allowed, got {resp.status_code}: {resp.content[:200]}")
        resp = self.client.post(self.url, content_type="application/json")
        self.assert_status(resp, 429)

    def test_no_deletion_when_throttled(self):
        notif3 = Notification.objects.create(
            notification_type=NotificationType.SCHOOL_ANNOUNCEMENT,
            title="Pre-throttle", message="Body",
            sender=self.admin,
        )
        NotificationRecipient.objects.create(
            notification=notif3, user=self.student_a, read_status=ReadStatus.READ,
        )
        self.login(self.student_a)
        for i in range(5):
            resp = self.client.post(self.url, content_type="application/json")
            self.assertEqual(resp.status_code, 200,
                             f"Request {i+1}/5 should be allowed")
        resp = self.client.post(self.url, content_type="application/json")
        self.assert_status(resp, 429)

    def test_user_isolation(self):
        self.login(self.student_a)
        for i in range(5):
            resp = self.client.post(self.url, content_type="application/json")
            self.assertEqual(resp.status_code, 200,
                             f"User A request {i+1}/5 failed: {resp.status_code}")
        self.login(self.student_b)
        resp = self.client.post(self.url, content_type="application/json")
        self.assert_status(resp, 200)

    def test_unauthenticated_request_rejected(self):
        resp = self.client.post(self.url, content_type="application/json")
        self.assertIn(resp.status_code, (401, 403))

    def test_ownership_student_a_does_not_delete_student_b(self):
        self.login(self.student_a)
        resp = self.client.post(self.url, content_type="application/json")
        self.assert_status(resp, 200)
        self.assertEqual(resp.json()["deleted"], 1)
        b_read_remaining = NotificationRecipient.objects.filter(
            user_id=self.student_b.id, read_status=ReadStatus.READ,
        ).count()
        self.assertEqual(b_read_remaining, 1)

    def test_existing_functionality_below_threshold(self):
        self.login(self.student_a)
        resp = self.client.post(self.url, content_type="application/json")
        self.assert_status(resp, 200)
        self.assertEqual(resp.json()["deleted"], 1)
        remaining = NotificationRecipient.objects.filter(
            user_id=self.student_a.id, read_status=ReadStatus.READ,
        ).count()
        self.assertEqual(remaining, 0)
