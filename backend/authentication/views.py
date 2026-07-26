import json
import os
import secrets
from datetime import timedelta

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from .models import CustomUser, OTP
from .serializers import (
    CustomTokenObtainPairSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
    ForcePasswordChangeSerializer,
    OAuthProfileCompleteSerializer,
    StudentSignupSerializer,
    TeacherSignupSerializer,
    StaffSignupSerializer,
)
from .utils import (
    set_jwt_cookies,
    clear_jwt_cookies,
    get_user_data,
    link_social_account,
    otp_throttle,
)
from notification.services.email_service import EmailService


# ─── Health / CSRF ──────────────────────────────────────────────────────

def test_api(request):
    return JsonResponse({
        "success": True,
        "message": "Django Backend Connected Successfully"
    })


@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


# ─── Email Login ─────────────────────────────────────────────────────────

@csrf_exempt
def login_api(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST request required."}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        selected_role = data.get("selected_role", "").strip().lower()

        if not email or not password or not selected_role:
            return JsonResponse({"success": False, "message": "Email, password, and selected_role are required."}, status=400)

        if selected_role not in ("student", "teacher", "staff", "admin"):
            return JsonResponse({"success": False, "message": "Invalid role specified."}, status=400)

        user = authenticate(request, username=email, password=password)
        if not user:
            return JsonResponse({"success": False, "message": "No account is registered with these details. Please contact your institution."}, status=401)
        if not user.is_active:
            return JsonResponse({"success": False, "message": "Account is disabled."}, status=403)

        if user.role != selected_role:
            role_label = dict(CustomUser.ROLE_CHOICES).get(user.role, user.role)
            if user.role == "student":
                hint = "Please use the Student login."
            elif user.role in ("teacher", "staff", "admin"):
                hint = f"Please use the Faculty login as {role_label}."
            else:
                hint = ""
            return JsonResponse({
                "success": False,
                "message": f"This email is registered as a {role_label} account. {hint}"
            }, status=403)

        if not user.password_changed:
            return JsonResponse({
                "success": False,
                "needs_activation": True,
                "message": "You must change your temporary password before accessing the portal.",
            }, status=403)

        login(request, user)
        refresh = RefreshToken.for_user(user)
        resp = JsonResponse({
            "success": True,
            "message": f"Welcome back, {user.email}!",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": get_user_data(user),
        })
        set_jwt_cookies(resp, user)
        return resp
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


# ─── OTP ─────────────────────────────────────────────────────────────────

@csrf_exempt
def send_otp_api(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST request required."}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()
        if not email:
            return JsonResponse({"success": False, "message": "Email is required."}, status=400)

        allowed, remaining = otp_throttle.is_allowed(email)
        if not allowed:
            return JsonResponse({
                "success": False,
                "message": f"Too many OTP requests. Please try again later. ({remaining} remaining)",
            }, status=429)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found."}, status=404)

        otp_code = f"{secrets.randbelow(10**6):06}"
        expires_at = timezone.now() + timedelta(minutes=10)
        OTP.objects.create(user=user, email=email, otp_code=otp_code, expires_at=expires_at)

        context = {
            "user_name": f"{user.first_name} {user.last_name}".strip() or user.email,
            "user_email": user.email,
            "otp_code": otp_code,
            "expiry_minutes": "10",
            "title": "EduSphere OTP Verification",
            "message": f"Your verification code is: <strong>{otp_code}</strong><br/>This code is valid for 10 minutes.",
        }
        EmailService.send_templated_email(
            to_email=email,
            template_name="otp_verification",
            context=context,
        )
        warn = ""
        if remaining <= 1:
            warn = "Warning: This is your last OTP request for the next 2 hours."
        return JsonResponse({"success": True, "message": "OTP sent.", "remaining": remaining, "warning": warn})
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
def verify_otp_api(request):
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

        otp_obj.is_verified = True
        otp_obj.save()
        user = otp_obj.user
        user.is_active = True
        user.save()

        if user.role == "student":
            from student.models import StudentProfile
            StudentProfile.objects.get_or_create(user=user)
        elif user.role == "teacher":
            from teacher.models import TeacherProfile
            TeacherProfile.objects.get_or_create(user=user)

        return JsonResponse({"success": True, "message": "OTP verified. Account activated."})
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


# ─── Email / Password Registration ───────────────────────────────────────

PUBLIC_SIGNUP_DISABLED = {"success": False, "message": "Public signup is disabled. Accounts can only be created by authorized personnel."}

@csrf_exempt
def register_api(request):
    return JsonResponse(PUBLIC_SIGNUP_DISABLED, status=403)


# ─── Enhanced Student Signup ─────────────────────────────────────────────

@csrf_exempt
def student_signup_api(request):
    return JsonResponse(PUBLIC_SIGNUP_DISABLED, status=403)


# ─── Enhanced Teacher Signup ─────────────────────────────────────────────

@csrf_exempt
def teacher_signup_api(request):
    return JsonResponse(PUBLIC_SIGNUP_DISABLED, status=403)


# ─── Staff Signup ────────────────────────────────────────────────────────

@csrf_exempt
def staff_signup_api(request):
    return JsonResponse(PUBLIC_SIGNUP_DISABLED, status=403)


# ─── OAuth Init (Role Propagation) ──────────────────────────────────────

@csrf_exempt
def oauth_init_view(request, provider):
    """Store the selected role in session and redirect to allauth's provider login."""
    if request.method not in ("GET", "POST"):
        return JsonResponse({"success": False, "message": "GET or POST required."}, status=405)

    role = request.GET.get("role") or (json.loads(request.body).get("role") if request.method == "POST" and request.body else None)
    if not role or role not in ("student", "teacher"):
        return JsonResponse({"success": False, "message": "Role must be 'student' or 'teacher'."}, status=400)

    if provider not in ("google", "github"):
        return JsonResponse({"success": False, "message": "Provider must be 'google' or 'github'."}, status=400)

    request.session["oauth_role"] = role
    request.session.modified = True

    from django.shortcuts import redirect
    return redirect(f"/authentication/{provider}/login/")


# ─── OAuth Callback ──────────────────────────────────────────────────────

@csrf_exempt
def oauth_callback_api(request):
    """Exchange Django session (created by allauth) for JWT tokens."""
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST request required."}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "message": "Not authenticated."}, status=401)

    user = request.user
    refresh = RefreshToken.for_user(user)

    resp_data = {
        "success": True,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": get_user_data(user),
    }
    resp = JsonResponse(resp_data)
    set_jwt_cookies(resp, user)
    return resp


# ─── OAuth Profile Completion ───────────────────────────────────────────

@csrf_exempt
def oauth_profile_complete_api(request):
    """Complete profile for OAuth first-time users."""
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST request required."}, status=405)

    token_str = request.GET.get("token") or request.POST.get("token")
    if token_str:
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            from rest_framework_simplejwt.exceptions import TokenError
            decoded = AccessToken(token_str)
            user = CustomUser.objects.get(id=decoded.get("user_id"))
        except (TokenError, CustomUser.DoesNotExist, KeyError):
            return JsonResponse({"success": False, "message": "Invalid or expired token."}, status=401)
    elif request.user.is_authenticated:
        user = request.user
    else:
        return JsonResponse({"success": False, "message": "Authentication required."}, status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON."}, status=400)

    ser = OAuthProfileCompleteSerializer(data=data)
    if not ser.is_valid():
        return JsonResponse({"success": False, "message": "Validation failed.", "errors": ser.errors}, status=400)
    v = ser.validated_data

    if v.get("mobile"):
        user.mobile = v["mobile"]
        user.save()

    if user.role == "student":
        from student.models import StudentProfile
        profile, _ = StudentProfile.objects.get_or_create(user=user)
        if v.get("gender"):
            profile.gender = v["gender"]
        if v.get("date_of_birth"):
            profile.date_of_birth = v["date_of_birth"]
        if v.get("address"):
            profile.address = v["address"]
        profile.save()
        from student.services import assign_core_subjects
        assign_core_subjects(profile)

    elif user.role == "teacher":
        from teacher.models import TeacherProfile
        from student.models import Subject
        profile, _ = TeacherProfile.objects.get_or_create(user=user)
        if v.get("qualification"):
            profile.qualification = v["qualification"]
        if v.get("experience") is not None:
            profile.experience = v["experience"]
        if v.get("primary_subject"):
            try:
                subj = Subject.objects.get(id=v["primary_subject"])
                profile.assigned_subject = subj
                from administration.models.teacher import TeacherSubjectAllocation
                TeacherSubjectAllocation.objects.get_or_create(
                    teacher=profile,
                    subject=subj,
                    defaults={"is_primary": True},
                )
            except Subject.DoesNotExist:
                pass
        profile.save()

        for subj_id in v.get("secondary_subjects", []):
            try:
                subj = Subject.objects.get(id=subj_id)
                from administration.models.teacher import TeacherSubjectAllocation
                TeacherSubjectAllocation.objects.get_or_create(
                    teacher=profile,
                    subject=subj,
                    defaults={"is_primary": False},
                )
            except Subject.DoesNotExist:
                pass

    elif user.role == "staff":
        from administration.models.staff import StaffProfile
        sp, _ = StaffProfile.objects.get_or_create(user=user)
        if v.get("department"):
            sp.department = v["department"]
        if v.get("employee_type"):
            pass
        sp.save()

    if not user.is_active:
        user.is_active = True
        user.save()

    refresh = RefreshToken.for_user(user)
    resp = JsonResponse({
        "success": True,
        "message": "Profile completed.",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": get_user_data(user),
    })
    set_jwt_cookies(resp, user)
    return resp


# ─── Logout ──────────────────────────────────────────────────────────────

@csrf_exempt
def logout_api(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST request required."}, status=405)

    refresh_token_str = None
    if "refresh_token" in request.COOKIES:
        refresh_token_str = request.COOKIES["refresh_token"]
    elif request.content_type == "application/json":
        try:
            body = json.loads(request.body)
            refresh_token_str = body.get("refresh")
        except (json.JSONDecodeError, AttributeError):
            pass

    if refresh_token_str:
        try:
            token = RefreshToken(refresh_token_str)
            token.blacklist()
        except Exception:
            pass

    logout(request)

    resp = JsonResponse({"success": True, "message": "Logged out successfully."})
    clear_jwt_cookies(resp)
    return resp


# ─── Session / Me ────────────────────────────────────────────────────────

def me(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "user": get_user_data(request.user),
        })
    return JsonResponse({"authenticated": False})


def session_api(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "user": get_user_data(request.user),
        })
    return JsonResponse({"authenticated": False})


# ─── JWT & Password Management (DRF) ────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def token_obtain_pair(request):
    serializer = CustomTokenObtainPairSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    resp = Response(data, status=status.HTTP_200_OK)
    user = authenticate(
        username=data.get("user", {}).get("email"),
        password=request.data.get("password", ""),
    )
    if user:
        set_jwt_cookies(resp, user)
    return resp


class TokenRefreshView(BaseTokenRefreshView):
    pass


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"]

    allowed, remaining = otp_throttle.is_allowed(email)
    if not allowed:
        return Response(
            {"error": f"Too many requests. Please try again later. ({remaining} remaining)"},
            status=429,
        )

    user = CustomUser.objects.get(email=email)
    otp_code = f"{secrets.randbelow(10**6):06}"
    expires_at = timezone.now() + timedelta(minutes=10)
    OTP.objects.create(user=user, email=email, otp_code=otp_code, expires_at=expires_at)

    context = {
        "user_name": f"{user.first_name} {user.last_name}".strip() or user.email,
        "user_email": user.email,
        "otp_code": otp_code,
        "expiry_minutes": "10",
        "title": "EduSphere Password Reset OTP",
        "message": f"Your password reset code is: <strong>{otp_code}</strong><br/>This code is valid for 10 minutes.",
    }
    EmailService.send_templated_email(
        to_email=email,
        template_name="password_reset",
        context=context,
    )
    warn = ""
    if remaining <= 1:
        warn = "Warning: This is your last OTP request for the next 2 hours."
    return Response({"success": True, "message": "Password reset OTP sent.", "remaining": remaining, "warning": warn})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
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
        return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    otp_obj.is_verified = True
    otp_obj.save()
    user.set_password(new_password)
    user.save()

    return Response({"success": True, "message": "Password reset successful."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    if not user.check_password(serializer.validated_data["old_password"]):
        return Response({"old_password": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data["new_password"])
    user.save()

    return Response({"success": True, "message": "Password changed successfully."})


# ─── Force Password Change (First Login) ─────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def force_password_change(request):
    user = request.user
    if user.password_changed:
        return Response({"error": "Password has already been changed."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ForcePasswordChangeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data["new_password"])
    user.password_changed = True
    user.needs_activation = False
    user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        "success": True,
        "message": "Password changed and account activated.",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": get_user_data(user),
    })


# ─── Resend Credentials ──────────────────────────────────────────────────

@csrf_exempt
def resend_credentials_api(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST request required."}, status=405)
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")
        if not user_id:
            return JsonResponse({"success": False, "message": "user_id is required."}, status=400)
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found."}, status=404)

        context = {
            "user_name": f"{user.first_name} {user.last_name}".strip() or user.email,
            "user_email": user.email,
            "user_role": user.get_role_display(),
            "title": "Your EduSphere Account Credentials",
            "message": (
                f"Your account has been created. Your login email is: <strong>{user.email}</strong><br/>"
                f"Your temporary password is your date of birth in DDMMYYYY format.<br/>"
                f"Please log in and change your password immediately."
            ),
        }
        EmailService.send_templated_email(
            to_email=user.email,
            template_name="welcome",
            context=context,
        )
        return JsonResponse({"success": True, "message": "Credentials email sent."})
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
