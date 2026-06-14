from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.TeacherDashboard.as_view(), name="teacher-dashboard"),
    path("profile/", views.TeacherProfileView.as_view(), name="teacher-profile"),
    path("classes/", views.TeacherClassView.as_view(), name="teacher-classes"),
    path("classes/<str:class_name>/students/", views.ClassStudentsView.as_view(), name="teacher-class-students"),
    path("timetable/", views.TimetableView.as_view(), name="teacher-timetable"),
    path("timetable/convert-library/", views.LibraryConversionView.as_view(), name="teacher-convert-library"),
    path("library-bookings/", views.LibraryBookingView.as_view(), name="teacher-library-bookings"),
    path("attendance/mark/", views.AttendanceMarkView.as_view(), name="teacher-attendance-mark"),
    path("attendance/<str:class_name>/summary/", views.ClassAttendanceSummaryView.as_view(), name="teacher-attendance-summary"),
    path("evaluation/queue/", views.EvaluationQueueView.as_view(), name="teacher-evaluation-queue"),
    path("evaluation/<int:script_id>/draft/", views.DraftMarkView.as_view(), name="teacher-evaluation-draft"),
    path("evaluation/<int:script_id>/submit/", views.EvaluationSubmitView.as_view(), name="teacher-evaluation-submit"),
    path("resources/", views.ResourceView.as_view(), name="teacher-resources"),
]
