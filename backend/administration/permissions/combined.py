from rest_framework.permissions import BasePermission


class IsAdminOrDirector(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and (request.user.role in ("admin", "director") or request.user.is_superuser)
        )
