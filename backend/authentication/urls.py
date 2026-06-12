from django.urls import path
from .views import test_api, login_api, register_api, logout_api, me, session_api, csrf_token

urlpatterns = [
    path("api/csrf/", csrf_token, name="csrf_token"),
    path("api/login/", login_api, name="login_api"),
    path("api/register/", register_api, name="register_api"),
    path("api/logout/", logout_api, name="logout_api"),
    path("api/me/", me, name="me"),
    path("api/session/", session_api, name="session_api"),
    path("api/test/", test_api),
]
