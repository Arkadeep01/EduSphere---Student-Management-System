from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from administration.permissions import IsAdmin
from administration.models import AcademicSession


class AcademicSessionListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        sessions = AcademicSession.objects.all().values("id", "name", "start_date", "end_date", "is_current")
        return Response(list(sessions))

    def post(self, request):
        data = request.data
        session = AcademicSession.objects.create(
            name=data.get("name"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            is_current=data.get("is_current", False),
        )
        if session.is_current:
            AcademicSession.objects.exclude(id=session.id).update(is_current=False)
        return Response(
            {"id": session.id, "name": session.name, "start_date": session.start_date,
             "end_date": session.end_date, "is_current": session.is_current},
            status=status.HTTP_201_CREATED,
        )


class AcademicSessionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, session_id):
        session = get_object_or_404(AcademicSession, id=session_id)
        return Response({
            "id": session.id, "name": session.name,
            "start_date": session.start_date, "end_date": session.end_date,
            "is_current": session.is_current,
        })

    def patch(self, request, session_id):
        session = get_object_or_404(AcademicSession, id=session_id)
        for field in ("name", "start_date", "end_date", "is_current"):
            if field in request.data:
                setattr(session, field, request.data[field])
        session.save()
        if session.is_current:
            AcademicSession.objects.exclude(id=session.id).update(is_current=False)
        return Response({
            "id": session.id, "name": session.name,
            "start_date": session.start_date, "end_date": session.end_date,
            "is_current": session.is_current,
        })

    def delete(self, request, session_id):
        session = get_object_or_404(AcademicSession, id=session_id)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
