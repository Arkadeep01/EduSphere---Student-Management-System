from student.models import StudentProfile, StudentSubject


class StudentAdminSelector:
    @staticmethod
    def get_students_by_class(class_name):
        return StudentProfile.objects.filter(
            class_assigned__startswith=class_name
        ).select_related("user")

    @staticmethod
    def get_pending_subject_requests():
        return StudentSubject.objects.filter(status="pending").select_related(
            "student__user", "subject"
        )
