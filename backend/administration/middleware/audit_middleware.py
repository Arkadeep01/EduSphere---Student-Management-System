import logging
from django.utils import timezone
from administration.models import AuditLog

logger = logging.getLogger(__name__)


class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        response = self.get_response(request)

        if path.startswith("/api/admin/") and request.method in ("POST", "PATCH", "PUT", "DELETE"):
            self._log(request, self._action_from_method(request.method), path)

        if path.startswith("/api/") and "/login/" in path and request.method == "POST":
            self._log_auth_event(request, response)

        if response.status_code == 429:
            self._log_sensitive_event(request, "rate_limit_exceeded", path)

        if response.status_code == 403 and path.startswith("/api/"):
            if request.user.is_authenticated:
                self._log_sensitive_event(request, "access_denied", path)

        return response

    def _action_from_method(self, method):
        return {"POST": "create", "PATCH": "update", "PUT": "update", "DELETE": "delete"}.get(method, "update")

    def _log(self, request, action, path):
        if not request.user.is_authenticated:
            return
        parts = path.strip("/").split("/")
        model_name = parts[-1] if len(parts) > 1 else path
        AuditLog.objects.create(
            user=request.user,
            action=action,
            model_name=model_name,
            ip_address=self._get_ip(request),
            description=f"{action} via {request.method} {path}",
        )

    def _log_auth_event(self, request, response):
        import json
        email = ""
        try:
            data = json.loads(request.body) if request.body else {}
            email = data.get("email", "")
        except (json.JSONDecodeError, AttributeError):
            pass
        status_code = getattr(response, "status_code", 500) if hasattr(response, "status_code") else 500
        if status_code in (401, 403):
            AuditLog.objects.create(
                user=None,
                action="login",
                model_name="Authentication",
                ip_address=self._get_ip(request),
                description=f"Failed login attempt for {email} from {self._get_ip(request)}",
            )
            logger.warning(f"Failed login attempt for {email} from {self._get_ip(request)}")

    def _log_sensitive_event(self, request, action, path):
        user = request.user if request.user.is_authenticated else None
        if action == "access_denied" and user and user.is_staff:
            logger.warning(
                f"Access denied: user={user.email} role={user.role} "
                f"path={path} ip={self._get_ip(request)}"
            )
        AuditLog.objects.create(
            user=user,
            action=action,
            model_name="Security",
            ip_address=self._get_ip(request),
            description=f"{action} on {path} from {self._get_ip(request)}",
        )

    def _get_ip(self, request):
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            return xff.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "")
