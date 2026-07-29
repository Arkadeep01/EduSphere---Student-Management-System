from django.urls import path
from . import views
from .views import rechecking as rechecking_views

urlpatterns = [
    # Director
    path("director/admins/", views.DirectorAdminListView.as_view(), name="director-admin-list"),
    path("director/admins/create/", views.DirectorAdminCreateView.as_view(), name="director-admin-create"),
    path("director/staff/", views.DirectorStaffListView.as_view(), name="director-staff-list"),
    path("director/staff/create/", views.DirectorStaffCreateView.as_view(), name="director-staff-create"),
    path("director/users/<int:user_id>/toggle-active/", views.DirectorToggleActiveView.as_view(), name="director-toggle-active"),
    path("director/users/<int:user_id>/change-role/", views.DirectorChangeRoleView.as_view(), name="director-change-role"),

    # Dashboard
    path("dashboard/summary/", views.DashboardSummaryView.as_view(), name="admin-dashboard-summary"),
    path("dashboard/student-growth/", views.DashboardStudentGrowthView.as_view(), name="admin-dashboard-student-growth"),
    path("dashboard/attendance/", views.DashboardAttendanceView.as_view(), name="admin-dashboard-attendance"),
    path("dashboard/exam-performance/", views.DashboardExamPerformanceView.as_view(), name="admin-dashboard-exam-performance"),

    # Subjects
    path("subjects/", views.SubjectAdminListView.as_view(), name="admin-subject-list"),
    path("subjects/<int:subject_id>/", views.SubjectAdminDetailView.as_view(), name="admin-subject-detail"),

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
    path("students/<int:student_id>/deactivate/", views.StudentDeactivateView.as_view(), name="admin-student-deactivate"),
    path("subject-withdrawals/", views.SubjectWithdrawalListView.as_view(), name="admin-subject-withdrawals"),
    path("subject-withdrawals/<int:request_id>/review/", views.SubjectWithdrawalReviewView.as_view(), name="admin-subject-withdrawal-review"),
    path("class-subject-config/", views.ClassSubjectConfigView.as_view(), name="admin-class-subject-config"),
    path("subject-requests/pending/", views.PendingSubjectRequestsListView.as_view(), name="admin-pending-subject-requests"),

    # Teachers
    path("teachers/", views.TeacherListView.as_view(), name="admin-teacher-list"),
    path("teachers/create/", views.TeacherCreateView.as_view(), name="admin-teacher-create"),
    path("teachers/<int:teacher_id>/", views.TeacherDetailView.as_view(), name="admin-teacher-detail"),
    path("teachers/<int:teacher_id>/notify/", views.TeacherNotifyView.as_view(), name="admin-teacher-notify"),
    path("teachers/<int:teacher_id>/assign-class-teacher/", views.TeacherAssignClassTeacherView.as_view(), name="admin-teacher-assign-class-teacher"),
    path("teachers/<int:teacher_id>/allocate-subject/", views.TeacherAllocateSubjectView.as_view(), name="admin-teacher-allocate-subject"),
    path("teachers/allocations/<int:allocation_id>/deallocate/", views.TeacherDeallocateSubjectView.as_view(), name="admin-teacher-deallocate-subject"),
    path("teacher-allocations/draft/", views.TeacherDraftAllocationsView.as_view(), name="admin-teacher-draft-allocations"),
    path("teachers/<int:teacher_id>/assign-class/", views.TeacherAssignClassView.as_view(), name="admin-teacher-assign-class"),
    path("teacher-allocations/", views.TeacherAllocationsView.as_view(), name="admin-teacher-allocations"),
    path("class-teacher-assignments/", views.TeacherClassTeacherAssignmentsView.as_view(), name="admin-class-teacher-assignments"),

    # Academic Sessions
    path("sessions/", views.AcademicSessionListView.as_view(), name="admin-session-list"),
    path("sessions/<int:session_id>/", views.AcademicSessionDetailView.as_view(), name="admin-session-detail"),

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
    path("exams/staff-batches/", views.AdminStaffUploadBatchesView.as_view(), name="admin-staff-batches"),
    path("exams/batches/<str:batch_id>/verify/", views.AdminVerifyBatchView.as_view(), name="admin-batch-verify"),
    path("exams/batches/<str:batch_id>/reject/", views.AdminRejectBatchView.as_view(), name="admin-batch-reject"),
    path("exams/assign-scripts/", views.AdminAssignScriptsView.as_view(), name="admin-assign-scripts"),

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

    # Director CMS
    path("director/about/", views.DirectorAboutPageView.as_view(), name="director-about"),
    path("director/admission/", views.DirectorAdmissionPageView.as_view(), name="director-admission"),
    path("director/faq/", views.FAQListView.as_view(), name="director-faq-list"),
    path("director/faq/<int:faq_id>/", views.FAQDetailView.as_view(), name="director-faq-detail"),
    path("director/leadership/", views.LeadershipListView.as_view(), name="director-leadership-list"),
    path("director/leadership/<int:leader_id>/", views.LeadershipDetailView.as_view(), name="director-leadership-detail"),
    path("director/announcements/", views.PublicAnnouncementListView.as_view(), name="director-announcement-list"),
    path("director/announcements/<int:announcement_id>/", views.PublicAnnouncementDetailView.as_view(), name="director-announcement-detail"),
    path("director/dashboard/", views.DirectorDashboardSummaryView.as_view(), name="director-dashboard-summary"),

    # Settings / CMS (existing - About/Admission moved to Director-only)
    path("settings/about/", views.AboutPageView.as_view(), name="admin-settings-about"),
    path("settings/gallery/", views.GalleryImageView.as_view(), name="admin-settings-gallery"),
    path("settings/gallery/<int:image_id>/", views.GalleryImageDeleteView.as_view(), name="admin-settings-gallery-delete"),
    path("settings/homepage/", views.HomepageFeaturedImageView.as_view(), name="admin-settings-homepage"),
    path("settings/homepage/<int:image_id>/", views.HomepageFeaturedImageDeleteView.as_view(), name="admin-settings-homepage-delete"),
    path("settings/admission/", views.AdmissionPageView.as_view(), name="admin-settings-admission"),

    # Exports
    path("exports/students/", views.ExportStudentsView.as_view(), name="admin-export-students"),

    # Promotion & Academic Session Rollover
    path("promotions/student/", views.StudentPromotionView.as_view(), name="admin-student-promotion"),
    path("promotions/student/<int:student_id>/rollback/", views.StudentRollbackView.as_view(), name="admin-student-rollback"),
    path("promotions/bulk/", views.BulkPromotionView.as_view(), name="admin-bulk-promotion"),
    path("promotions/rollover/", views.AcademicSessionRolloverView.as_view(), name="admin-session-rollover"),
    path("promotions/rollover/<int:rollover_id>/", views.AcademicSessionRolloverDetailView.as_view(), name="admin-session-rollover-detail"),
    path("promotions/history/<int:student_id>/", views.StudentHistoryView.as_view(), name="admin-student-history"),
    path("promotions/logs/", views.PromotionLogView.as_view(), name="admin-promotion-logs"),
    path("promotions/rules/", views.PromotionRuleView.as_view(), name="admin-promotion-rules"),
    path("promotions/rules/<int:rule_id>/", views.PromotionRuleView.as_view(), name="admin-promotion-rule-detail"),

    # Exports
    path("exports/teachers/", views.ExportTeachersView.as_view(), name="admin-export-teachers"),
    path("exports/attendance/", views.ExportAttendanceView.as_view(), name="admin-export-attendance"),
    path("exports/classes/", views.ExportClassesView.as_view(), name="admin-export-classes"),
    path("exports/exams/", views.ExportExamsView.as_view(), name="admin-export-exams"),
    path("exports/admissions/", views.ExportAdmissionsView.as_view(), name="admin-export-admissions"),
    path("exports/contacts/", views.ExportContactsView.as_view(), name="admin-export-contacts"),
    path("exports/audit-logs/", views.ExportAuditLogsView.as_view(), name="admin-export-audit-logs"),
    path("exports/documents/", views.ExportDocumentsView.as_view(), name="admin-export-documents"),
    path("exports/fees/", views.ExportFeesView.as_view(), name="admin-export-fees"),
    path("exports/receipt/", views.ExportReceiptView.as_view(), name="admin-export-receipt"),
    path("exports/salary/", views.ExportSalaryView.as_view(), name="admin-export-salary"),
    path("exports/print/", views.PrintView.as_view(), name="admin-export-print"),
    path("exports/logs/", views.ExportLogListView.as_view(), name="admin-export-logs"),
    path("exports/documents/zip/", views.DocumentZIPDownloadView.as_view(), name="admin-document-zip"),
    path("exports/admissions/zip/", views.AdmissionZIPDownloadView.as_view(), name="admin-admission-zip"),

    # Documents
    path("documents/", views.DocumentListView.as_view(), name="admin-document-list"),
    path("documents/upload/", views.DocumentUploadView.as_view(), name="admin-document-upload"),
    path("documents/<int:doc_id>/", views.DocumentDeleteView.as_view(), name="admin-document-delete"),

    # Audit Logs
    path("audit-logs/", views.AuditLogListView.as_view(), name="admin-audit-log-list"),

    # Notifications
    path("notifications/", views.NotificationBroadcastListView.as_view(), name="admin-notification-list"),
    path("notifications/<int:broadcast_id>/send/", views.NotificationBroadcastSendView.as_view(), name="admin-notification-send"),

    # Letterheads
    path("letterheads/", views.LetterheadListView.as_view(), name="admin-letterhead-list"),
    path("letterheads/<int:letterhead_id>/", views.LetterheadDetailView.as_view(), name="admin-letterhead-detail"),

    # Fees
    path("fees/structures/", views.FeeStructureListView.as_view(), name="admin-fee-structures"),
    path("fees/structures/<int:structure_id>/", views.FeeStructureDetailView.as_view(), name="admin-fee-structure-detail"),
    path("fees/structures/duplicate/", views.FeeStructureDuplicateView.as_view(), name="admin-fee-structure-duplicate"),
    path("fees/generate/", views.FeeGenerateView.as_view(), name="admin-fee-generate"),
    path("fees/payments/", views.FeePaymentListView.as_view(), name="admin-fee-payments"),
    path("fees/payments/record/", views.FeePaymentRecordView.as_view(), name="admin-fee-payment-record"),
    path("fees/payments/<int:payment_id>/verify/", views.FeePaymentVerifyView.as_view(), name="admin-fee-payment-verify"),
    path("fees/payments/<int:payment_id>/reject/", views.FeePaymentRejectView.as_view(), name="admin-fee-payment-reject"),
    path("fees/payments/correction/request/", views.FeeCorrectionRequestView.as_view(), name="admin-fee-correction-request"),
    path("fees/payments/correction/<int:payment_id>/approve/", views.FeeCorrectionApproveView.as_view(), name="admin-fee-correction-approve"),
    path("fees/payments/refund/request/", views.FeeRefundRequestView.as_view(), name="admin-fee-refund-request"),
    path("fees/payments/refund/<int:payment_id>/approve/", views.FeeRefundApproveView.as_view(), name="admin-fee-refund-approve"),
    path("fees/payments/<int:payment_id>/refund/initiate/", views.FeeRefundInitiateView.as_view(), name="admin-fee-refund-initiate"),
    path("fees/payments/<int:payment_id>/refund/complete/", views.FeeRefundCompleteView.as_view(), name="admin-fee-refund-complete"),
    path("fees/scholarships/", views.ScholarshipListView.as_view(), name="admin-fee-scholarships"),
    path("fees/scholarships/<int:scholarship_id>/revoke/", views.ScholarshipRevokeView.as_view(), name="admin-fee-scholarship-revoke"),
    path("fees/analytics/", views.FeeAnalyticsView.as_view(), name="admin-fee-analytics"),
    path("fees/activity-log/", views.FeeActivityLogView.as_view(), name="admin-fee-activity-log"),
    path("fees/my-ledger/", views.StudentFeeLedgerView.as_view(), name="admin-fee-my-ledger"),
    path("fees/receipt/<int:payment_id>/", views.FeeReceiptView.as_view(), name="admin-fee-receipt"),
    path("fees/clearance-deadline/", views.FeeClearanceDeadlineView.as_view(), name="admin-fee-clearance-deadline"),
    path("fees/reminder/", views.FeeReminderView.as_view(), name="admin-fee-reminder"),
    path("fees/outstanding/<int:student_id>/", views.FeeOutstandingCheckView.as_view(), name="admin-fee-outstanding"),
    path("fees/admission/<int:student_id>/record/", views.FeeAdmissionRecordView.as_view(), name="admin-fee-admission-record"),
    path("fees/admission/<int:student_id>/pay/", views.FeeAdmissionPaymentView.as_view(), name="admin-fee-admission-pay"),

    # Result Engine
    path("results/grade-boundaries/", views.GradeBoundaryListView.as_view(), name="admin-grade-boundaries"),
    path("results/publications/", views.ResultPublicationCreateView.as_view(), name="admin-result-publication-create"),
    path("results/publications/list/", views.ResultPublicationListView.as_view(), name="admin-result-publication-list"),
    path("results/publications/<int:pub_id>/", views.ResultPublicationDetailView.as_view(), name="admin-result-publication-detail"),
    path("results/publications/<int:pub_id>/generate/", views.GenerateResultsView.as_view(), name="admin-result-generate"),
    path("results/publications/<int:pub_id>/results/", views.StudentResultListView.as_view(), name="admin-student-result-list"),
    path("results/publications/<int:pub_id>/transition/", views.WorkflowTransitionView.as_view(), name="admin-result-transition"),
    path("results/publications/<int:pub_id>/bulk-publish/", views.BulkPublishView.as_view(), name="admin-result-bulk-publish"),
    path("results/publications/<int:pub_id>/compute-ranks/", views.ComputeRankView.as_view(), name="admin-result-compute-ranks"),
    path("results/publications/<int:pub_id>/subject-ranks/", views.SubjectRankView.as_view(), name="admin-result-subject-ranks"),
    path("results/pdf/report-card/<int:student_result_id>/", views.ReportCardPDFView.as_view(), name="admin-result-report-card-pdf"),
    path("results/pdf/marksheet/<int:pub_id>/", views.MarksheetPDFView.as_view(), name="admin-result-marksheet-pdf"),
    path("results/pdf/transcript/<int:student_result_id>/", views.TranscriptPDFView.as_view(), name="admin-result-transcript-pdf"),
    path("results/pdf/printable/<int:student_result_id>/", views.PrintableResultPDFView.as_view(), name="admin-result-printable-pdf"),

    # Rechecking
    path("rechecking/", rechecking_views.AdminRecheckingListView.as_view(), name="admin-rechecking-list"),
    path("rechecking/stats/", rechecking_views.AdminRecheckingStatsView.as_view(), name="admin-rechecking-stats"),
    path("rechecking/evaluators/", rechecking_views.AdminEvaluatorListView.as_view(), name="admin-rechecking-evaluators"),
    path("rechecking/<int:request_id>/", rechecking_views.AdminRecheckingDetailView.as_view(), name="admin-rechecking-detail"),
    path("rechecking/<int:request_id>/action/", rechecking_views.AdminRecheckingActionView.as_view(), name="admin-rechecking-action"),
    path("rechecking/<int:request_id>/assign/", rechecking_views.AdminRecheckingAssignEvaluatorView.as_view(), name="admin-rechecking-assign"),
    path("rechecking/<int:request_id>/complete/", rechecking_views.AdminRecheckingCompleteView.as_view(), name="admin-rechecking-complete"),
    path("rechecking/close-expired/", rechecking_views.AdminRecheckingCloseExpiredView.as_view(), name="admin-rechecking-close-expired"),

    # Staff Rechecking Overview
    path("staff/rechecking/", rechecking_views.StaffRecheckingOverviewView.as_view(), name="staff-rechecking-overview"),

    # Document Templates
    path("templates/", views.TemplateListView.as_view(), name="admin-template-list"),
    path("templates/<int:template_id>/", views.TemplateDetailView.as_view(), name="admin-template-detail"),
    path("templates/<int:template_id>/upload/", views.TemplateUploadFileView.as_view(), name="admin-template-upload"),
    path("templates/<int:template_id>/activate/", views.TemplateActivateView.as_view(), name="admin-template-activate"),
    path("templates/<int:template_id>/placeholders/", views.TemplatePlaceholdersView.as_view(), name="admin-template-placeholders"),
    path("templates/<int:template_id>/preview/", views.TemplatePreviewView.as_view(), name="admin-template-preview"),
    path("templates/placeholders/", views.TemplatePlaceholdersView.as_view(), name="admin-placeholder-registry"),

    # Generated Documents
    path("generated-documents/", views.GeneratedDocumentListView.as_view(), name="admin-generated-document-list"),
    path("generated-documents/generate/", views.GeneratedDocumentCreateView.as_view(), name="admin-generated-document-create"),
    path("generated-documents/<int:doc_id>/", views.GeneratedDocumentDetailView.as_view(), name="admin-generated-document-detail"),
    path("generated-documents/<int:doc_id>/download/", views.GeneratedDocumentDownloadView.as_view(), name="admin-generated-document-download"),

    # Website Media - Fixed Slots
    path("settings/slots/", views.SlotListView.as_view(), name="admin-slots"),
    path("settings/slots/<str:slot>/", views.SlotUploadView.as_view(), name="admin-slots-upload"),
    path("settings/slots/<str:slot>/detail/", views.SlotDetailView.as_view(), name="admin-slots-detail"),

    # Website Media - Facilities
    path("settings/facilities/", views.FacilityListView.as_view(), name="admin-facilities"),
    path("settings/facilities/upload/", views.FacilityUploadView.as_view(), name="admin-facilities-upload"),
    path("settings/facilities/<int:facility_id>/", views.FacilityDetailView.as_view(), name="admin-facilities-detail"),
]
