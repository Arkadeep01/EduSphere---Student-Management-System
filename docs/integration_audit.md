# EduSphere Integration Audit

> Generated: 2026-06-14
> Scope: Student & Teacher Modules (Frontend ↔ Backend)

---

## Features Audited

| # | Feature | Frontend Pages | Backend App | Status |
|---|---------|---------------|-------------|--------|
| 1 | Authentication | login, register, auth callback, __root, DashboardLayout | authentication | ❌ Mismatches |
| 2 | Student Dashboard | student.dashboard | student | ⚠️ Partial |
| 3 | Student Subjects | student.subjects | student | ❌ Mismatches |
| 4 | Student Assignments | student.assignments | student | ❌ Mismatches |
| 5 | Student Attendance | student.attendance | student | ⚠️ Partial |
| 6 | Student Results | student.results | student | ❌ Mismatches |
| 7 | Student Fees | student.fees | student | ❌ Missing |
| 8 | Student Timetable | student.timetable | student | ⚠️ Partial |
| 9 | Student Notifications | student.notifications | student | ⚠️ Partial |
| 10 | Student Profile | student.profile → ProfileView | student | ❌ Mismatches |
| 11 | Teacher Dashboard | teacher.dashboard | teacher | ⚠️ Partial |
| 12 | Teacher Classes | teacher.classes | teacher | ⚠️ Partial |
| 13 | Teacher Subjects | teacher.subjects | teacher | ⚠️ Partial |
| 14 | Teacher Assignments | teacher.assignments | teacher | ❌ Mismatches |
| 15 | Teacher Attendance | teacher.attendance | teacher | ⚠️ Partial |
| 16 | Teacher Exams | teacher.exams | teacher | ⚠️ Partial |
| 17 | Teacher Timetable | teacher.timetable | teacher | ⚠️ Partial |
| 18 | Teacher Resources | teacher.resources | teacher | ⚠️ Partial |
| 19 | Teacher Profile | teacher.profile → ProfileView | teacher | ❌ Mismatches |
| 20 | Admin | admin.* | student/teacher | ❌ No admin endpoints |

---

## Frontend Components Audited

### Student Pages (11)
- `student.dashboard.tsx` — StatCards, charts, subject progress, today's classes, rankings
- `student.subjects.tsx` — Category tabs, subject cards, detail panel, request workflow
- `student.assignments.tsx` — Active/History tabs, detail view, upload modal, evaluation
- `student.attendance.tsx` — StatCards, calendar grid, monthly trend chart
- `student.exams.tsx` — Countdown, exam cards, past/upcoming badges
- `student.results.tsx` — Marks table, radar chart, rankings, comparison grid
- `student.fees.tsx` — StatCards, payment history table
- `student.timetable.tsx` — Weekly grid (80px time col, 5 day cols)
- `student.notifications.tsx` — Category cards with unread badges
- `student.profile.tsx` → `ProfileView.tsx` — 6 tabs (personal, academic, parents, documents, notifications, security)
- `student.tsx` — Layout shell → `DashboardLayout`

### Teacher Pages (9)
- `teacher.dashboard.tsx` — StatCards, syllabus progress, today's schedule, assignments
- `teacher.classes.tsx` — Class overview, weekly schedule, library booking
- `teacher.subjects.tsx` — Metric cards, chapters, classes, resources, evaluations tabs
- `teacher.assignments.tsx` — List/create/grading views with class filter
- `teacher.attendance.tsx` — Class selector, date picker, present/absent toggles
- `teacher.exams.tsx` — Exam list, evaluation queue, completed, draft/final marking
- `teacher.timetable.tsx` — Weekly grid (5 days x 5 slots)
- `teacher.resources.tsx` — Search/filter grid with type tabs
- `teacher.profile.tsx` → `ProfileView.tsx`

### Shared Components
- `DashboardLayout.tsx` — Sidebar + header + outlet (3 roles)
- `ProfileView.tsx` — 6 tabs shared between student/teacher
- `StatCard.tsx` — Metric card with icon and accent color
- `animations.tsx` — PageWrapper, StaggerContainer, StaggerItem, HoverLift, HoverScale

### Mock Data (`lib/mock-data.ts`)
- 28+ exports covering all features
- Nested structures: `studentProfileData.personal.fullName`, `subjectSelection.specialized[].status`

---

## Backend Components Audited

### Models (17 total)
| App | Model | Fields |
|-----|-------|--------|
| authentication | `CustomUser` | id, email, username, first_name, last_name, mobile, role, profile_image, is_active, is_staff, is_superuser, date_joined |
| authentication | `OTP` | user, email, otp_code, expires_at, is_verified, created_at |
| student | `Subject` | id, name, code, tier |
| student | `StudentProfile` | id, user, roll_number, admission_number, father_name, mother_name, profile_photo, date_of_birth, class_assigned, section, address |
| student | `StudentSubject` | id, student, subject, status, assigned_by_admin, created_at, updated_at |
| student | `AdmissionDocument` | id, student, document, description, uploaded_at |
| student | `Assignment` | id, title, description, subject, target_class, due_date, created_by, created_at, updated_at |
| student | `AssignmentSubmission` | id, assignment, student, file, status, grade, remarks, submitted_at, evaluated_at |
| student | `Attendance` | id, student, date, status, marked_by, class_assigned, created_at |
| student | `Result` | id, student, subject, exam_name, marks_obtained, total_marks, grade, created_at |
| student | `Timetable` | id, student, day_of_week, start_time, end_time, subject, room, is_library_session |
| student | `Notification` | id, user, title, message, is_read, notification_type, created_at |
| teacher | `TeacherProfile` | id, user, employee_id, assigned_subject, qualification, experience, profile_photo |
| teacher | `TeacherClassAssignment` | id, teacher, class_name |
| teacher | `TimetableEntry` | id, teacher, day_of_week, start_time, end_time, class_name, session_type, room, is_library_converted |
| teacher | `LibrarySession` | id, room, date, start_time, end_time, booked_by, created_at |
| teacher | `Resource` | id, teacher, title, file, resource_type, target_class, uploaded_at |
| teacher | `AnswerScript` | id, student, teacher, subject, exam_name, script_file, marks_obtained, total_marks, remarks, evaluation_status, draft_marks, draft_remarks, uploaded_at, evaluated_at |

### Serializers (19 total)
- authentication: 6 serializers (CustomTokenObtainPair, PasswordResetRequest, PasswordResetConfirm, ChangePassword, Register, User)
- student: 9 serializers (Subject, StudentProfile, StudentSubject, AdmissionDocument, Assignment, AssignmentSubmission, Attendance, Result, Timetable, Notification)
- teacher: 6 serializers (TeacherProfile, TeacherClassAssignment, TimetableEntry, LibrarySession, Resource, AnswerScript)

### API Endpoints (30+)
- Auth: 12 endpoints under `/api/`
- Student: 12 endpoints under `/api/student/`
- Teacher: 13 endpoints under `/api/teacher/`

---

## API Contracts Verified

### Authentication

#### POST /api/login/
```
Request:  { email: string, password: string, portal: "student"|"teacher"|"admin" }
Response: { access: string, refresh: string, user: { id, email, first_name, last_name, role, is_active, is_staff, is_superuser, date_joined } }
Frontend: AuthContext.login() — sends { email, password, portal } with credentials: "include"
```

#### POST /api/register/
```
Request:  { email, password, password2, username, mobile, first_name, last_name, role }
Response: { id, email, username, first_name, last_name, role, is_active: false }
Frontend: AuthContext.register() — sends subset, falls back to mock on error
```

#### GET /api/me/
```
Response: { authenticated: boolean, user?: { id, email, first_name, last_name, role, ... } }
Frontend: AuthContext.refreshSession()
```

### Student Endpoints

#### GET /api/student/dashboard/
```
Response: { subjects: [...], total_subjects: N, pending_assignments: N }
Frontend: student.dashboard.tsx — expects full data with results, timetable, rankings, etc.
⚠️ MISMATCH: Frontend dashboard expects 10+ data points; backend returns only 3 fields
```

#### GET /api/student/subjects/
```
Response: SubjectSerializer[] = [{ id, name, code, tier }]
Frontend: student.subjects.tsx — expects { id, name, code, teacher, progress, category, color, description }
⚠️ MISMATCH: Missing teacher, progress, color, description; category vs tier field name
```

#### GET /api/student/subjects/my/
```
Response: { assigned: [...], pending: [...] }
Frontend: student.subjects.tsx uses subjectSelection mock — expects status: "selected"|"request_pending"|"not_selected"
⚠️ MISMATCH: Backend status values: "approved"|"pending"|"rejected"; frontend: "selected"|"request_pending"|"not_selected"
```

#### POST /api/student/subjects/select/
```
Request:  { subject_ids: [...] }  (batch)
Frontend: Per-subject request button (individual, not batch)
⚠️ MISMATCH: Frontend UI is per-subject; backend expects batch array of IDs
```

#### GET /api/student/profile/
```
Response: StudentProfileSerializer
Frontend: ProfileView expects nested { personal: { fullName, ... }, academic: { rollNumber, ... }, parents: { fatherName, ... } }
⚠️ MISMATCH: Backend returns flat object; frontend expects nested groups
```

#### GET /api/student/results/
```
Response: [{ id, student, subject, subject_name, exam_name, marks_obtained, total_marks, grade }]
Frontend: expects [{ subject, marks, total, grade }]
⚠️ MISMATCH: marks_obtained vs marks, total_marks vs total, no exam_name in frontend usage
```

#### GET /api/student/assignments/
```
Response: [{ id, title, description, subject, subject_name, target_class, due_date, created_by, created_at }]
Frontend: expects [{ id, title, subject, due, status, submissions, total }]
⚠️ MISMATCH: status field, due_date vs due, no submissions/total in backend
```

#### GET /api/student/attendance/
```
Response: Query params start_date/end_date → { records: [...], summary: { present, absent, total, percentage } }
Frontend: Computes attendance from mock data inline; expects monthlyAttendance structure
⚠️ Partial match - backend summary aligns with frontend stat cards
```

#### GET /api/student/timetable/
```
Response: [{ id, student, day_of_week, start_time, end_time, subject, subject_name, room, is_library_session }]
Frontend: expects [{ day, slots: [time, subject, teacher, room][] }]
⚠️ MISMATCH: Different data structure (flat entries vs day-grouped slots)
```

#### GET /api/student/notifications/
```
GET:  query param unread_only → [{ id, title, message, is_read, notification_type, created_at }]
POST: { notification_id: N } → marks as read
Frontend: expects notificationCategories with nested items, icons, categories
⚠️ Partial match - core fields exist, but frontend groups by category/icon
```

### Teacher Endpoints

#### GET /api/teacher/dashboard/
```
Response: { total_students, pending_evaluations, assigned_subject, total_classes }
Frontend: Expects teacherSubjectData with chapters, timetable, assignments, announcements
⚠️ MISMATCH: Frontend dashboard requires 6+ data groups; backend returns 4
```

#### GET /api/teacher/classes/
```
Response: [{ id, teacher, class_name }]
Frontend: Expects class overview with student counts, timetable, library slots
⚠️ MISMATCH: Backend returns minimal class list; frontend needs nested data
```

#### POST /api/teacher/attendance/mark/
```
Request:  { records: [{ student: id, date: "...", status: "..." }] }
Frontend: Per-student present/absent toggle, then saves
⚠️ Partial match - frontend could batch but currently shows per-row
```

---

## Schema Mismatches Found

### 🔴 Critical Mismatches

| # | Area | Frontend | Backend | Impact |
|---|------|----------|---------|--------|
| 1 | **Subject Tier** | `category: "enrichment"` | `tier: "enriched"` | Data won't match |
| 2 | **Subject Fields** | `teacher, progress, color, description, category` | Only `name, code, tier` | Missing 5 fields |
| 3 | **SubjectSelection Status** | `"selected"`, `"request_pending"`, `"not_selected"` | `"approved"`, `"pending"`, `"rejected"` | Complete mismatch |
| 4 | **Profile Structure** | Nested `{ personal, academic, parents }` | Flat `{ email, roll_number, father_name, ... }` | Refactor needed |
| 5 | **Profile Field Names** | camelCase: `fullName`, `dateOfBirth`, `rollNumber`, `fatherName` | snake_case: `first_name`, `date_of_birth`, `roll_number`, `father_name` | Every field mismatched |
| 6 | **Result Fields** | `{ subject, marks, total, grade }` | `{ marks_obtained, total_marks, exam_name, subject_name }` | Field names differ |
| 7 | **Assignment Status** | `"pending"`, `"graded"` (student); `"active"`, `"closed"` (teacher) | `"pending"`, `"submitted"`, `"evaluated"`, `"late"` (submission); No status on Assignment model | No overlap |
| 8 | **Dashboard Data Shape** | 10+ data groups (results, timetable, rankings, etc.) | 3-4 fields returned | Cannot populate dashboard |
| 9 | **Timetable Structure** | Day-grouped slots `{ day, slots: [] }` | Flat entries `{ day_of_week, start_time, end_time }` | Structure mismatch |
| 10 | **Fees** | Full mock data, StatCards, payment table | **No backend model exists** | Entire feature missing |
| 11 | **Admin Endpoints** | 13 admin routes exist | **No admin API views** | Orphaned frontend |

### 🟡 Moderate Mismatches

| # | Area | Frontend | Backend | Impact |
|---|------|----------|---------|--------|
| 12 | **SubjectSelection Flow** | Per-subject request button | Batch `{ subject_ids: [...] }` | UX vs API mismatch |
| 13 | **Notification Shape** | Grouped by category with icons | Flat list with `notification_type` | Grouping needed |
| 14 | **StudentProfile Phone** | `phone` field | `mobile` field | Field name |
| 15 | **StudentProfile Gender** | `gender` field | **No gender field** | Missing |
| 16 | **StudentProfile BloodGroup** | `bloodGroup` field | **No blood group field** | Missing |
| 17 | **StudentProfile Username** | `username` in personal section | `username` in User model (nullable) | Accessible via user |
| 18 | **Assignment Due** | `due: string` | `due_date: DateTimeField` | Format mismatch |
| 19 | **Assignment Submissions/Totals** | `submissions: number, total: number` on assignment | **Not on Assignment model** - computed from submissions | Missing computed fields |
| 20 | **AnswerScript Upload** | Admin should upload per rules | **No admin upload endpoint** | Workflow incomplete |
| 21 | **Resource Types** | `"note"`, `"video"`, `"document"` | `"note"`, `"video"`, `"document"`, `"reference"` | Missing type |

### 🟢 Minor Mismatches

| # | Area | Frontend | Backend | Impact |
|---|------|----------|---------|--------|
| 22 | **Attendance Status** | Present/Absent only | + `"late"` | Minor |
| 23 | **Timetable Teacher** | `teacher: string` | No teacher field (student timetable is per-student) | Minor |
| 24 | **Timetable Slots** | 4 slots (08:00, 09:00, 10:00, 11:30) | Any time range | Flexible |
| 25 | **Exam Name Format** | `"Midterm — Mathematics"` | `exam_name: CharField` | Flexible |

---

## Schema Mismatches Fixed (This Audit)

| # | Mismatch | Fix Applied |
|---|----------|-------------|
| — | None | This is an audit pass only; no fixes applied yet. |

---

## Remaining Integration Risks

### Risk 1: Entire Student Dashboard Cannot Be Wired
The frontend dashboard expects 10+ data groups (results, timetable, attendance, rankings, subject progress, announcements, holidays, submission history, etc.). The backend `/api/student/dashboard/` endpoint returns only `{ subjects, total_subjects, pending_assignments }`. A new composite serializer/view is needed.

### Risk 2: Subject Module Has the Most Mismatches
- Status values differ entirely
- Field names differ
- Missing fields (teacher, progress, color, description)
- Per-subject request vs batch submission

**Recommendation:** Align backend to frontend. Add `teacher`, `progress`, `description` to the Subject model or a related model. Change frontend `"enrichment"` to `"enriched"` to match backend.

### Risk 3: Profile Data Structure Is Fundamentally Different
Backend returns flat snake_case fields. Frontend expects nested camelCase groups (`personal`, `academic`, `parents`). A serializer adapter is needed.

### Risk 4: Fees Feature Has No Backend
The entire fees module exists only in frontend with no backend model, serializer, or endpoint. Must be built from scratch.

### Risk 5: Admin Module Has No Backend
13 admin frontend routes exist but zero admin backend endpoints. The permission class `IsAdmin` exists but no views use it.

### Risk 6: No API Service Layer in Frontend
All pages use mock data. No Axios/fetch wrappers exist. No interceptors, no error handling, no request transforms. Every page will need to add API calls.

### Risk 7: Dual Auth System
Session auth (login_api) + JWT (token_obtain_pair) both exist. Frontend uses `credentials: "include"` for session auth but dashboard pages have no auth gating. This creates confusion about which auth path to use.

### Risk 8: Student Timetable vs Teacher Timetable
Two separate timetable models exist (student `Timetable`, teacher `TimetableEntry`). Student timetable is per-student (duplicated), teacher timetable is per-teacher per-class. These need to be reconciled.

---

## Recommendations by Priority

### P0 — Must Fix Before Integration
1. Create adapter serializer mapping backend fields to frontend expectations
2. Align Subject tier values (`enrichment` → `enriched`)
3. Add missing Subject fields or a related serializer that provides `teacher`, `description`, `progress`
4. Reconcile subject selection status values
5. Create Fees backend model and endpoints
6. Create Admin backend endpoints

### P1 — Should Fix
7. Build composite dashboard endpoint or multiple parallel queries
8. Restructure profile serializers to match frontend nested structure
9. Align result field names (`marks_obtained` → `marks`, `total_marks` → `total`)
10. Add `submissions`/`total` computed fields to Assignment serializer
11. Add gender and blood group to StudentProfile model
12. Fix timetable structure or add a frontend adapter

### P2 — Nice to Have
13. Add `"late"` handling to frontend attendance
14. Add `"reference"` resource type to frontend
15. Add admin upload endpoint for answer scripts
16. Build frontend API service layer with Axios

---

## Verification Checklist

| ✅ | Check |
|---|-------|
| ❌ | Frontend and Backend Field Names Match |
| ❌ | Frontend and Backend Status Values Match |
| ❌ | Frontend and Backend Validation Rules Match |
| ❌ | Upload Workflows Match |
| ❌ | Authentication Workflows Match (partial) |
| ❌ | API Contracts Match |
| ❌ | Mock Data Matches Future API Shape |
| ❌ | No Broken Integrations |
| ❌ | No Orphaned Frontend Components |
| ❌ | No Unused Backend Endpoints |

**Integration Readiness: ⚠️ NOT READY** — 10+ critical mismatches must be resolved before any API wiring can begin.

---

## Appendix: Frontend Mock Data → Backend Response Mapping

### Subject
```typescript
// Frontend (mock-data.ts subjects[])
{ id, name, code, teacher, progress, category, color, description }

// Backend (SubjectSerializer)
{ id, name, code, tier }
```

### Subject Selection
```typescript
// Frontend (subjectSelection)
{ id, name, code, teacher, progress, category, color, description, status: "selected"|"request_pending"|"not_selected" }

// Backend (StudentSubjectSerializer)
{ id, subject, subject_name, subject_code, tier, status: "approved"|"pending"|"rejected", assigned_by_admin }
```

### Student Profile
```typescript
// Frontend (studentProfileData)
{ personal: { fullName, username, email, phone, dateOfBirth, gender, bloodGroup, address },
  academic: { rollNumber, admissionNumber, class, section, academicYear, previousSchool },
  parents: { fatherName, fatherOccupation, fatherPhone, motherName, motherOccupation, motherPhone,
             guardianName, guardianRelation, guardianPhone } }

// Backend (StudentProfileSerializer)
{ id, email, username, first_name, last_name, roll_number, admission_number, father_name, mother_name,
  profile_photo, date_of_birth, class_assigned, section, address }
```

### Result
```typescript
// Frontend (results[])
{ subject: string, marks: number, total: number, grade: string }

// Backend (ResultSerializer)
{ id, student, subject, subject_name, exam_name, marks_obtained, total_marks, grade }
```

### Assignment (Student View)
```typescript
// Frontend (assignments[])
{ id, title, subject, due, status: "pending"|"graded", submissions, total }

// Backend (AssignmentSerializer)
{ id, title, description, subject, subject_name, target_class, due_date, created_by, created_at }
// Also AssignmentSubmission: { id, assignment, student, file, status: "pending"|"submitted"|"evaluated"|"late", grade, remarks }
```

### Notification
```typescript
// Frontend (notificationCategories[])
{ category: string, icon: string,
  items: { id, title, message, time, unread }[] }

// Backend (NotificationSerializer)
{ id, title, message, is_read, notification_type, created_at }
```

### Attendance Summary
```typescript
// Frontend (monthlyAttendance[])
{ month, present, absent, late, total, percentage }

// Backend (Attendance selector summary)
{ present, absent, total, percentage }
```
