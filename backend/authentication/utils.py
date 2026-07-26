from datetime import timedelta
from django.conf import settings
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser


def set_jwt_cookies(response: HttpResponse, user: CustomUser) -> tuple[str, str]:
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=int(timedelta(hours=1).total_seconds()),
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=int(timedelta(days=7).total_seconds()),
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/",
    )
    return access_token, refresh_token


def clear_jwt_cookies(response: HttpResponse) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


def get_user_data(user: CustomUser) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "mobile": user.mobile,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_active": user.is_active,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "password_changed": user.password_changed,
        "needs_activation": user.needs_activation,
        "date_joined": user.date_joined.isoformat(),
    }


def link_social_account(user: CustomUser, provider: str, uid: str) -> None:
    from allauth.socialaccount.models import SocialAccount
    SocialAccount.objects.get_or_create(
        user=user,
        provider=provider,
        defaults={"uid": uid},
    )


class OTPRateThrottle:
    def __init__(self):
        self._cache = {}

    def is_allowed(self, email: str, max_requests: int = 3, window_hours: int = 2) -> tuple[bool, int]:
        import time
        now = time.time()
        window = window_hours * 3600
        key = f"otp:{email}"
        entry = self._cache.get(key, [])
        entry = [t for t in entry if now - t < window]
        if len(entry) >= max_requests:
            remaining = max_requests - len(entry)
            return False, max(0, remaining)
        entry.append(now)
        self._cache[key] = entry
        remaining = max_requests - len(entry)
        return True, max(0, remaining)

    def get_remaining(self, email: str, max_requests: int = 3, window_hours: int = 2) -> int:
        import time
        now = time.time()
        window = window_hours * 3600
        key = f"otp:{email}"
        entry = self._cache.get(key, [])
        entry = [t for t in entry if now - t < window]
        return max(0, max_requests - len(entry))


otp_throttle = OTPRateThrottle()
