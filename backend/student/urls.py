from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.StudentDashboard.as_view(), name="student-dashboard"),
    path("profile/", views.StudentProfileView.as_view(), name="student-profile"),
    path("subjects/", views.SubjectListView.as_view(), name="student-subjects"),
    path("subjects/my/", views.MySubjectsView.as_view(), name="student-my-subjects"),
    path("subjects/select/", views.SubjectSelectionView.as_view(), name="student-subject-select"),
    path("assignments/", views.AssignmentListView.as_view(), name="student-assignments"),
    path("submissions/", views.SubmissionView.as_view(), name="student-submissions"),
    path("attendance/", views.AttendanceView.as_view(), name="student-attendance"),
    path("results/", views.ResultView.as_view(), name="student-results"),
    path("timetable/", views.TimetableView.as_view(), name="student-timetable"),
    path("notifications/", views.NotificationView.as_view(), name="student-notifications"),
    path("resources/", views.ResourceListView.as_view(), name="student-resources"),
    path("subject-request-status/", views.SubjectRequestStatusView.as_view(), name="student-subject-request-status"),
]
