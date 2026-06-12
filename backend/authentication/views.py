import json
from django.contrib.auth import authenticate, login, logout, get_backends
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser


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
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "message": "POST request required."},
            status=405,
        )

    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return JsonResponse(
                {"success": False, "message": "Email and password are required."},
                status=400,
            )

        user = authenticate(request, username=email, password=password)
        if user:
            if not user.is_active:
                return JsonResponse(
                    {"success": False, "message": "Account is disabled."},
                    status=403,
                )
            login(request, user)
            return JsonResponse({
                "success": True,
                "message": f"Welcome back, {user.email}!",
                "user": get_user_data(user),
            })

        return JsonResponse(
            {"success": False, "message": "Invalid email or password."},
            status=401,
        )
    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "message": "Invalid JSON."},
            status=400,
        )
    except Exception as e:
        return JsonResponse(
            {"success": False, "message": str(e)},
            status=500,
        )


@csrf_exempt
def register_api(request):
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "message": "POST request required."},
            status=405,
        )

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

        if not email or not password or not username or not mobile:
            return JsonResponse(
                {"success": False, "message": "Email, password, username and mobile are required."},
                status=400,
            )

        if password != password2:
            return JsonResponse(
                {"success": False, "message": "Passwords do not match."},
                status=400,
            )

        if CustomUser.objects.filter(email=email).exists():
            return JsonResponse(
                {"success": False, "message": "A user with this email already exists."},
                status=409,
            )

        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse(
                {"success": False, "message": "A user with this username already exists."},
                status=409,
            )

        try:
            validate_password(password)
        except ValidationError as e:
            return JsonResponse(
                {"success": False, "message": " ".join(e.messages)},
                status=400,
            )

        if role not in ["student", "teacher"]:
            return JsonResponse(
                {"success": False, "message": "Role must be 'student' or 'teacher'."},
                status=400,
            )

        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            username=username,
            mobile=mobile,
            first_name=first_name,
            last_name=last_name,
            role=role,
        )

        user.backend = 'django.contrib.auth.backends.ModelBackend'  # type: ignore[attr-defined]
        login(request, user)
        return JsonResponse({
            "success": True,
            "message": "Account created successfully!",
            "user": get_user_data(user),
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "message": "Invalid JSON."},
            status=400,
        )
    except Exception as e:
        return JsonResponse(
            {"success": False, "message": str(e)},
            status=500,
        )


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
