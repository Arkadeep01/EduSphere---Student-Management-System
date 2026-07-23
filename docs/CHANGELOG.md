# Changelog

## [Unreleased]

### Added — Staff Examination Layer (Completed in prior session; integration gaps fixed in this session)
- New `staff` role in `CustomUser.ROLE_CHOICES` — `IsStaff` permission class mirrors `IsTeacher`/`IsAdmin`
- `StaffProfile` model (OneToOne with User) — employee_id, department, phone
- Extended `AnswerScriptUpload` with upload workflow: `upload_status` (pending_upload→uploaded→verified→rejected→assigned→evaluation_completed→archived), `batch_id`, `uploaded_by`, `uploaded_at` (nullable), `verified_by`, `verified_at`, `verification_notes`, `draft_marks`, `draft_remarks`, `evaluated_at`, `section`, `roll_number`, `registration_number`, `script_number`
- New `staff` Django app at `backend/staff/` with serializers, selectors, services, views, URLs
- 6 staff API endpoints at `/api/staff/`: dashboard, upload-tasks (list/create batch), upload (list pending/upload file), upload-detail (view/replace/delete), history, profile
- 3 admin verification endpoints: `GET /api/admin/exams/staff-batches/`, `POST .../batches/<id>/verify/`, `POST .../batches/<id>/reject/`, `POST .../assign-scripts/`
- Admin `AdminStaffUploadBatchesView` for batch listing with status counts
- Teacher evaluation queue (`get_pending_evaluations`, `get_evaluation_queue`) now queries `AnswerScriptUpload` with `upload_status__in=["verified","assigned"]`
- `save_draft_marks` and `submit_evaluation` services updated to work with extended `AnswerScriptUpload`
- Audit logging for staff actions (batch upload, upload, replace, delete)
- Notifications for staff upload events (batch → admin, verify/reject → staff, assign → teacher)
- Staff export module registered in `ExportService` ("Staff Answer Scripts")
- 6 staff frontend pages: `staff.dashboard.tsx`, `staff.upload-tasks.tsx`, `staff.upload.tsx`, `staff.history.tsx`, `staff.rejected.tsx`, `staff.profile.tsx`
- Staff sidebar navigation in `DashboardLayout.tsx` with role label
- `staffApi` methods in `adminApi.ts` with `STAFF_API_BASE`
- Route tree updated with all staff routes under `/staff` layout

### Database Migrations
- authentication.0006_alter_customuser_role — adds staff role
- administration.0007_answerscriptupload_batch_id_and_more — extends AnswerScriptUpload with 15+ fields, creates StaffProfile

### Fixed (Critical)
- **pending_amount crash**: Removed `payment.pending_amount = ...` in `fee_admin.py:174` — `StudentFeePayment` model has no such field, pending amount is computed dynamically as `total_fee - paid_amount`
- **mockExportMode**: Changed from `true` to `false` in `frontend/src/lib/app-config.ts` — exports now return real data instead of fake/mock data
- **Student results invisible**: `ResultView` now queries `administration.PublishedResult` instead of `student.Result` — published exam results are finally visible to students

### Fixed (High Priority)
- **Missing export endpoints**: Added `/api/admin/exports/fees/`, `/api/admin/exports/receipt/`, `/api/admin/exports/salary/` — fees/receipt exports use real `StudentFeePayment` data, salary returns stub
- **AuditLog export queried wrong model**: `_build_audit_queryset()` now queries `AuditLog` instead of `ExportLog` — audit log exports now return real audit data
- **Audit log viewer frontend**: New `admin.audit-logs.tsx` page with search, action filter, and export — registered in route tree, sidebar, and title map
- **Notification missing recipients**: `specific_students` and `specific_teachers` recipient types now work in `send_broadcast()` — uses `recipient_ids` JSON field
- **Enrollment window enforcement**: Added `start_date`/`end_date` to `SubjectRequestControl` — `SubjectSelectionView` checks both dates before allowing requests
- **Academic session on StudentSubject**: `add_student_subject_selection()` and `admin_assign_subjects()` now populate `academic_session` FK from the current `AcademicSession`
- **Fee auto-generation**: Creating a FeeStructure now auto-generates `StudentFeePayment` records for all students in the class (12 months)
- **Late fee calculation**: `verify_payment()` now computes late fine when payment is past `due_date`, using `late_fine_per_day` from the class FeeStructure
- **Attendance lock**: `toggle_attendance()` now rejects dates older than 7 days — prevents retroactive attendance editing
- **Teacher multi-subject support**: Updated `TeacherSubjectChaptersView`, `TeacherAssignmentListView`, `TeacherAssignmentDetailView`, `TeacherClassProgressView`, and `get_teacher_dashboard_data()` to accept `subject_id` param — teachers with multiple `TeacherSubjectAllocation` entries can now access all subjects
- **Fee receipt endpoint**: Added `GET /api/admin/fees/receipt/<payment_id>/` — returns HTML receipt for any payment record

### Database Migrations
- administration.0006_subjectrequestcontrol_end_date_and_more — adds `start_date`, `end_date` to SubjectRequestControl

### Added
- Admin Subject Management page (`admin.subjects.tsx`): Full CRUD for subjects with tier/color/teacher fields, search, tier filter, delete confirmation
- Admin Notification Broadcast page (`admin.notifications.tsx`): Full compose/send UI for bulk notifications to students/teachers/classes
- notificationBroadcastApi and subjectAdminApi in adminApi.ts
- Letterhead backend: model, serializer, views, URL endpoints, admin registration, migration 0005
- Audit Log System: model, middleware (auto-logs admin CRUD), API endpoint at GET /api/admin/audit-logs/
- Teacher Assignment CRUD: backend views + URLs for creating, listing, updating, deleting assignments; submissions view + marks view
- Fee System (full stack): FeeStructure, FeeComponent, StudentFeePayment, StudentScholarship, FinanceActivityLog models; 14 API endpoints for structures, payments, scholarships, analytics, activity log, student ledger
- Chapter/Topic tracking for teacher subjects: Chapter, Topic, ClassChapterProgress models; full CRUD endpoints; frontend syllabus management
- Student exam schedule viewing: new endpoint filtering admin exams by student's class
- Teacher exam schedule viewing: new endpoint filtering admin exams by teacher's assigned classes
- Letterhead model + API (CRUD) for document branding
- Frontend adminApi methods for fees, documents, letterheads
- Frontend studentApi methods for exams, chapters
- Frontend teacherApi methods for chapters, class progress, exams

### Changed
- **Admin sidebar**: Added "Subjects" and "Notifications" nav links
- **Admin subjects page** (`admin.subjects.tsx`): New page — list, search, filter by tier, create/edit dialog with color picker, delete confirmation
- **Admin notifications page** (`admin.notifications.tsx`): New page — broadcast list (drafts/sent), create dialog, send action
- **Admin exams page** (`admin.exams.tsx`): Rewritten from mock to real `examAdminApi` — exams list, create dialog, upload scripts dialog, evaluation tracking
- **Admin documents page** (`admin.documents.tsx`): Rewritten from mock `admin-document-store` to real `documentApi` — list, upload, delete, preview
- **Admin fees page** (`admin.fees.tsx`): Rewritten from mock `fee-store` to real `feeApi` — structures CRUD, payments list/verify/reject/refund, scholarships, analytics, activity log
- **Student fees page** (`student.fees.tsx`): Rewritten from mock `fee-store` to real `feeApi` — ledger view, offline payment submission
- **Student exams page** (`student.exams.tsx`): Rewritten from mock data to real `studentExamApi`
- **Student subjects page** (`student.subjects.tsx`): Rewritten — removed mock syllabus/resources, uses real `studentChapterApi`
- **Student assignments page** (`student.assignments.tsx`): Rewritten — removed mock fallbacks, uses real API exclusively
- **Teacher subjects page** (`teacher.subjects.tsx`): Rewritten from mock data to real `teacherChapterApi` — chapter/topic CRUD with progress tracking
- **Teacher exams page** (`teacher.exams.tsx`): Rewritten from mock to real `teacherExamApi` — exam list with evaluation navigation
- **Teacher evaluation page** (`teacher.exams.evaluate.*.tsx`): Rewritten from mock script-store to real evaluation API — draft save, final submit
- **Teacher classes page** (`teacher.classes.tsx`): Rewritten — removed mock timetable/library/students data, uses real APIs for classes, timetable, library bookings, evaluation queue

### Fixed (Integration Gaps — Staff Layer)

### Added — Answer Script Processing Layer (V1.5)

### Added — Result Generation Engine (V1.5)
- New `GradeBoundary` model — configurable grade boundaries with percentage ranges, grade points, pass/fail flag, and remarks
- New `ResultPublication` model — manages result workflow (Draft → Review → Approved → Published) with full audit trail (who did what and when)
- New `StudentResult` model — comprehensive per-student exam result linked to `PublishedResult` and `AnswerScriptUpload` data; stores percentage, grade, grade_point, pass/fail, merit_rank, class_rank, subject counts, lock status
- `administration/migrations/0009` — creates all 3 models
- Automatic grade/GPA/percentage calculation from evaluated scripts and published results
- Pass/Fail determination and remark generation from grade boundaries
- Merit rank (global ranking by percentage)
- Class rank (ranking within each `class_assigned` group)
- Subject rank (ranking per subject with student position)
- Bulk result generation — computes results for all students with evaluated scripts in an exam
- Publication workflow: Draft → Review → Approved → Published with validation guards
- Lock after publication — prevents modification once published
- Bulk publish to `PublishedResult` model with grade assignment
- PDF generation using `reportlab` with full letterhead integration (school name, logo, banner, colors, footer, signature, seal):
  - Student Report Card — per-student PDF with subject-wise marks, percentages, grades, GPAs, ranks
  - Mark Sheet — landscape PDF with all students in rows for an exam
  - Academic Transcript — per-student PDF across all sessions/exams
  - Printable Result — simplified report card for printing
- 14 new API endpoints at `/api/admin/results/`:
  - `GET|PUT grade-boundaries/` — list/update grade boundaries
  - `POST publications/` — create publication for an exam
  - `GET publications/list/` — list with filters
  - `GET publications/<id>/` — detail
  - `POST publications/<id>/generate/` — generate all results
  - `GET publications/<id>/results/` — list student results
  - `POST publications/<id>/transition/` — workflow transition
  - `POST publications/<id>/bulk-publish/` — publish to PublishedResult
  - `POST publications/<id>/compute-ranks/` — compute merit + class ranks
  - `GET publications/<id>/subject-ranks/` — compute/get subject ranks
  - `GET pdf/report-card/<student_result_id>/` — download report card PDF
  - `GET pdf/marksheet/<pub_id>/` — download marksheet PDF
  - `GET pdf/transcript/<student_result_id>/` — download transcript PDF
  - `GET pdf/printable/<student_result_id>/` — download printable result PDF
- Service layer (`administration/services/result_engine.py`): grade computation, percentage/GPA calculation, result generation, workflow transitions, ranking, bulk publish, and 4 render functions for PDF data
- PDF engine (`administration/services/pdf_engine.py`): reportlab-based PDF generation with letterhead branding, styled tables, headers, footers
- Audit logging for all result operations (grade boundary updates, result generation, workflow transitions)
- Notification broadcasting on publish
- Reuses existing `PublishedResult` model — no redesign of existing data
- All checks verified: `python manage.py check` passes, migration applied
- New `ScriptProcessing` model at `administration/models/processing.py` — tracks per-script OCR status (pending/processing/completed/failed), processing status (pending/extracting/indexing/matching/validating/completed/failed), verification status (pending/passed/failed/flagged), and extraction metadata (JSON)
- New `ScriptBatchProcessing` model — batch-level aggregation with passed/failed/flagged counts and processing log
- `ScriptProcessing` fields: total_pages, expected_pages, missing_pages, duplicate_pages, matched_student (FK), match_confidence, match_status, detected_roll_number, roll_verified, roll_mismatch_reason, is_duplicate, duplicate_of (self FK), duplicate_confidence
- `administration/migrations/0008` — creates both models
- 19 new API endpoints at `/api/staff/processing/` and `/api/staff/batch-processing/`:
  - `POST init/<script_id>/` — initialize processing record
  - `GET <script_id>/` — detail view
  - `POST <script_id>/page-count/` — count pages
  - `POST <script_id>/expected-pages/` — set expected pages (triggers missing page detection)
  - `POST <script_id>/metadata/` — extract/update metadata
  - `POST <script_id>/match-student/` — match student (auto by roll/reg, or explicit)
  - `POST <script_id>/verify-roll/` — verify detected roll against expected
  - `POST <script_id>/duplicate-pages/` — mark duplicate pages + check duplicate script
  - `POST <script_id>/finalize/` — finalize (passes if all checks pass, else flags)
  - `POST <script_id>/flag/` — manual flag
  - `POST <script_id>/fail/` — manual fail
  - `POST <script_id>/pipeline/` — run full pipeline (missing pages → match → roll verify → duplicate check → finalize)
  - `GET list/` — list with filters (exam, subject, batch, status)
  - `GET stats/` — aggregation stats
  - `POST batch-processing/init/` — init batch processing (links all scripts for batch_id)
  - `GET batch-processing/<batch_id>/` — batch detail with script list
  - `POST batch-processing/<batch_id>/finalize/` — finalize batch verification + notification
  - `GET batch-processing/list/` — list batches with filters
- Processing service layer (`staff/processing_services.py`): 18 service functions covering init, page counting, metadata extraction, student matching, roll verification, duplicate detection, missing page detection, pipeline orchestration, batch verification
- Processing selector layer (`staff/processing_selectors.py`): 5 query functions with filters
- Processing serializer layer (`staff/processing_serializers.py`): 10 serializers (model + action)
- OCR-ready: status fields and metadata store prepared for future OCR integration — no AI evaluation implemented per spec
- Audit logging and notifications for all processing state transitions
- All checks verified: `python manage.py check` passes, migration applied
- **AuthContext User.role type** — added `"staff"` to union type; `getRoleRedirect()` now returns `"/staff/dashboard"` for staff; `useRequireRole()` param type changed to `User["role"]`
- **Login page** — added "Staff" role selector with `FileText` icon; added `"/staff/dashboard"` to `redirectMap`
- **Admin AnswerScriptUploadView** — now calls `upload_answer_script(data, request.user)`, generates `batch_id`, sets `upload_status="uploaded"`, creates `AuditLog` entry — integrates with staff workflow while keeping backward-compatible endpoint
- **AuditLog action codes** — `create_upload_batch`, `upload_answer_script`, `replace_uploaded_file`, `delete_upload` in `staff/services.py` now use values from `AuditLog.ACTION_CHOICES` (`"upload"`, `"update"`, `"delete"`) instead of custom strings; `AdminVerifyBatchView`, `AdminRejectBatchView`, `AdminAssignScriptsView` similarly fixed
- **AuditLog field mismatch** — `staff/services.py` used `performed_by`/`details` instead of `user`/`description` across all 4 service functions; `exam_admin.py` views had same issue — all fixed
- **NotificationBroadcast recipient_type** — `staff/services.py` used `recipient_type="specific_teachers"` without `recipient_ids`; changed to `"all_teachers"` (existing `RECIPIENT_CHOICES` entry); admin batch views fixed similarly

### Fixed
- PostgreSQL database migration path (48 -> 49 migrations)
- All mock data stores bypassed on authenticated pages
- `student.results.tsx` parsing error — moved `import` statement before non-import code
- Unused imports cleaned in 5 route files (student.dashboard, teacher.subjects, admin.settings, student.assignments, admin.attendance)
- Deleted 8 dead store files (fee-store, assignment-store, admin-document-store, script-store, syllabus-store, payment-provider, error-capture, error-page)

### Security
- Audit middleware logs all POST/PATCH/PUT/DELETE on /api/admin/ endpoints with user, IP, timestamp

### Database Migrations
- administration.0003_auditlog — AuditLog model
- administration.0004_fee — Fee models (FeeStructure, FeeComponent, StudentFeePayment, StudentScholarship, FinanceActivityLog)
- administration.0005_letterhead — Letterhead model
- teacher.0004_chapter_topic_classchapterprogress — Chapter, Topic, ClassChapterProgress models
