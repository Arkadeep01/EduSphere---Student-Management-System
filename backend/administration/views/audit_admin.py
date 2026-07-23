from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from administration.permissions import IsAdmin
from administration.models import AuditLog


class AuditLogListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        logs = AuditLog.objects.select_related("user").all()[:100]
        data = []
        for log in logs:
            data.append({
                "id": log.id,
                "user": log.user.email if log.user else None,
                "action": log.action,
                "model_name": log.model_name,
                "object_id": log.object_id,
                "description": log.description,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat(),
            })
        return Response(data)
