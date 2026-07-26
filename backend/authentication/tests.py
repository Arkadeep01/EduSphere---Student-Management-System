from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
import json
from .models import OTP

User = get_user_model()

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
        self.user_data = {
            "email": "teststudent@example.com",
            "username": "teststudent",
            "mobile": "1234567890",
            "password": "StrongPass123!",
            "first_name": "Test",
            "last_name": "Student",
        }
        self.user = User.objects.create_user(
            email=self.user_data["email"],
            username=self.user_data["username"],
            mobile=self.user_data["mobile"],
            password=self.user_data["password"],
            first_name=self.user_data["first_name"],
            last_name=self.user_data["last_name"],
            role="student",
            is_active=True,
            password_changed=True,
        )

    def test_register_blocked(self):
        response = self.client.post(
            self.register_url,
            data=json.dumps({"email": "new@example.com", "password": "Xyz12345!", "password2": "Xyz12345!", "role": "student"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_register_invalid_role_returns_403(self):
        response = self.client.post(
            self.register_url,
            data=json.dumps({"email": "bad@example.com", "password": "Xyz12345!", "password2": "Xyz12345!", "role": "manager"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_login_and_me(self):
        login_payload = {"email": self.user_data["email"], "password": self.user_data["password"], "selected_role": "student"}
        login_resp = self.client.post(self.login_url, data=json.dumps(login_payload), content_type="application/json")
        self.assertEqual(login_resp.status_code, 200)
        login_data = login_resp.json()
        self.assertTrue(login_data.get("success"))
        me_resp = self.client.get(self.me_url)
        self.assertEqual(me_resp.status_code, 200)
        me_data = me_resp.json()
        self.assertTrue(me_data.get("authenticated"))
        self.assertEqual(me_data["user"]["email"], self.user_data["email"])

    def test_logout(self):
        login_payload = {"email": self.user_data["email"], "password": self.user_data["password"], "selected_role": "student"}
        self.client.post(self.login_url, data=json.dumps(login_payload), content_type="application/json")
        csrf_resp = self.client.get(self.csrf_url)
        token = csrf_resp.json()["csrfToken"]
        logout_resp = self.client.post(self.logout_url, HTTP_X_CSRFTOKEN=token)
        self.assertEqual(logout_resp.status_code, 200)
        me_resp = self.client.get(self.me_url)
        self.assertEqual(me_resp.status_code, 200)
        self.assertFalse(me_resp.json().get("authenticated"))