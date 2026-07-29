from django.urls import path
from .views import (
    test_api, health_api, login_api, register_api, logout_api, me, session_api, csrf_token, version_api,
    token_obtain_pair, TokenRefreshView,
    change_password, force_password_change,
    oauth_callback_api, oauth_profile_complete_api, oauth_init_view,
    student_signup_api, teacher_signup_api, staff_signup_api,
    resend_credentials_api,
    github_status, github_connect_init, github_disconnect,
)

urlpatterns = [
    path("api/csrf/", csrf_token, name="csrf_token"),
    path("api/login/", login_api, name="login_api"),
    path("api/logout/", logout_api, name="logout_api"),
    path("api/me/", me, name="me"),
    path("api/session/", session_api, name="session_api"),
    path("api/token/", token_obtain_pair, name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/change-password/", change_password, name="change_password"),
    path("api/force-password-change/", force_password_change, name="force_password_change"),
    path("api/resend-credentials/", resend_credentials_api, name="resend_credentials"),
    path("api/register/", register_api, name="register_api"),
    path("api/test/", test_api, name="test_api"),
    path("api/version/", version_api, name="version_api"),
    path("api/health/", health_api, name="health_api"),
    # OAuth
    path("api/oauth/init/<str:provider>/", oauth_init_view, name="oauth_init"),
    path("api/oauth/callback/", oauth_callback_api, name="oauth_callback"),
    path("api/oauth/complete-profile/", oauth_profile_complete_api, name="oauth_profile_complete"),
    # GitHub Identity Binding
    path("api/github/status/", github_status, name="github_status"),
    path("api/github/connect/", github_connect_init, name="github_connect_init"),
    path("api/github/disconnect/", github_disconnect, name="github_disconnect"),
]
