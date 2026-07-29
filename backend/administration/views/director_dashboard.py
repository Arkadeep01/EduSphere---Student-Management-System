from django.contrib.auth import get_user_model
from django.db.models import Count

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from administration.permissions import IsDirector

User = get_user_model()


class DirectorDashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request):
        role_counts = User.objects.values("role").annotate(count=Count("id"))
        counts = {r["role"]: r["count"] for r in role_counts}

        data = {
            "admins": counts.get("admin", 0),
            "staff": counts.get("staff", 0),
            "teachers": counts.get("teacher", 0),
            "students": counts.get("student", 0),
            "directors": counts.get("director", 0),
        }
        return Response(data)
