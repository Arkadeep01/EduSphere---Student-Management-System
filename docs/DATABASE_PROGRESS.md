# Database Progress

## Current Database
- **Engine**: PostgreSQL (via Aiven cloud)
- **Host**: pg-316eecdb-vexel.h.aivencloud.com
- **Port**: 14336
- **SSL**: Required
- **Status**: Connected and migrated

## Models Migrated (47 total, migrations 0006-0007 applied)

> **Post-audit**: Added `start_date`/`end_date` to `SubjectRequestControl` (migration `administration.0006`). Added staff role to `CustomUser` (migration `authentication.0006`). Added `StaffProfile`, extended `AnswerScriptUpload` with upload workflow fields (migration `administration.0007`).

### Django Built-in
- auth (12 migrations)
- contenttypes (2)
- sessions (1)
- sites (2)
- admin (3)

### Authentication
- `CustomUser` — email-based user model with role (student/teacher/admin)
- `OTP` — one-time passwords for verification
- allauth account (9 migrations)
- allauth socialaccount (6 migrations)

### Student
- `Subject` — subjects with tier (core/specialized/enrichment)
- `StudentProfile` — extended student info
- `StudentSubject` — subject enrollment with approval status
- `AdmissionDocument` — student admission documents
- `Assignment` — assignments created by teachers
- `AssignmentSubmission` — student submissions with status
- `SubmissionFile` — multi-file support per submission
- `Attendance` — daily attendance records
- `Result` — exam/subject results
- `Timetable` — student class timetable
- `Notification` — per-user notifications

### Teacher
- `TeacherProfile` — teacher info and subject assignment
- `TeacherClassAssignment` — classes a teacher teaches
- `TimetableEntry` — teacher timetable slots
- `LibrarySession` — library room bookings
- `Resource` — teaching resources with file upload
- `AnswerScript` — answer scripts for evaluation
- `QuestionMarks` — question-wise marks for scripts

### Administration
- `SubjectRequestControl` — toggle for subject enrollment
- `ClassTeacherAssignment` — class teacher assignments
- `TeacherSubjectAllocation` — subject allocation per teacher
- `FacultyAttendance` — teacher attendance tracking
- `Exam` — exam management
- `ExamSchedule` — exam date/time schedule
- `AnswerScriptUpload` — admin/staff answer script uploads (extended with upload_status, batch_id, uploaded_by, verified_by, draft_marks, etc.)
- `StaffProfile` — staff employee profile
- `EvaluationTracking` — evaluation progress tracking
- `PublishedResult` — published exam results
- `Event` — school events
- `ContactSubmission` — contact form submissions
- `AdmissionApplication` — student admission applications
- `AdmissionVerification` — application verification records
- `StudentRegistrationLog` — audit trail for student creation
- `GalleryImage` — gallery management
- `HomepageFeaturedImage` — homepage carousel images
- `AboutPageContent` — about page CMS
- `AdmissionPageContent` — admission page CMS
- `DocumentStorage` — centralized document storage
- `ExportLog` — export activity logging
- `NotificationBroadcast` — bulk notification system
