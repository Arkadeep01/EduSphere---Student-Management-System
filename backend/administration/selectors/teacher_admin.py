from teacher.models import TeacherProfile


class TeacherAdminSelector:
    @staticmethod
    def get_teachers_by_subject(subject_id):
        return TeacherProfile.objects.filter(assigned_subject_id=subject_id).select_related("user")
