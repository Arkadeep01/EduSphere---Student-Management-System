import json
import os
from django.utils import timezone
from datetime import timedelta
import secrets

from django.contrib.auth import authenticate, login, logout, get_backends
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser, OTP


from django.core.mail import send_mail

def get_user_data(user):
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
        "date_joined": user.date_joined.isoformat(),
    }

def test_api(request):
    return JsonResponse({
        "success": True, 
        "message": "Django Backend Connected Successfully"
    })


@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


@csrf_exempt
def login_api(request):
    # Expect a 'portal' field indicating which portal the user is logging into (student, teacher, admin)
    # Enforce role-based access: a user can only log in to their matching portal.
    # Returns 403 Forbidden on mismatch.
    """Login endpoint with portal role validation.

    Expected JSON payload:
        {
            "email": "user@example.com",
            "password": "secret",
            "portal": "student"  # one of 'student', 'teacher', 'admin'
        }
    """
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "message": "POST request required."},
            status=405,
        )
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        portal = data.get("portal", "").strip().lower()
        if not email or not password or not portal:
            return JsonResponse(
                {"success": False, "message": "Email, password, and portal are required."},
                status=400,
            )
        if portal not in ["student", "teacher", "admin"]:
            return JsonResponse(
                {"success": False, "message": "Invalid portal specified."},
                status=400,
            )
        user = authenticate(request, username=email, password=password)
        if user:
            if not user.is_active:
                return JsonResponse(
                    {"success": False, "message": "Account is disabled."},
                    status=403,
                )
            # Enforce role‑portal match
            if user.role != portal:
                return JsonResponse(
                    {"success": False, "message": "Invalid portal access for this user role."},
                    status=403,
                )
            login(request, user)
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                "success": True,
                "message": f"Welcome back, {user.email}!",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": get_user_data(user),
            })
        return JsonResponse(
            {"success": False, "message": "Invalid email or password."},
            status=401,
        )
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
@csrf_exempt
def send_otp_api(request):
    """Generate a 6‑digit OTP and email it to the user.
    Expected JSON payload: {"email": "user@example.com"}
    """
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST request required."}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()
        if not email:
            return JsonResponse({"success": False, "message": "Email is required."}, status=400)
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found."}, status=404)
        # Generate OTP
        otp_code = f"{secrets.randbelow(10**6):06}"
        expires_at = timezone.now() + timedelta(minutes=10)
        OTP.objects.create(user=user, email=email, otp_code=otp_code, expires_at=expires_at)
        # Send email (console backend in dev)
        subject = "EduSphere OTP Verification"
        message = f"Your verification code is {otp_code}. It is valid for 10 minutes."
        from_email = os.getenv('DEFAULT_FROM_EMAIL', 'no-reply@example.com')
        send_mail(subject, message, from_email, [email])
        return JsonResponse({"success": True, "message": "OTP sent."})
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)

@csrf_exempt
def verify_otp_api(request):
    """Verify the OTP; activate the user if valid.
    Expected JSON payload: {"email": "user@example.com", "otp_code": "123456"}
    """
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST request required."}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()
        otp_code = data.get("otp_code", "").strip()
        if not email or not otp_code:
            return JsonResponse({"success": False, "message": "Email and otp_code are required."}, status=400)
        try:
            otp_obj = OTP.objects.filter(email=email, is_verified=False, expires_at__gt=timezone.now()).latest('created_at')
        except OTP.DoesNotExist:
            return JsonResponse({"success": False, "message": "Invalid or expired OTP."}, status=400)
        if otp_obj.otp_code != otp_code:
            return JsonResponse({"success": False, "message": "Incorrect OTP."}, status=400)
        # Mark OTP as verified and activate user
        otp_obj.is_verified = True
        otp_obj.save()
        user = otp_obj.user
        user.is_active = True
        user.save()
        return JsonResponse({"success": True, "message": "OTP verified. Account activated."})
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
@csrf_exempt
def register_api(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST request required."}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        password2 = data.get("password2", "")
        username = data.get("username", "").strip()
        mobile = data.get("mobile", "").strip()
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        role = data.get("role", "student")
        # Basic validations
        if not email or not password or not username or not mobile:
            return JsonResponse({"success": False, "message": "Email, password, username and mobile are required."}, status=400)
        if password != password2:
            return JsonResponse({"success": False, "message": "Passwords do not match."}, status=400)
        if CustomUser.objects.filter(email=email).exists():
            return JsonResponse({"success": False, "message": "A user with this email already exists."}, status=409)
        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({"success": False, "message": "A user with this username already exists."}, status=409)
        try:
            validate_password(password)
        except ValidationError as e:
            return JsonResponse({"success": False, "message": " ".join(e.messages)}, status=400)
        if role not in ["student", "teacher"]:
            return JsonResponse({"success": False, "message": "Role must be 'student' or 'teacher'."}, status=400)
        # Determine role-based flags
        is_staff = True if role == "teacher" else False
        is_superuser = False
        # Create inactive user
        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            username=username,
            mobile=mobile,
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_staff=is_staff,
            is_superuser=is_superuser,
            is_active=False,
        )
        # Do NOT auto-login; user must verify OTP first
        return JsonResponse({
            "success": True,
            "message": "Account created. Verify OTP to activate.",
            "user": get_user_data(user),
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
def logout_api(request):
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "message": "POST request required."},
            status=405,
        )
    logout(request)
    return JsonResponse({
        "success": True,
        "message": "Logged out successfully.",
    })


def me(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "user": get_user_data(request.user),
        })
    return JsonResponse({
        "authenticated": False,
    })


def session_api(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "user": get_user_data(request.user),
        })
    return JsonResponse({
        "authenticated": False,
    })


# ─── JWT & Password Management Views (DRF) ─────────────────────────────

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from .serializers import (
    CustomTokenObtainPairSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def token_obtain_pair(request):
    """Issue JWT tokens with portal validation.
    Expects: { email, password, portal }
    """
    serializer = CustomTokenObtainPairSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.validated_data, status=status.HTTP_200_OK)


class TokenRefreshView(BaseTokenRefreshView):
    """Refresh JWT access token. Expects { refresh }"""
    pass


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Send OTP for password reset.
    Expects: { email }
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"]
    user = CustomUser.objects.get(email=email)

    # Generate OTP
    otp_code = f"{secrets.randbelow(10**6):06}"
    expires_at = timezone.now() + timedelta(minutes=10)
    OTP.objects.create(user=user, email=email, otp_code=otp_code, expires_at=expires_at)

    # Send email
    subject = "EduSphere Password Reset OTP"
    message = f"Your password reset code is {otp_code}. It is valid for 10 minutes."
    from_email = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@example.com")
    send_mail(subject, message, from_email, [email])

    return Response({"success": True, "message": "Password reset OTP sent."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Verify OTP and set new password.
    Expects: { email, otp_code, new_password, new_password2 }
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"]
    otp_code = serializer.validated_data["otp_code"]
    new_password = serializer.validated_data["new_password"]

    try:
        otp_obj = OTP.objects.filter(
            email=email,
            otp_code=otp_code,
            is_verified=False,
            expires_at__gt=timezone.now(),
        ).latest("created_at")
    except OTP.DoesNotExist:
        return Response(
            {"error": "Invalid or expired OTP."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # Mark OTP as verified
    otp_obj.is_verified = True
    otp_obj.save()

    # Set new password
    user.set_password(new_password)
    user.save()

    return Response({"success": True, "message": "Password reset successful."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change password for authenticated user.
    Expects: { old_password, new_password, new_password2 }
    """
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    if not user.check_password(serializer.validated_data["old_password"]):
        return Response(
            {"old_password": "Current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(serializer.validated_data["new_password"])
    user.save()

    return Response({"success": True, "message": "Password changed successfully."}, status=status.HTTP_200_OK)
