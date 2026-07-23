from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from administration.permissions import IsAdmin
from student.models import Subject


class SubjectAdminListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        subjects = Subject.objects.all().values(
            "id", "name", "code", "tier", "teacher_name", "description", "color", "progress"
        )
        return Response(list(subjects))

    def post(self, request):
        data = request.data
        subject = Subject.objects.create(
            name=data["name"],
            code=data["code"],
            tier=data.get("tier", "core"),
            teacher_name=data.get("teacher_name", ""),
            description=data.get("description", ""),
            color=data.get("color", "from-blue-500 to-indigo-500"),
        )
        return Response(
            {"id": subject.id, "name": subject.name, "code": subject.code, "tier": subject.tier},
            status=status.HTTP_201_CREATED,
        )


class SubjectAdminDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, subject_id):
        subject = get_object_or_404(Subject, id=subject_id)
        return Response({
            "id": subject.id, "name": subject.name, "code": subject.code,
            "tier": subject.tier, "teacher_name": subject.teacher_name,
            "description": subject.description, "color": subject.color,
        })

    def patch(self, request, subject_id):
        subject = get_object_or_404(Subject, id=subject_id)
        for field in ("name", "code", "tier", "teacher_name", "description", "color"):
            if field in request.data:
                setattr(subject, field, request.data[field])
        subject.save()
        return Response({"id": subject.id, "name": subject.name})

    def delete(self, request, subject_id):
        get_object_or_404(Subject, id=subject_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
