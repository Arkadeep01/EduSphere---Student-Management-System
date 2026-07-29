from django.test import TestCase
from rest_framework.test import APIClient
import json

from authentication.models import CustomUser
from student.models import StudentProfile, Subject, StudentSubject
from teacher.models import TeacherProfile
from administration.models import AcademicSession, Class, ClassSubjectConfig


def create_user(role, email=None):
    if not email:
        email = f"{role}_test@edusphere.edu.in"
    user = CustomUser.objects.create_user(
        username=email.split("@")[0],
        email=email,
        password="testpass123",
        role=role,
        is_active=True,
    )
    user.password_changed = True
    user.needs_activation = False
    user.save()
    return user


class AccountCreationBase(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.staff_user = create_user("staff", "staff@test.com")
        cls.admin_user = create_user("admin", "admin@test.com")
        cls.teacher_user = create_user("teacher", "teacher@test.com")
        cls.student_user = create_user("student", "student@test.com")

        cls.session = AcademicSession.objects.create(
            name="2026-27", start_date="2026-04-01", end_date="2027-03-31",
            is_current=True,
        )
        cls.subject_core = Subject.objects.create(
            name="Mathematics", code="MATH", tier="core", is_active=True,
            academic_session=cls.session,
        )
        cls.subject_core2 = Subject.objects.create(
            name="English", code="ENG", tier="core", is_active=True,
            academic_session=cls.session,
        )
        cls.subject_spec = Subject.objects.create(
            name="Physics", code="PHY", tier="specialized", is_active=True,
            academic_session=cls.session,
        )
        cls.subject_enr = Subject.objects.create(
            name="Art", code="ART", tier="enrichment", is_active=True,
            academic_session=cls.session,
        )
        cls.stray_core = Subject.objects.create(
            name="StrayCore", code="STRCORE", tier="core", is_active=True,
            academic_session=cls.session,
        )

        cls.class_obj = Class.objects.create(
            name="X-A", academic_session=cls.session, capacity=40,
        )
        cls.class_config = ClassSubjectConfig.objects.create(
            class_name="X-A",
            academic_session=cls.session,
            max_additional_subjects=2, max_specialized=2, max_enriched=1,
        )
        cls.class_config.subjects.set([cls.subject_core, cls.subject_core2, cls.subject_spec, cls.subject_enr])

    def _login(self, user):
        client = APIClient()
        response = client.post("/api/login/", {
            "email": user.email,
            "password": "testpass123",
            "selected_role": user.role,
        }, format="json")
        data = json.loads(response.content)
        token = data.get("access")
        if token:
            client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return client

    def _student_payload(self):
        return {
            "email": "newstudent@example.com",
            "first_name": "New", "last_name": "Student",
            "class_assigned": "X-A", "section": "A",
            "gender": "Male", "father_name": "Father", "mother_name": "Mother",
        }

    def _teacher_payload(self):
        return {
            "email": "newteacher@example.com",
            "first_name": "New", "last_name": "Teacher",
            "department": "science", "designation": "teacher",
        }


# ═══════════════════════════════════════════════════════════════════════
# STAFF → STUDENT
# ═══════════════════════════════════════════════════════════════════════

class StaffCreateStudentTests(AccountCreationBase):

    def test_staff_can_create_student(self):
        client = self._login(self.staff_user)
        response = client.post("/api/staff/students/create/", self._student_payload(), format="json")
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)
        self.assertTrue(data["success"])
        self.assertEqual(data["email"], "newstudent@example.com")
        self.assertTrue(data["needs_activation"])

    def test_student_has_correct_role(self):
        client = self._login(self.staff_user)
        client.post("/api/staff/students/create/", self._student_payload(), format="json")
        user = CustomUser.objects.get(email="newstudent@example.com")
        self.assertEqual(user.role, "student")

    def test_student_profile_belongs_to_new_user(self):
        client = self._login(self.staff_user)
        client.post("/api/staff/students/create/", self._student_payload(), format="json")
        user = CustomUser.objects.get(email="newstudent@example.com")
        profile = StudentProfile.objects.get(user=user)
        self.assertEqual(profile.user.id, user.id)
        self.assertNotEqual(profile.user.id, self.staff_user.id)

    def test_class_section_persisted(self):
        client = self._login(self.staff_user)
        payload = self._student_payload()
        payload["class_assigned"] = "X-A"
        payload["section"] = "B"
        client.post("/api/staff/students/create/", payload, format="json")
        profile = StudentProfile.objects.get(user__email="newstudent@example.com")
        self.assertEqual(profile.class_assigned, "X-A")
        self.assertEqual(profile.section, "B")

    def test_class_aware_core_subjects_assigned(self):
        client = self._login(self.staff_user)
        client.post("/api/staff/students/create/", self._student_payload(), format="json")
        profile = StudentProfile.objects.get(user__email="newstudent@example.com")
        assigned = StudentSubject.objects.filter(student=profile, status="approved")
        assigned_ids = set(assigned.values_list("subject_id", flat=True))
        self.assertIn(self.subject_core.id, assigned_ids)
        self.assertIn(self.subject_core2.id, assigned_ids)
        self.assertNotIn(self.stray_core.id, assigned_ids)

    def test_specialized_enrichment_not_preapproved(self):
        client = self._login(self.staff_user)
        client.post("/api/staff/students/create/", self._student_payload(), format="json")
        profile = StudentProfile.objects.get(user__email="newstudent@example.com")
        assigned = StudentSubject.objects.filter(student=profile, status="approved")
        assigned_ids = set(assigned.values_list("subject_id", flat=True))
        self.assertNotIn(self.subject_spec.id, assigned_ids)
        self.assertNotIn(self.subject_enr.id, assigned_ids)

    def test_duplicate_email_rejected(self):
        CustomUser.objects.create_user(email="existing@example.com", password="test123", username="existing", role="student")
        client = self._login(self.staff_user)
        payload = self._student_payload()
        payload["email"] = "existing@example.com"
        response = client.post("/api/staff/students/create/", payload, format="json")
        self.assertEqual(response.status_code, 400)

    def test_first_login_flags(self):
        client = self._login(self.staff_user)
        client.post("/api/staff/students/create/", self._student_payload(), format="json")
        user = CustomUser.objects.get(email="newstudent@example.com")
        self.assertFalse(user.password_changed)
        self.assertTrue(user.needs_activation)
        self.assertTrue(user.is_active)


# ═══════════════════════════════════════════════════════════════════════
# STAFF → TEACHER
# ═══════════════════════════════════════════════════════════════════════

class StaffCreateTeacherTests(AccountCreationBase):

    def test_staff_can_create_teacher(self):
        client = self._login(self.staff_user)
        response = client.post("/api/staff/teachers/create/", self._teacher_payload(), format="json")
        self.assertEqual(response.status_code, 201)

    def test_teacher_has_correct_role(self):
        client = self._login(self.staff_user)
        client.post("/api/staff/teachers/create/", self._teacher_payload(), format="json")
        user = CustomUser.objects.get(email="newteacher@example.com")
        self.assertEqual(user.role, "teacher")

    def test_teacher_profile_created(self):
        client = self._login(self.staff_user)
        client.post("/api/staff/teachers/create/", self._teacher_payload(), format="json")
        user = CustomUser.objects.get(email="newteacher@example.com")
        profile = TeacherProfile.objects.get(user=user)
        self.assertEqual(profile.department, "science")
        self.assertEqual(profile.designation, "teacher")

    def test_teacher_activation_flags(self):
        client = self._login(self.staff_user)
        client.post("/api/staff/teachers/create/", self._teacher_payload(), format="json")
        user = CustomUser.objects.get(email="newteacher@example.com")
        self.assertFalse(user.password_changed)
        self.assertTrue(user.needs_activation)
        self.assertTrue(user.is_active)

    def test_teacher_duplicate_email_rejected(self):
        CustomUser.objects.create_user(email="existingt@example.com", password="test123", username="existingt", role="teacher")
        client = self._login(self.staff_user)
        payload = self._teacher_payload()
        payload["email"] = "existingt@example.com"
        response = client.post("/api/staff/teachers/create/", payload, format="json")
        self.assertEqual(response.status_code, 400)


# ═══════════════════════════════════════════════════════════════════════
# ADMIN → STUDENT
# ═══════════════════════════════════════════════════════════════════════

class AdminCreateStudentTests(AccountCreationBase):

    def test_admin_can_create_student(self):
        client = self._login(self.admin_user)
        response = client.post("/api/admin/students/", self._student_payload(), format="json")
        self.assertEqual(response.status_code, 201)

    def test_admin_student_has_correct_role(self):
        client = self._login(self.admin_user)
        p = self._student_payload()
        p["email"] = "adminstudent@example.com"
        client.post("/api/admin/students/", p, format="json")
        user = CustomUser.objects.get(email="adminstudent@example.com")
        self.assertEqual(user.role, "student")

    def test_admin_student_profile_owned_by_new_user(self):
        client = self._login(self.admin_user)
        p = self._student_payload()
        p["email"] = "adminstudent2@example.com"
        client.post("/api/admin/students/", p, format="json")
        user = CustomUser.objects.get(email="adminstudent2@example.com")
        profile = StudentProfile.objects.get(user=user)
        self.assertEqual(profile.user.id, user.id)
        self.assertNotEqual(profile.user.id, self.admin_user.id)

    def test_admin_student_class_aware_subjects(self):
        client = self._login(self.admin_user)
        p = self._student_payload()
        p["email"] = "adminstudent3@example.com"
        client.post("/api/admin/students/", p, format="json")
        profile = StudentProfile.objects.get(user__email="adminstudent3@example.com")
        assigned = StudentSubject.objects.filter(student=profile, status="approved")
        assigned_ids = set(assigned.values_list("subject_id", flat=True))
        self.assertIn(self.subject_core.id, assigned_ids)
        self.assertNotIn(self.stray_core.id, assigned_ids)

    def test_admin_student_duplicate_rejected(self):
        CustomUser.objects.create_user(email="existingas@example.com", password="test123", username="existingas", role="student")
        client = self._login(self.admin_user)
        p = self._student_payload()
        p["email"] = "existingas@example.com"
        response = client.post("/api/admin/students/", p, format="json")
        self.assertEqual(response.status_code, 400)

    def test_admin_student_activation_flags(self):
        client = self._login(self.admin_user)
        p = self._student_payload()
        p["email"] = "adminstudent4@example.com"
        client.post("/api/admin/students/", p, format="json")
        user = CustomUser.objects.get(email="adminstudent4@example.com")
        self.assertFalse(user.password_changed)
        self.assertTrue(user.needs_activation)
        self.assertTrue(user.is_active)


# ═══════════════════════════════════════════════════════════════════════
# ADMIN → TEACHER
# ═══════════════════════════════════════════════════════════════════════

class AdminCreateTeacherTests(AccountCreationBase):

    def test_admin_can_create_teacher(self):
        client = self._login(self.admin_user)
        p = self._teacher_payload()
        p["email"] = "adminteacher@example.com"
        response = client.post("/api/admin/teachers/create/", p, format="json")
        self.assertEqual(response.status_code, 201)

    def test_admin_teacher_has_correct_role(self):
        client = self._login(self.admin_user)
        p = self._teacher_payload()
        p["email"] = "adminteacher2@example.com"
        client.post("/api/admin/teachers/create/", p, format="json")
        user = CustomUser.objects.get(email="adminteacher2@example.com")
        self.assertEqual(user.role, "teacher")

    def test_admin_teacher_profile_created(self):
        client = self._login(self.admin_user)
        p = self._teacher_payload()
        p["email"] = "adminteacher3@example.com"
        client.post("/api/admin/teachers/create/", p, format="json")
        user = CustomUser.objects.get(email="adminteacher3@example.com")
        profile = TeacherProfile.objects.get(user=user)
        self.assertEqual(profile.department, "science")
        self.assertEqual(profile.designation, "teacher")
        self.assertEqual(profile.user.id, user.id)
        self.assertNotEqual(profile.user.id, self.admin_user.id)


# ═══════════════════════════════════════════════════════════════════════
# AUTHORIZATION — FORBIDDEN ACCESS
# ═══════════════════════════════════════════════════════════════════════

class AuthorizationTests(AccountCreationBase):

    # ── Staff endpoints ──

    def test_teacher_cannot_use_staff_student_create(self):
        client = self._login(self.teacher_user)
        r = client.post("/api/staff/students/create/", self._student_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_student_cannot_use_staff_student_create(self):
        client = self._login(self.student_user)
        r = client.post("/api/staff/students/create/", self._student_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_admin_cannot_use_staff_student_create(self):
        client = self._login(self.admin_user)
        r = client.post("/api/staff/students/create/", self._student_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_teacher_cannot_use_staff_teacher_create(self):
        client = self._login(self.teacher_user)
        r = client.post("/api/staff/teachers/create/", self._teacher_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_student_cannot_use_staff_teacher_create(self):
        client = self._login(self.student_user)
        r = client.post("/api/staff/teachers/create/", self._teacher_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_admin_cannot_use_staff_teacher_create(self):
        client = self._login(self.admin_user)
        r = client.post("/api/staff/teachers/create/", self._teacher_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    # ── Admin endpoints ──

    def test_staff_cannot_use_admin_student_create(self):
        client = self._login(self.staff_user)
        r = client.post("/api/admin/students/", self._student_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_teacher_cannot_use_admin_student_create(self):
        client = self._login(self.teacher_user)
        r = client.post("/api/admin/students/", self._student_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_student_cannot_use_admin_student_create(self):
        client = self._login(self.student_user)
        r = client.post("/api/admin/students/", self._student_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_staff_cannot_use_admin_teacher_create(self):
        client = self._login(self.staff_user)
        r = client.post("/api/admin/teachers/create/", self._teacher_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_teacher_cannot_use_admin_teacher_create(self):
        client = self._login(self.teacher_user)
        r = client.post("/api/admin/teachers/create/", self._teacher_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    def test_student_cannot_use_admin_teacher_create(self):
        client = self._login(self.student_user)
        r = client.post("/api/admin/teachers/create/", self._teacher_payload(), format="json")
        self.assertEqual(r.status_code, 403)

    # ── Unauthenticated ──

    def test_unauthenticated_blocked_staff_student_create(self):
        client = APIClient()
        r = client.post("/api/staff/students/create/", self._student_payload(), format="json")
        self.assertEqual(r.status_code, 401)

    def test_unauthenticated_blocked_staff_teacher_create(self):
        client = APIClient()
        r = client.post("/api/staff/teachers/create/", self._teacher_payload(), format="json")
        self.assertEqual(r.status_code, 401)

    def test_unauthenticated_blocked_admin_student_create(self):
        client = APIClient()
        r = client.post("/api/admin/students/", self._student_payload(), format="json")
        self.assertEqual(r.status_code, 401)

    def test_unauthenticated_blocked_admin_teacher_create(self):
        client = APIClient()
        r = client.post("/api/admin/teachers/create/", self._teacher_payload(), format="json")
        self.assertEqual(r.status_code, 401)

    # ── Staff profile endpoint ──

    def test_staff_profile_endpoint_accessible(self):
        client = self._login(self.staff_user)
        response = client.get("/api/staff/profile/")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn("email", data)
        self.assertEqual(data["email"], self.staff_user.email)
