from django.urls import path
from .views import (
    test_api, login_api, register_api, logout_api, me, session_api, csrf_token,
    send_otp_api, verify_otp_api,
    token_obtain_pair, TokenRefreshView,
    password_reset_request, password_reset_confirm,
    change_password,
)

urlpatterns = [
    path("api/csrf/", csrf_token, name="csrf_token"),
    path("api/login/", login_api, name="login_api"),
    path("api/register/", register_api, name="register_api"),
    path("api/send-otp/", send_otp_api, name="send_otp_api"),
    path("api/verify-otp/", verify_otp_api, name="verify_otp_api"),
    path("api/logout/", logout_api, name="logout_api"),
    path("api/me/", me, name="me"),
    path("api/session/", session_api, name="session_api"),
    path("api/token/", token_obtain_pair, name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/password-reset/", password_reset_request, name="password_reset_request"),
    path("api/password-reset/confirm/", password_reset_confirm, name="password_reset_confirm"),
    path("api/change-password/", change_password, name="change_password"),
    path("api/test/", test_api),
]
