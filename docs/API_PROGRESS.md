# API Progress — Complete Inventory

**Total endpoints: 157** (Authentication: 14, Student: 16, Teacher: 25, Administration: 102, Staff: 8)

> **Post-audit fixes**: `GET /api/student/results/` now returns `PublishedResult` data. Added 3 new export endpoints (`/exports/fees/`, `/exports/receipt/`, `/exports/salary/`), 1 audit endpoint (`/audit-logs/` already existed, now has frontend), 1 fee receipt endpoint (`/fees/receipt/<payment_id>/`).

---

## Authentication (`/api/`)

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET | `/api/csrf/` | `csrf_token` | Get CSRF token | ✅ |
| POST | `/api/login/` | `login_api` | Login with portal validation | ✅ |
| POST | `/api/register/` | `register_api` | Register new user | ✅ |
| POST | `/api/send-otp/` | `send_otp_api` | Send OTP to email | ✅ |
| POST | `/api/verify-otp/` | `verify_otp_api` | Verify OTP + activate account | ✅ |
| POST | `/api/logout/` | `logout_api` | Logout | ✅ |
| GET | `/api/me/` | `me` | Get current user | ✅ |
| GET | `/api/session/` | `session_api` | Check session status | ✅ |
| POST | `/api/token/` | `token_obtain_pair` | JWT login | ✅ |
| POST | `/api/token/refresh/` | `TokenRefreshView` | Refresh JWT | ✅ |
| POST | `/api/password-reset/` | `password_reset_request` | Request password reset | ✅ |
| POST | `/api/password-reset/confirm/` | `password_reset_confirm` | Confirm password reset | ✅ |
| POST | `/api/change-password/` | `change_password` | Change password (auth) | ✅ |
| GET | `/api/test/` | `test_api` | Health check | ✅ |

## Student (`/api/student/`)

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET | `dashboard/` | `StudentDashboard` | Dashboard data | ✅ |
| GET, PATCH | `profile/` | `StudentProfileView` | Profile CRUD | ✅ |
| GET | `subjects/` | `SubjectListView` | List available subjects | ✅ |
| GET | `subjects/my/` | `MySubjectsView` | My subjects | ✅ |
| POST | `subjects/select/` | `SubjectSelectionView` | Select/request subjects | ✅ |
| GET | `assignments/` | `AssignmentListView` | List assignments | ✅ |
| GET, POST | `submissions/` | `SubmissionView` | Submit assignment | ✅ |
| DELETE | `submissions/files/<file_id>/` | `SubmissionFileView` | Remove submission file | ✅ |
| GET | `attendance/` | `AttendanceView` | View attendance | ✅ |
| GET | `results/` | `ResultView` | View results | ✅ |
| GET | `timetable/` | `TimetableView` | View timetable | ✅ |
| GET, POST | `notifications/` | `NotificationView` | Notifications + mark read | ✅ |
| GET | `resources/` | `ResourceListView` | List resources | ✅ |
| GET | `subjects/<subject_id>/chapters/` | `SubjectChaptersView` | Subject chapters/topics | ✅ |
| GET | `subject-request-status/` | `SubjectRequestStatusView` | Enrollment open check | ✅ |
| GET | `exams/` | `StudentExamListView` | Exam schedule | ✅ |

## Teacher (`/api/teacher/`)

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET | `dashboard/` | `TeacherDashboard` | Dashboard data | ✅ |
| GET, PATCH | `profile/` | `TeacherProfileView` | Profile CRUD | ✅ |
| GET, POST | `classes/` | `TeacherClassView` | My classes | ✅ |
| GET | `classes/<class_name>/students/` | `ClassStudentsView` | Class students list | ✅ |
| GET | `classes/<class_name>/performance/` | `ClassStudentPerformanceView` | Student performance | ✅ |
| GET, POST | `timetable/` | `TimetableView` | Timetable CRUD | ✅ |
| POST | `timetable/convert-library/` | `LibraryConversionView` | Convert to library | ✅ |
| GET | `library-bookings/` | `LibraryBookingView` | Library bookings | ✅ |
| POST | `attendance/mark/` | `AttendanceMarkView` | Mark attendance | ✅ |
| GET | `attendance/<class_name>/summary/` | `ClassAttendanceSummaryView` | Attendance summary | ✅ |
| GET | `evaluation/queue/` | `EvaluationQueueView` | Pending answer scripts | ✅ |
| POST | `evaluation/<script_id>/draft/` | `DraftMarkView` | Save draft marks | ✅ |
| POST | `evaluation/<script_id>/submit/` | `EvaluationSubmitView` | Submit evaluation | ✅ |
| GET, POST | `resources/` | `ResourceView` | Resources CRUD | ✅ |
| GET, PUT, DELETE | `resources/<resource_id>/` | `ResourceDetailView` | Resource detail | ✅ |
| GET | `resources/<resource_id>/download/` | `ResourceDownloadView` | Download resource | ✅ |
| GET, POST | `assignments/` | `TeacherAssignmentListView` | Assignments CRUD | ✅ |
| GET, PATCH, DELETE | `assignments/<assignment_id>/` | `TeacherAssignmentDetailView` | Assignment detail | ✅ |
| GET | `assignments/<assignment_id>/submissions/` | `AssignmentSubmissionsView` | List submissions | ✅ |
| POST | `submissions/<submission_id>/marks/` | `SubmissionMarksView` | Grade submission | ✅ |
| GET, POST | `chapters/` | `TeacherSubjectChaptersView` | Chapters CRUD | ✅ |
| PATCH, DELETE | `chapters/<chapter_id>/` | `TeacherSubjectChapterDetailView` | Chapter detail | ✅ |
| POST, PATCH, DELETE | `chapters/<chapter_id>/topics/` | `TeacherTopicView` | Topics CRUD | ✅ |
| GET, POST | `class-progress/` | `TeacherClassProgressView` | Chapter progress | ✅ |
| GET | `exams/` | `TeacherExamListView` | Exam schedule | ✅ |

## Administration (`/api/admin/`)

### Dashboard

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET | `dashboard/summary/` | `DashboardSummaryView` | Summary stats | ✅ |
| GET | `dashboard/student-growth/` | `DashboardStudentGrowthView` | Growth trend | ✅ |
| GET | `dashboard/attendance/` | `DashboardAttendanceView` | Attendance analytics | ✅ |
| GET | `dashboard/exam-performance/` | `DashboardExamPerformanceView` | Exam analytics | ✅ |

### Subjects

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `subjects/` | `SubjectAdminListView` | List/create subjects | ✅ |
| GET, PATCH, DELETE | `subjects/<subject_id>/` | `SubjectAdminDetailView` | Subject CRUD | ✅ |

### Subject Requests

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, PATCH | `subject-request-control/` | `SubjectRequestControlView` | Toggle enrollment | ✅ |
| GET | `subject-requests/pending/` | `PendingSubjectRequestsListView` | Pending requests | ✅ |

### Students

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `students/` | `StudentListView` | List/create students | ✅ |
| GET, PATCH | `students/<student_id>/` | `StudentDetailView` | Student detail | ✅ |
| POST | `students/<student_id>/approve-subjects/` | `StudentSubjectApprovalView` | Approve subjects | ✅ |
| POST | `students/<student_id>/reject-subjects/` | `StudentSubjectRejectView` | Reject subjects | ✅ |
| POST | `students/<student_id>/assign-subjects/` | `StudentSubjectAssignmentView` | Assign subjects | ✅ |
| GET, POST | `students/<student_id>/notifications/` | `StudentNotificationsView` | Student notifications | ✅ |
| GET | `students/<student_id>/documents/` | `StudentDocumentsView` | Student documents | ✅ |

### Teachers

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `teachers/` | `TeacherListView` | List/create teachers | ✅ |
| GET, PATCH | `teachers/<teacher_id>/` | `TeacherDetailView` | Teacher detail | ✅ |
| POST | `teachers/<teacher_id>/notify/` | `TeacherNotifyView` | Send notification | ✅ |
| POST | `teachers/<teacher_id>/assign-class-teacher/` | `TeacherAssignClassTeacherView` | Assign class teacher | ✅ |
| POST | `teachers/<teacher_id>/allocate-subject/` | `TeacherAllocateSubjectView` | Allocate subject | ✅ |
| POST | `teachers/<teacher_id>/assign-class/` | `TeacherAssignClassView` | Assign class | ✅ |
| GET | `teacher-allocations/` | `TeacherAllocationsView` | All allocations | ✅ |
| GET | `class-teacher-assignments/` | `TeacherClassTeacherAssignmentsView` | Class teacher list | ✅ |

### Academic Sessions

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `sessions/` | `AcademicSessionListView` | List/create sessions | ✅ |
| GET, PATCH, DELETE | `sessions/<session_id>/` | `AcademicSessionDetailView` | Session CRUD | ✅ |

### Classes

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `classes/` | `ClassListView` | List/create classes | ✅ |
| GET | `classes/<class_name>/` | `ClassDetailView` | Class detail | ✅ |

### Attendance

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET | `attendance/analytics/` | `AttendanceAnalyticsView` | Attendance analytics | ✅ |
| GET | `attendance/faculty/` | `FacultyAttendanceListView` | Faculty attendance list | ✅ |
| POST | `attendance/faculty/mark/` | `FacultyAttendanceMarkView` | Mark faculty attendance | ✅ |

### Exams

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `exams/` | `ExamListView` | List/create exams | ✅ |
| POST | `exams/<exam_id>/publish/` | `ExamPublishView` | Publish exam | ✅ |
| POST | `exams/<exam_id>/archive/` | `ExamArchiveView` | Archive exam | ✅ |
| POST | `exams/answer-scripts/` | `AnswerScriptUploadView` | Upload scripts | ✅ |
| GET | `exams/evaluation-tracking/` | `EvaluationTrackingView` | Eval tracking | ✅ |
| POST | `exams/publish-result/` | `PublishedResultCreateView` | Publish results | ✅ |
| GET | `exams/analytics/` | `ExamAnalyticsView` | Exam analytics | ✅ |

### Events

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `events/` | `EventListView` | List/create events | ✅ |
| GET, PATCH, DELETE | `events/<event_id>/` | `EventDetailView` | Event CRUD | ✅ |
| POST | `events/<event_id>/publish/` | `EventPublishView` | Publish event | ✅ |
| POST | `events/<event_id>/archive/` | `EventArchiveView` | Archive event | ✅ |

### Contacts

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET | `contacts/` | `ContactSubmissionListView` | List submissions | ✅ |
| PATCH, DELETE | `contacts/<submission_id>/` | `ContactSubmissionDetailView` | Submission detail | ✅ |

### Admissions

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET | `admissions/` | `AdmissionApplicationListView` | List applications | ✅ |
| GET | `admissions/<application_id>/` | `AdmissionApplicationDetailView` | Application detail | ✅ |
| POST | `admissions/<application_id>/approve/` | `AdmissionApplicationApproveView` | Approve application | ✅ |
| POST | `admissions/<application_id>/reject/` | `AdmissionApplicationRejectView` | Reject application | ✅ |
| POST | `admissions/<application_id>/create-student/` | `AdmissionCreateStudentView` | Create student | ✅ |
| GET | `admissions/stats/` | `AdmissionStatsView` | Admission stats | ✅ |

### Settings / CMS

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, PATCH | `settings/about/` | `AboutPageView` | About page | ✅ |
| GET, POST | `settings/gallery/` | `GalleryImageView` | Gallery CRUD | ✅ |
| DELETE | `settings/gallery/<image_id>/` | `GalleryImageDeleteView` | Delete gallery image | ✅ |
| GET, POST | `settings/homepage/` | `HomepageFeaturedImageView` | Homepage images | ✅ |
| DELETE | `settings/homepage/<image_id>/` | `HomepageFeaturedImageDeleteView` | Delete homepage image | ✅ |
| GET, PATCH | `settings/admission/` | `AdmissionPageView` | Admission page | ✅ |

### Exports

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `exports/students/` | `ExportStudentsView` | Export students | ✅ |
| GET, POST | `exports/teachers/` | `ExportTeachersView` | Export teachers | ✅ |
| GET, POST | `exports/attendance/` | `ExportAttendanceView` | Export attendance | ✅ |
| GET, POST | `exports/classes/` | `ExportClassesView` | Export classes | ✅ |
| GET, POST | `exports/exams/` | `ExportExamsView` | Export exams | ✅ |
| GET, POST | `exports/admissions/` | `ExportAdmissionsView` | Export admissions | ✅ |
| GET, POST | `exports/contacts/` | `ExportContactsView` | Export contacts | ✅ |
| GET, POST | `exports/audit-logs/` | `ExportAuditLogsView` | Export audit logs | ✅ |
| GET, POST | `exports/documents/` | `ExportDocumentsView` | Export documents | ✅ |
| POST | `exports/print/` | `PrintView` | Generate print view | ✅ |
| GET | `exports/logs/` | `ExportLogListView` | Export logs | ✅ |
| POST | `exports/documents/zip/` | `DocumentZIPDownloadView` | ZIP download docs | ✅ |
| POST | `exports/admissions/zip/` | `AdmissionZIPDownloadView` | ZIP download admissions | ✅ |

### Documents

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| POST | `documents/upload/` | `DocumentUploadView` | Upload document | ✅ |
| GET | `documents/` | `DocumentListView` | List documents | ✅ |
| DELETE | `documents/<doc_id>/` | `DocumentDeleteView` | Delete document | ✅ |

### Audit

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET | `audit-logs/` | `AuditLogListView` | List audit logs | ✅ |

### Notifications (Broadcast)

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `notifications/` | `NotificationBroadcastListView` | Broadcast CRUD | ✅ |
| POST | `notifications/<broadcast_id>/send/` | `NotificationBroadcastSendView` | Send broadcast | ✅ |

### Letterheads

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `letterheads/` | `LetterheadListView` | Letterhead CRUD | ✅ |
| PATCH, DELETE | `letterheads/<letterhead_id>/` | `LetterheadDetailView` | Letterhead detail | ✅ |

### Fees

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET, POST | `fees/structures/` | `FeeStructureListView` | Fee structures | ✅ |
| GET, PATCH, DELETE | `fees/structures/<structure_id>/` | `FeeStructureDetailView` | Structure detail | ✅ |
| POST | `fees/structures/duplicate/` | `FeeStructureDuplicateView` | Duplicate structure | ✅ |
| GET | `fees/payments/` | `FeePaymentListView` | List payments | ✅ |
| POST | `fees/payments/<payment_id>/verify/` | `FeePaymentVerifyView` | Verify payment | ✅ |
| POST | `fees/payments/<payment_id>/reject/` | `FeePaymentRejectView` | Reject payment | ✅ |
| POST | `fees/payments/<payment_id>/refund/initiate/` | `FeeRefundInitiateView` | Initiate refund | ✅ |
| POST | `fees/payments/<payment_id>/refund/complete/` | `FeeRefundCompleteView` | Complete refund | ✅ |
| GET, POST | `fees/scholarships/` | `ScholarshipListView` | Scholarships | ✅ |
| POST | `fees/scholarships/<scholarship_id>/revoke/` | `ScholarshipRevokeView` | Revoke scholarship | ✅ |
| GET | `fees/analytics/` | `FeeAnalyticsView` | Fee analytics | ✅ |
| GET | `fees/activity-log/` | `FeeActivityLogView` | Activity log | ✅ |
| GET, POST | `fees/my-ledger/` | `StudentFeeLedgerView` | Student ledger | ✅ |

## Staff (`/api/staff/`)

| Method | Path | View | Description | Status |
|--------|------|------|-------------|--------|
| GET | `dashboard/` | `StaffDashboardView` | Staff dashboard stats | ✅ |
| GET, POST | `upload-tasks/` | `StaffUploadTasksView` | List upload batches / create batch | ✅ |
| GET, POST | `upload/` | `StaffUploadView` | List pending / upload script | ✅ |
| GET, PUT, DELETE | `upload/<pk>/` | `StaffUploadDetailView` | View / replace / delete upload | ✅ |
| GET | `history/` | `StaffUploadHistoryView` | Upload history with status filter | ✅ |
| GET | `profile/` | `StaffProfileView` | View / edit staff profile | ✅ |
