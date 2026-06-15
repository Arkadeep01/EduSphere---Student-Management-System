from django.db import transaction

from student.models import StudentProfile, Subject
from teacher.models import TeacherClassAssignment
from administration.models.teacher import ClassTeacherAssignment, TeacherSubjectAllocation


class ClassAdminService:
    @staticmethod
    def list_classes():
        classes_map = {}
        students = StudentProfile.objects.exclude(class_assigned="").values_list(
            "class_assigned", flat=True
        )
        for s in students:
            if s:
                base = s.split("-")[0] if "-" in s else s
                if base not in classes_map:
                    classes_map[base] = {"name": base, "total": 0}
                classes_map[base]["total"] += 1

        for base in classes_map:
            assignments = ClassTeacherAssignment.objects.filter(class_name=base).select_related(
                "teacher__user"
            )
            classes_map[base]["classTeacher"] = (
                assignments.first().teacher.user.get_full_name() if assignments else "Not Assigned"
            )

        return list(classes_map.values())

    @staticmethod
    def get_class_detail(class_name):
        students = StudentProfile.objects.filter(class_assigned__startswith=class_name).select_related("user")

        sections = set()
        for s in students:
            parts = s.class_assigned.split("-")
            if len(parts) > 1 and parts[1]:
                sections.add(parts[1])

        subjects = []
        subject_allocations = TeacherSubjectAllocation.objects.filter(
            assigned_classes__contains=class_name
        ).select_related("subject", "teacher__user")
        for sa in subject_allocations:
            subjects.append({
                "code": sa.subject.code,
                "name": sa.subject.name,
                "teacher": sa.teacher.user.get_full_name() if sa.teacher else None,
            })

        class_teacher_qs = ClassTeacherAssignment.objects.filter(class_name=class_name).select_related(
            "teacher__user"
        )
        class_teacher_name = (
            class_teacher_qs.first().teacher.user.get_full_name() if class_teacher_qs else None
        )

        return {
            "name": class_name,
            "totalStudents": students.count(),
            "sections": sorted(sections),
            "subjects": subjects,
            "classTeacher": class_teacher_name,
        }

    @staticmethod
    def create_class(name, sections, capacity, academic_year):
        return {"name": name, "sections": sections, "capacity": capacity, "academic_year": academic_year}
