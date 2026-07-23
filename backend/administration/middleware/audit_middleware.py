from django.utils import timezone
from administration.models import AuditLog


class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        path = request.path_info

        if path.startswith("/api/admin/") and request.method in ("POST", "PATCH", "PUT", "DELETE"):
            self._log(request, self._action_from_method(request.method), path)

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

    def _get_ip(self, request):
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            return xff.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
