from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path("dashboard/summary/", views.DashboardSummaryView.as_view(), name="admin-dashboard-summary"),
    path("dashboard/student-growth/", views.DashboardStudentGrowthView.as_view(), name="admin-dashboard-student-growth"),
    path("dashboard/attendance/", views.DashboardAttendanceView.as_view(), name="admin-dashboard-attendance"),
    path("dashboard/exam-performance/", views.DashboardExamPerformanceView.as_view(), name="admin-dashboard-exam-performance"),

    # Subject Request Control
    path("subject-request-control/", views.SubjectRequestControlView.as_view(), name="admin-subject-request-control"),

    # Students
    path("students/", views.StudentListView.as_view(), name="admin-student-list"),
    path("students/<int:student_id>/", views.StudentDetailView.as_view(), name="admin-student-detail"),
    path("students/<int:student_id>/approve-subjects/", views.StudentSubjectApprovalView.as_view(), name="admin-student-approve-subjects"),
    path("students/<int:student_id>/reject-subjects/", views.StudentSubjectRejectView.as_view(), name="admin-student-reject-subjects"),
    path("students/<int:student_id>/assign-subjects/", views.StudentSubjectAssignmentView.as_view(), name="admin-student-assign-subjects"),
    path("students/<int:student_id>/notifications/", views.StudentNotificationsView.as_view(), name="admin-student-notifications"),
    path("students/<int:student_id>/documents/", views.StudentDocumentsView.as_view(), name="admin-student-documents"),
    path("subject-requests/pending/", views.PendingSubjectRequestsListView.as_view(), name="admin-pending-subject-requests"),

    # Teachers
    path("teachers/", views.TeacherListView.as_view(), name="admin-teacher-list"),
    path("teachers/<int:teacher_id>/", views.TeacherDetailView.as_view(), name="admin-teacher-detail"),
    path("teachers/<int:teacher_id>/notify/", views.TeacherNotifyView.as_view(), name="admin-teacher-notify"),
    path("teachers/<int:teacher_id>/assign-class-teacher/", views.TeacherAssignClassTeacherView.as_view(), name="admin-teacher-assign-class-teacher"),
    path("teachers/<int:teacher_id>/allocate-subject/", views.TeacherAllocateSubjectView.as_view(), name="admin-teacher-allocate-subject"),
    path("teachers/<int:teacher_id>/assign-class/", views.TeacherAssignClassView.as_view(), name="admin-teacher-assign-class"),
    path("teacher-allocations/", views.TeacherAllocationsView.as_view(), name="admin-teacher-allocations"),
    path("class-teacher-assignments/", views.TeacherClassTeacherAssignmentsView.as_view(), name="admin-class-teacher-assignments"),

    # Classes
    path("classes/", views.ClassListView.as_view(), name="admin-class-list"),
    path("classes/<str:class_name>/", views.ClassDetailView.as_view(), name="admin-class-detail"),

    # Attendance
    path("attendance/analytics/", views.AttendanceAnalyticsView.as_view(), name="admin-attendance-analytics"),
    path("attendance/faculty/", views.FacultyAttendanceListView.as_view(), name="admin-faculty-attendance"),
    path("attendance/faculty/mark/", views.FacultyAttendanceMarkView.as_view(), name="admin-faculty-attendance-mark"),

    # Exams
    path("exams/", views.ExamListView.as_view(), name="admin-exam-list"),
    path("exams/<int:exam_id>/publish/", views.ExamPublishView.as_view(), name="admin-exam-publish"),
    path("exams/<int:exam_id>/archive/", views.ExamArchiveView.as_view(), name="admin-exam-archive"),
    path("exams/answer-scripts/", views.AnswerScriptUploadView.as_view(), name="admin-answer-script-upload"),
    path("exams/evaluation-tracking/", views.EvaluationTrackingView.as_view(), name="admin-evaluation-tracking"),
    path("exams/publish-result/", views.PublishedResultCreateView.as_view(), name="admin-publish-result"),
    path("exams/analytics/", views.ExamAnalyticsView.as_view(), name="admin-exam-analytics"),

    # Events
    path("events/", views.EventListView.as_view(), name="admin-event-list"),
    path("events/<int:event_id>/", views.EventDetailView.as_view(), name="admin-event-detail"),
    path("events/<int:event_id>/publish/", views.EventPublishView.as_view(), name="admin-event-publish"),
    path("events/<int:event_id>/archive/", views.EventArchiveView.as_view(), name="admin-event-archive"),

    # Contacts
    path("contacts/", views.ContactSubmissionListView.as_view(), name="admin-contact-list"),
    path("contacts/<int:submission_id>/", views.ContactSubmissionDetailView.as_view(), name="admin-contact-detail"),

    # Admissions
    path("admissions/", views.AdmissionApplicationListView.as_view(), name="admin-admission-list"),
    path("admissions/<int:application_id>/", views.AdmissionApplicationDetailView.as_view(), name="admin-admission-detail"),
    path("admissions/<int:application_id>/approve/", views.AdmissionApplicationApproveView.as_view(), name="admin-admission-approve"),
    path("admissions/<int:application_id>/reject/", views.AdmissionApplicationRejectView.as_view(), name="admin-admission-reject"),
    path("admissions/<int:application_id>/create-student/", views.AdmissionCreateStudentView.as_view(), name="admin-admission-create-student"),
    path("admissions/stats/", views.AdmissionStatsView.as_view(), name="admin-admission-stats"),

    # Settings / CMS
    path("settings/about/", views.AboutPageView.as_view(), name="admin-settings-about"),
    path("settings/gallery/", views.GalleryImageView.as_view(), name="admin-settings-gallery"),
    path("settings/gallery/<int:image_id>/", views.GalleryImageDeleteView.as_view(), name="admin-settings-gallery-delete"),
    path("settings/homepage/", views.HomepageFeaturedImageView.as_view(), name="admin-settings-homepage"),
    path("settings/homepage/<int:image_id>/", views.HomepageFeaturedImageDeleteView.as_view(), name="admin-settings-homepage-delete"),
    path("settings/admission/", views.AdmissionPageView.as_view(), name="admin-settings-admission"),

    # Exports
    path("exports/students/", views.ExportStudentsView.as_view(), name="admin-export-students"),
    path("exports/teachers/", views.ExportTeachersView.as_view(), name="admin-export-teachers"),
    path("exports/attendance/", views.ExportAttendanceView.as_view(), name="admin-export-attendance"),

    # Documents
    path("documents/", views.DocumentListView.as_view(), name="admin-document-list"),
    path("documents/upload/", views.DocumentUploadView.as_view(), name="admin-document-upload"),
    path("documents/<int:doc_id>/", views.DocumentDeleteView.as_view(), name="admin-document-delete"),

    # Notifications
    path("notifications/", views.NotificationBroadcastListView.as_view(), name="admin-notification-list"),
    path("notifications/<int:broadcast_id>/send/", views.NotificationBroadcastSendView.as_view(), name="admin-notification-send"),
]
