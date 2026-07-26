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
        subject = get_object_or_404(Subject, id=subject_id)
        # Check for active references
        from student.models import StudentSubject
        from administration.models.teacher import TeacherSubjectAllocation
        from student.models import Result, Assignment
        from teacher.models import AnswerScript, Chapter
        from administration.models.exam import Exam, AnswerScriptUpload, PublishedResult
        from administration.models.academic import ClassSubjectConfig

        active_enrollments = StudentSubject.objects.filter(subject=subject, status__in=["approved", "pending"]).count()
        teacher_allocations = TeacherSubjectAllocation.objects.filter(subject=subject, is_active=True).count()
        has_results = Result.objects.filter(subject=subject).exists()
        has_assignments = Assignment.objects.filter(subject=subject).exists()
        has_exams = Exam.objects.filter(subject=subject).exists()
        has_answer_scripts = AnswerScript.objects.filter(subject=subject).exists() or AnswerScriptUpload.objects.filter(subject=subject).exists()

        if active_enrollments > 0 or teacher_allocations > 0 or has_results:
            return Response(
                {"error": f"Cannot delete subject. Active references: {active_enrollments} enrollments, {teacher_allocations} teacher allocations, results={has_results}."},
                status=status.HTTP_409_CONFLICT,
            )

        # Soft-deactivate instead
        subject.is_active = False
        subject.save(update_fields=["is_active"])
        return Response({"status": "deactivated", "message": "Subject deactivated (soft delete)."}, status=status.HTTP_200_OK)
