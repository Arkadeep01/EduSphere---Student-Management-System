from django.urls import path
from . import views
from administration.views.rechecking import (
    StudentRecheckingEligibleView,
    StudentRecheckingCreateView,
    StudentRecheckingListView,
)

urlpatterns = [
    path("dashboard/", views.StudentDashboard.as_view(), name="student-dashboard"),
    path("profile/", views.StudentProfileView.as_view(), name="student-profile"),
    path("subjects/", views.SubjectListView.as_view(), name="student-subjects"),
    path("subjects/my/", views.MySubjectsView.as_view(), name="student-my-subjects"),
    path("subjects/select/", views.SubjectSelectionView.as_view(), name="student-subject-select"),
    path("assignments/", views.AssignmentListView.as_view(), name="student-assignments"),
    path("submissions/", views.SubmissionView.as_view(), name="student-submissions"),
    path("submissions/files/<int:file_id>/", views.SubmissionFileView.as_view(), name="student-submission-file"),
    path("attendance/", views.AttendanceView.as_view(), name="student-attendance"),
    path("results/", views.ResultView.as_view(), name="student-results"),
    path("timetable/", views.TimetableView.as_view(), name="student-timetable"),
    path("notifications/", views.NotificationView.as_view(), name="student-notifications"),
    path("resources/", views.ResourceListView.as_view(), name="student-resources"),
    path("subjects/<int:subject_id>/chapters/", views.SubjectChaptersView.as_view(), name="student-subject-chapters"),
    path("subject-request-status/", views.SubjectRequestStatusView.as_view(), name="student-subject-request-status"),
    path("exams/", views.StudentExamListView.as_view(), name="student-exams"),
    path("subject-withdrawal/", views.SubjectWithdrawalView.as_view(), name="student-subject-withdrawal"),
    path("rechecking/eligible/", StudentRecheckingEligibleView.as_view(), name="student-rechecking-eligible"),
    path("rechecking/", StudentRecheckingListView.as_view(), name="student-rechecking-list"),
    path("rechecking/create/", StudentRecheckingCreateView.as_view(), name="student-rechecking-create"),
]
