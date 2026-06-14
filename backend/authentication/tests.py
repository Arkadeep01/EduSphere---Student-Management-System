from django.test import TestCase, Client
from django.urls import reverse
import json
from .models import OTP, CustomUser

class AuthenticationAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.register_url = reverse('register_api')
        self.login_url = reverse('login_api')
        self.me_url = reverse('me')
        self.logout_url = reverse('logout_api')
        self.csrf_url = reverse('csrf_token')
        self.send_otp_url = reverse('send_otp_api')
        self.verify_otp_url = reverse('verify_otp_api')
        # Register a user (inactive) and activate via OTP
        self.user_data = {
            "email": "teststudent@example.com",
            "username": "teststudent",
            "mobile": "1234567890",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
            "first_name": "Test",
            "last_name": "Student",
            "role": "student",
        }
        # Register
        self.client.post(self.register_url, data=json.dumps(self.user_data), content_type="application/json")
        # Send OTP
        self.client.post(self.send_otp_url, data=json.dumps({"email": self.user_data["email"]}), content_type="application/json")
        # Retrieve OTP from DB
        otp_obj = OTP.objects.get(email=self.user_data["email"], is_verified=False)
        # Verify OTP
        self.client.post(self.verify_otp_url, data=json.dumps({"email": self.user_data["email"], "otp_code": otp_obj.otp_code}), content_type="application/json")

    def test_register_success(self):
        data = {
            "email": "newteacher@example.com",
            "username": "newteacher",
            "mobile": "0987654321",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
            "first_name": "New",
            "last_name": "Teacher",
            "role": "teacher",
        }
        response = self.client.post(self.register_url, data=json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertTrue(payload.get("success"))
        self.assertEqual(payload["user"]["email"], data["email"])
        self.assertEqual(payload["user"]["role"], "teacher")
        # User should be inactive initially
        self.assertFalse(payload["user"]["is_active"])

    def test_register_invalid_role(self):
        data = {
            "email": "badrole@example.com",
            "username": "badrole",
            "mobile": "5555555555",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
            "first_name": "Bad",
            "last_name": "Role",
            "role": "manager",
        }
        response = self.client.post(self.register_url, data=json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Role must be", response.json().get("message", ""))

    def test_login_and_me(self):
        login_payload = {"email": self.user_data["email"], "password": self.user_data["password"], "portal": "student"}
        login_resp = self.client.post(self.login_url, data=json.dumps(login_payload), content_type="application/json")
        self.assertEqual(login_resp.status_code, 200)
        login_data = login_resp.json()
        self.assertTrue(login_data.get("success"))
        # Verify /api/me/ returns authenticated user
        me_resp = self.client.get(self.me_url)
        self.assertEqual(me_resp.status_code, 200)
        me_data = me_resp.json()
        self.assertTrue(me_data.get("authenticated"))
        self.assertEqual(me_data["user"]["email"], self.user_data["email"])

    def test_logout(self):
        # Login first
        login_payload = {"email": self.user_data["email"], "password": self.user_data["password"], "portal": "student"}
        self.client.post(self.login_url, data=json.dumps(login_payload), content_type="application/json")
        # Get CSRF token for logout
        csrf_resp = self.client.get(self.csrf_url)
        token = csrf_resp.json()["csrfToken"]
        # Logout
        logout_resp = self.client.post(self.logout_url, HTTP_X_CSRFTOKEN=token)
        self.assertEqual(logout_resp.status_code, 200)
        # Verify not authenticated after logout
        me_resp = self.client.get(self.me_url)
        self.assertEqual(me_resp.status_code, 200)
        self.assertFalse(me_resp.json().get("authenticated"))

