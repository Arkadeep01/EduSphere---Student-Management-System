from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.TeacherDashboard.as_view(), name="teacher-dashboard"),
    path("profile/", views.TeacherProfileView.as_view(), name="teacher-profile"),
    path("classes/", views.TeacherClassView.as_view(), name="teacher-classes"),
    path("classes/<str:class_name>/students/", views.ClassStudentsView.as_view(), name="teacher-class-students"),
    path("classes/<str:class_name>/performance/", views.ClassStudentPerformanceView.as_view(), name="teacher-class-performance"),
    path("timetable/", views.TimetableView.as_view(), name="teacher-timetable"),
    path("timetable/convert-library/", views.LibraryConversionView.as_view(), name="teacher-convert-library"),
    path("library-bookings/", views.LibraryBookingView.as_view(), name="teacher-library-bookings"),
    path("attendance/mark/", views.AttendanceMarkView.as_view(), name="teacher-attendance-mark"),
    path("attendance/<str:class_name>/summary/", views.ClassAttendanceSummaryView.as_view(), name="teacher-attendance-summary"),
    path("evaluation/queue/", views.EvaluationQueueView.as_view(), name="teacher-evaluation-queue"),
    path("evaluation/<int:script_id>/draft/", views.DraftMarkView.as_view(), name="teacher-evaluation-draft"),
    path("evaluation/<int:script_id>/submit/", views.EvaluationSubmitView.as_view(), name="teacher-evaluation-submit"),
    path("resources/", views.ResourceView.as_view(), name="teacher-resources"),
    path("resources/<int:resource_id>/", views.ResourceDetailView.as_view(), name="teacher-resource-detail"),
    path("resources/<int:resource_id>/download/", views.ResourceDownloadView.as_view(), name="teacher-resource-download"),
    path("assignments/", views.TeacherAssignmentListView.as_view(), name="teacher-assignment-list"),
    path("assignments/<int:assignment_id>/", views.TeacherAssignmentDetailView.as_view(), name="teacher-assignment-detail"),
    path("assignments/<int:assignment_id>/submissions/", views.AssignmentSubmissionsView.as_view(), name="teacher-assignment-submissions"),
    path("submissions/<int:submission_id>/marks/", views.SubmissionMarksView.as_view(), name="teacher-submission-marks"),

    # Subject Chapters
    path("chapters/", views.TeacherSubjectChaptersView.as_view(), name="teacher-chapters"),
    path("chapters/<int:chapter_id>/", views.TeacherSubjectChapterDetailView.as_view(), name="teacher-chapter-detail"),
    path("chapters/<int:chapter_id>/topics/", views.TeacherTopicView.as_view(), name="teacher-chapter-topics"),
    path("chapters/<int:chapter_id>/topics/<int:topic_id>/", views.TeacherTopicView.as_view(), name="teacher-topic-detail"),
    path("class-progress/", views.TeacherClassProgressView.as_view(), name="teacher-class-progress"),

    # Exams
    path("exams/", views.TeacherExamListView.as_view(), name="teacher-exams"),
]
