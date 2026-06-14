from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    """Allows access only to users with role 'student'."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.role == "student"
        )


class IsTeacher(BasePermission):
    """Allows access only to users with role 'teacher'."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.role == "teacher"
        )


class IsAdmin(BasePermission):
    """Allows access only to users with role 'admin'."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.role == "admin"
        )
