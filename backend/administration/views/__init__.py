from .dashboard import (
    DashboardSummaryView,
    DashboardStudentGrowthView,
    DashboardAttendanceView,
    DashboardExamPerformanceView,
)

from .student_admin import (
    StudentListView,
    StudentDetailView,
    StudentSubjectApprovalView,
    StudentSubjectAssignmentView,
    StudentNotificationsView,
    StudentDocumentsView,
    PendingSubjectRequestsListView,
    StudentSubjectRejectView,
)

from .teacher_admin import (
    TeacherListView,
    TeacherDetailView,
    TeacherNotifyView,
    TeacherAssignClassTeacherView,
    TeacherAllocateSubjectView,
    TeacherAssignClassView,
    TeacherAllocationsView,
    TeacherClassTeacherAssignmentsView,
)

from .class_admin import ClassListView, ClassDetailView

from .attendance_admin import (
    AttendanceAnalyticsView,
    FacultyAttendanceListView,
    FacultyAttendanceMarkView,
)

from .exam_admin import (
    ExamListView,
    ExamPublishView,
    ExamArchiveView,
    AnswerScriptUploadView,
    EvaluationTrackingView,
    PublishedResultCreateView,
    ExamAnalyticsView,
)

from .event_admin import (
    EventListView,
    EventDetailView,
    EventPublishView,
    EventArchiveView,
)

from .contact_admin import (
    ContactSubmissionListView,
    ContactSubmissionDetailView,
)

from .admission_admin import (
    AdmissionApplicationListView,
    AdmissionApplicationDetailView,
    AdmissionApplicationApproveView,
    AdmissionApplicationRejectView,
    AdmissionCreateStudentView,
    AdmissionStatsView,
)

from .cms_admin import (
    AboutPageView,
    GalleryImageView,
    GalleryImageDeleteView,
    HomepageFeaturedImageView,
    HomepageFeaturedImageDeleteView,
    AdmissionPageView,
)

from .export_admin import ExportStudentsView, ExportTeachersView, ExportAttendanceView

from .document_admin import DocumentUploadView, DocumentListView, DocumentDeleteView

from .notification_admin import (
    NotificationBroadcastListView,
    NotificationBroadcastSendView,
)

from .subject_request import SubjectRequestControlView
