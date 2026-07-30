import io
import os
import tempfile

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile

from rest_framework.test import APIClient
from rest_framework import status

from PIL import Image

from administration.models.website import WebsiteImage
from administration.models.facility import FacilityImage
from administration.models.cms import GalleryImage
from administration.utils.image_validation import (
    validate_uploaded_image,
    MAX_IMAGE_SIZE_BYTES,
)

User = get_user_model()


def _make_img_bytes(fmt="PNG", size=(1, 1)):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color="red")
    img.save(buf, fmt)
    return buf.getvalue()


def _upload(fmt="PNG", name=None, content_type=None, size=(1, 1)):
    if name is None:
        name = f"test.{fmt.lower()}"
    if content_type is None:
        content_type = f"image/{fmt.lower()}"
    return SimpleUploadedFile(name, _make_img_bytes(fmt, size), content_type=content_type)


def _admin_user():
    user, _ = User.objects.get_or_create(
        username="testadmin", email="admin@test.edu", defaults={"role": "admin", "is_active": True},
    )
    user.set_password("testpass")
    user.save()
    return user


def _auth_client(user=None):
    if user is None:
        user = _admin_user()
    c = APIClient()
    c.force_authenticate(user=user)
    return c


def _oversized_upload():
    mini = _make_img_bytes("PNG")
    big_data = mini * ((MAX_IMAGE_SIZE_BYTES // len(mini)) + 2)
    return SimpleUploadedFile("oversized.png", big_data, content_type="image/png")


# ---------------------------------------------------------------------------
# Unit — image_validation utility
# ---------------------------------------------------------------------------

class ImageValidationTests(TestCase):
    def test_valid_png_passes(self):
        self.assertEqual(validate_uploaded_image(_upload("PNG")), [])

    def test_valid_jpeg_passes(self):
        self.assertEqual(validate_uploaded_image(_upload("JPEG")), [])

    def test_valid_webp_passes(self):
        self.assertEqual(validate_uploaded_image(_upload("WEBP")), [])

    def test_valid_gif_passes(self):
        self.assertEqual(validate_uploaded_image(_upload("GIF")), [])

    def test_no_file_fails(self):
        self.assertGreater(len(validate_uploaded_image(None)), 0)

    def test_oversized_file_fails(self):
        errs = validate_uploaded_image(_oversized_upload())
        self.assertTrue(any("exceeds maximum size" in e for e in errs))

    def test_bmp_extension_fails(self):
        f = _upload("PNG", name="test.bmp", content_type="image/bmp")
        errs = validate_uploaded_image(f)
        self.assertTrue(any("extension" in e.lower() for e in errs))

    def test_wrong_mime_fails(self):
        f = _upload("PNG", content_type="text/plain")
        errs = validate_uploaded_image(f)
        self.assertTrue(any("MIME" in e for e in errs))

    def test_corrupt_file_fails(self):
        f = SimpleUploadedFile("bad.jpg", b"notanimagefile", content_type="image/jpeg")
        errs = validate_uploaded_image(f)
        self.assertTrue(any("corrupt" in e.lower() or "valid" in e.lower() for e in errs))

    def test_renamed_non_image_fails(self):
        f = SimpleUploadedFile("image.png", b"<?php echo 'xss'; ?>", content_type="image/png")
        errs = validate_uploaded_image(f)
        self.assertTrue(any("corrupt" in e.lower() or "valid" in e.lower() for e in errs))

    def test_fake_png_header_fails(self):
        f = SimpleUploadedFile("fake.png", b"\x89PNG\r\n\x1a\n" + b"garbagebody", content_type="image/png")
        errs = validate_uploaded_image(f)
        self.assertTrue(any("corrupt" in e.lower() or "valid" in e.lower() for e in errs))


# ---------------------------------------------------------------------------
# Media storage override
# ---------------------------------------------------------------------------

MEDIA_TEMP = tempfile.mkdtemp()


_FILESYSTEM_STORAGE = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}


@override_settings(MEDIA_ROOT=MEDIA_TEMP, STORAGES=_FILESYSTEM_STORAGE)
class MediaPipelineAuthTests(TestCase):
    """Authorization: unauthenticated and non-admin users rejected."""

    @classmethod
    def setUpTestData(cls):
        cls.admin = _admin_user()
        cls.non_admin = User.objects.create_user(
            username="student1", email="student@test.edu", password="pass", role="student", is_active=True,
        )

    def setUp(self):
        self.anon = APIClient()
        self.admin_client = _auth_client(self.admin)
        self.student_client = APIClient()
        self.student_client.force_authenticate(user=self.non_admin)

    def test_slot_upload_requires_auth(self):
        self.assertEqual(self.anon.post("/api/admin/settings/slots/home_hero/", {"image": _upload()}).status_code,
                         status.HTTP_401_UNAUTHORIZED)

    def test_slot_upload_rejects_non_admin(self):
        self.assertEqual(self.student_client.post("/api/admin/settings/slots/home_hero/", {"image": _upload()}).status_code,
                         status.HTTP_403_FORBIDDEN)

    def test_slot_list_requires_auth(self):
        self.assertEqual(self.anon.get("/api/admin/settings/slots/").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_facility_upload_requires_auth(self):
        self.assertEqual(self.anon.post("/api/admin/settings/facilities/upload/", {"image": _upload(), "name": "T"}).status_code,
                         status.HTTP_401_UNAUTHORIZED)

    def test_facility_upload_rejects_non_admin(self):
        self.assertEqual(self.student_client.post("/api/admin/settings/facilities/upload/", {"image": _upload(), "name": "T"}).status_code,
                         status.HTTP_403_FORBIDDEN)

    def test_gallery_upload_requires_auth(self):
        self.assertEqual(self.anon.post("/api/admin/settings/gallery/", {"image": _upload()}).status_code,
                         status.HTTP_401_UNAUTHORIZED)

    def test_gallery_upload_rejects_non_admin(self):
        self.assertEqual(self.student_client.post("/api/admin/settings/gallery/", {"image": _upload()}).status_code,
                         status.HTTP_403_FORBIDDEN)

    def test_public_endpoints_allow_anonymous(self):
        for path in ("/api/public/website/slots/", "/api/public/website/gallery/", "/api/public/website/facilities/"):
            self.assertEqual(self.anon.get(path).status_code, status.HTTP_200_OK)

    def test_public_endpoints_reject_write(self):
        for path in ("/api/public/website/slots/", "/api/public/website/gallery/", "/api/public/website/facilities/"):
            self.assertIn(self.anon.post(path, {"image": _upload()}).status_code,
                          (status.HTTP_405_METHOD_NOT_ALLOWED, status.HTTP_404_NOT_FOUND))


@override_settings(MEDIA_ROOT=MEDIA_TEMP, STORAGES=_FILESYSTEM_STORAGE)
class MediaPipelineUploadTests(TestCase):
    """Upload success and validation failure paths."""

    @classmethod
    def setUpTestData(cls):
        cls.admin = _admin_user()

    def setUp(self):
        self.client = _auth_client(self.admin)

    def test_valid_slot_upload_succeeds(self):
        resp = self.client.post("/api/admin/settings/slots/home_hero/", {"image": _upload()})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(WebsiteImage.objects.filter(slot="home_hero").exists())

    def test_valid_facility_upload_succeeds(self):
        resp = self.client.post("/api/admin/settings/facilities/upload/", {"image": _upload(), "name": "Library"})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(FacilityImage.objects.filter(name="Library").exists())

    def test_valid_gallery_upload_succeeds(self):
        resp = self.client.post("/api/admin/settings/gallery/", {"image": _upload(), "label": "Test"})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(GalleryImage.objects.filter(label="Test").exists())

    def test_slot_upload_no_image_fails(self):
        self.assertEqual(self.client.post("/api/admin/settings/slots/home_hero/", {}).status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_slot_upload_oversized_fails(self):
        resp = self.client.post("/api/admin/settings/slots/home_hero/", {"image": _oversized_upload()})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("exceeds maximum size", str(resp.data.get("error", "")))

    def test_slot_upload_corrupt_fails(self):
        f = SimpleUploadedFile("bad.png", b"notanimage", content_type="image/png")
        self.assertEqual(self.client.post("/api/admin/settings/slots/home_hero/", {"image": f}).status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_slot_upload_wrong_extension_fails(self):
        self.assertEqual(self.client.post("/api/admin/settings/slots/home_hero/", {"image": _upload("PNG", name="test.bmp", content_type="image/bmp")}).status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_slot_upload_wrong_mime_fails(self):
        self.assertEqual(self.client.post("/api/admin/settings/slots/home_hero/", {"image": _upload(content_type="text/plain")}).status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_slot_upload_renamed_non_image_fails(self):
        f = SimpleUploadedFile("image.png", b"<?php echo 'xss'; ?>", content_type="image/png")
        self.assertEqual(self.client.post("/api/admin/settings/slots/home_hero/", {"image": f}).status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_slot_upload_invalid_slot_fails(self):
        self.assertEqual(self.client.post("/api/admin/settings/slots/bad_slot/", {"image": _upload()}).status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_facility_upload_no_name_fails(self):
        self.assertEqual(self.client.post("/api/admin/settings/facilities/upload/", {"image": _upload()}).status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_facility_upload_oversized_fails(self):
        self.assertEqual(self.client.post("/api/admin/settings/facilities/upload/", {"image": _oversized_upload(), "name": "T"}).status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_gallery_upload_oversized_fails(self):
        self.assertEqual(self.client.post("/api/admin/settings/gallery/", {"image": _oversized_upload()}).status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_slot_path_traversal_safe(self):
        f = SimpleUploadedFile("../../etc/passwd.png", _make_img_bytes(), content_type="image/png")
        self.client.post("/api/admin/settings/slots/home_hero/", {"image": f})
        obj = WebsiteImage.objects.get(slot="home_hero")
        self.assertNotIn("etc", obj.image.name)


@override_settings(MEDIA_ROOT=MEDIA_TEMP, STORAGES=_FILESYSTEM_STORAGE)
class MediaPipelineReplacementTests(TestCase):
    """Safe replacement: old preserved on failure, cleaned on success."""

    @classmethod
    def setUpTestData(cls):
        cls.admin = _admin_user()

    def setUp(self):
        self.client = _auth_client(self.admin)

    def test_slot_replacement_switches_to_new_and_cleans_old(self):
        self.client.post("/api/admin/settings/slots/home_hero/", {"image": _upload("PNG")})
        old_path = WebsiteImage.objects.get(slot="home_hero").image.path

        self.client.post("/api/admin/settings/slots/home_hero/", {"image": _upload("JPEG")})
        obj = WebsiteImage.objects.get(slot="home_hero")
        self.assertNotEqual(obj.image.path, old_path)
        self.assertFalse(os.path.exists(old_path))

    def test_slot_replacement_preserves_old_on_validation_failure(self):
        self.client.post("/api/admin/settings/slots/home_hero/", {"image": _upload("PNG")})
        original = WebsiteImage.objects.get(slot="home_hero")
        original_path = original.image.path

        self.client.post("/api/admin/settings/slots/home_hero/",
                         {"image": SimpleUploadedFile("bad.png", b"bad", content_type="image/png")})

        obj = WebsiteImage.objects.get(slot="home_hero")
        self.assertEqual(obj.image.path, original_path)
        self.assertTrue(os.path.exists(original_path))

    def test_facility_replacement_switches_and_cleans_old(self):
        self.client.post("/api/admin/settings/facilities/upload/", {"image": _upload("PNG"), "name": "Lib"})
        old_path = FacilityImage.objects.get(name="Lib").image.path
        obj = FacilityImage.objects.get(name="Lib")

        self.client.patch(f"/api/admin/settings/facilities/{obj.id}/",
                          {"image": _upload("JPEG")}, format="multipart")

        updated = FacilityImage.objects.get(name="Lib")
        self.assertNotEqual(updated.image.path, old_path)
        self.assertFalse(os.path.exists(old_path))

    def test_facility_replacement_preserves_old_on_failure(self):
        self.client.post("/api/admin/settings/facilities/upload/", {"image": _upload("PNG"), "name": "Lib"})
        original = FacilityImage.objects.get(name="Lib")
        original_path = original.image.path

        self.client.patch(f"/api/admin/settings/facilities/{original.id}/",
                          {"image": _oversized_upload()}, format="multipart")

        obj = FacilityImage.objects.get(name="Lib")
        self.assertEqual(obj.image.path, original_path)
        self.assertTrue(os.path.exists(original_path))


@override_settings(MEDIA_ROOT=MEDIA_TEMP, STORAGES=_FILESYSTEM_STORAGE)
class MediaPipelineDeactivateTests(TestCase):
    """Soft-deactivate preserves file; hard-delete removes file."""

    @classmethod
    def setUpTestData(cls):
        cls.admin = _admin_user()

    def setUp(self):
        self.client = _auth_client(self.admin)

    def test_deactivated_slot_omitted_from_public_and_file_preserved(self):
        self.client.post("/api/admin/settings/slots/home_hero/", {"image": _upload()})
        obj = WebsiteImage.objects.get(slot="home_hero")
        file_path = obj.image.path

        self.assertEqual(self.client.delete("/api/admin/settings/slots/home_hero/").status_code,
                         status.HTTP_204_NO_CONTENT)
        obj.refresh_from_db()
        self.assertFalse(obj.is_active)
        self.assertTrue(os.path.exists(file_path))
        self.assertNotIn("home_hero", self.client.get("/api/public/website/slots/").data)

    def test_reactivate_deactivated_slot(self):
        self.client.post("/api/admin/settings/slots/home_hero/", {"image": _upload()})
        self.client.delete("/api/admin/settings/slots/home_hero/")
        obj = WebsiteImage.objects.get(slot="home_hero")
        file_path = obj.image.path

        self.client.patch("/api/admin/settings/slots/home_hero/detail/",
                          {"is_active": True}, format="json")
        obj.refresh_from_db()
        self.assertTrue(obj.is_active)
        self.assertTrue(os.path.exists(file_path))

    def test_facility_delete_removes_record_and_file(self):
        self.client.post("/api/admin/settings/facilities/upload/", {"image": _upload(), "name": "Lab"})
        obj = FacilityImage.objects.get(name="Lab")
        file_path = obj.image.path

        self.client.delete(f"/api/admin/settings/facilities/{obj.id}/")
        self.assertFalse(FacilityImage.objects.filter(name="Lab").exists())
        self.assertFalse(os.path.exists(file_path))