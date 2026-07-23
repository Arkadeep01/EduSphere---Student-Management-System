from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from administration.permissions import IsAdmin
from administration.models import Class, AcademicSession, ClassTeacherAssignment, TeacherSubjectAllocation
from teacher.models import TeacherClassAssignment
from student.models import StudentProfile


class ClassListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        classes = Class.objects.select_related("academic_session").all()
        data = []
        for c in classes:
            student_count = StudentProfile.objects.filter(class_assigned=c.name).count()
            ct = ClassTeacherAssignment.objects.filter(class_name=c.name).select_related("teacher__user").first()
            data.append({
                "id": c.id,
                "name": c.name,
                "section": c.section,
                "academic_session": c.academic_session.name if c.academic_session else None,
                "total_students": student_count,
                "class_teacher": ct.teacher.user.get_full_name() if ct else None,
            })
        return Response(data)

    def post(self, request):
        data = request.data
        session_id = data.get("academic_session_id")
        session = get_object_or_404(AcademicSession, id=session_id) if session_id else None
        cls = Class.objects.create(
            name=data["name"],
            section=data.get("section", ""),
            academic_session=session,
        )
        return Response(
            {"id": cls.id, "name": cls.name, "section": cls.section,
             "academic_session_id": session.id if session else None},
            status=status.HTTP_201_CREATED,
        )


class ClassDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, class_name):
        cls = get_object_or_404(Class, name=class_name)
        students = StudentProfile.objects.filter(class_assigned=class_name).select_related("user")
        subjects = []
        for sa in TeacherSubjectAllocation.objects.filter(assigned_classes__contains=class_name).select_related("subject", "teacher__user"):
            subjects.append({
                "code": sa.subject.code,
                "name": sa.subject.name,
                "teacher": sa.teacher.user.get_full_name() if sa.teacher else None,
            })
        ct = ClassTeacherAssignment.objects.filter(class_name=class_name).select_related("teacher__user").first()
        return Response({
            "id": cls.id,
            "name": cls.name,
            "section": cls.section,
            "academic_session": cls.academic_session.name if cls.academic_session else None,
            "total_students": students.count(),
            "subjects": subjects,
            "class_teacher": ct.teacher.user.get_full_name() if ct else None,
        })
