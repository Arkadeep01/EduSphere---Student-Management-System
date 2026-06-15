# EduSphere — Complete Project Gap Analysis

> **Date:** 2026-06-15  
> **Scope:** Backend (Django + DRF), Frontend (React + TanStack Router), Auth, All Portals  
> **Methodology:** Source code audit of all backend apps, frontend routes, mock data, configuration files.

---

## Classification Legend

| Icon | Meaning |
|------|---------|
| ✅ **COMPLETE** | All core functionality implemented and working |
| ⚠️ **PARTIALLY COMPLETE** | Implementation exists but has gaps, bugs, or missing pieces |
| ❌ **NOT IMPLEMENTED** | No implementation exists |

---

## 1. AUTHENTICATION MODULE — `backend/authentication/`

| Feature | Status | Details |
|---------|--------|---------|
| Custom User Model (email-based) | ✅ COMPLETE | `CustomUser` with email as USERNAME_FIELD, role field, profile_image |
| Custom User Manager | ✅ COMPLETE | `create_user`, `create_superuser` |
| JWT Login with Portal Validation | ✅ COMPLETE | `CustomTokenObtainPairSerializer` validates email/password/portal match |
| Registration with Validation | ✅ COMPLETE | Password validation, duplicate check, role enforcement, creates inactive user |
| OTP Generation & Verification | ✅ COMPLETE | 6-digit OTP, 10-min expiry, email delivery (console backend), activates user |
| Password Reset (OTP-based) | ✅ COMPLETE | Request OTP, verify OTP, set new password |
| Change Password | ✅ COMPLETE | Authenticated user changes password |
| Session Management | ✅ COMPLETE | Login sets Django session + JWT; logout clears session |
| CSRF Protection | ✅ COMPLETE | CSRF cookie endpoint |
| Social Auth (Google, GitHub) | ✅ COMPLETE | django-allauth configured with both providers |
| Token Refresh | ✅ COMPLETE | Standard JWT refresh |
| `/api/test/` health check | ✅ COMPLETE | Returns connected status |
| Frontend Auth (login/register/logout) | ✅ COMPLETE | AuthContext with mock fallback credentials for offline dev |
| Role-based redirect | ✅ COMPLETE | `getRoleRedirect()` maps role to dashboard path |
| OAuth callback handling | ✅ COMPLETE | `/auth/callback` route reads session |

**Summary:** Authentication is fully implemented on both backend and frontend. The only note is that the `AuthContext` on the frontend has mock credentials hardcoded as a fallback — the real API path also works.

---

## 2. STUDENT MODULE — Backend + Frontend

### 2.1 Backend — `backend/student/`

#### Models

| Model | Status | Details |
|-------|--------|---------|
| `StudentProfile` | ✅ COMPLETE | All fields present (roll_number, admission_number, father/mother_name, class_assigned, section, DOB, gender, blood_group, address, profile_photo) |
| `Subject` | ✅ COMPLETE | 3 tiers (core/specialized/enrichment), code, teacher_name, color, progress |
| `StudentSubject` | ✅ COMPLETE | Status workflow (pending → approved/rejected), assigned_by_admin flag, unique_together on (student, subject) |
| `AdmissionDocument` | ✅ COMPLETE | File upload with description |
| `Assignment` | ✅ COMPLETE | Title, description, subject, target_class, due_date, created_by |
| `AssignmentSubmission` | ✅ COMPLETE | Status workflow (pending→submitted→evaluated→late), file, grade, remarks |
| `Attendance` | ✅ COMPLETE | Status (present/absent/late), unique_together on (student, date) |
| `Result` | ✅ COMPLETE | marks_obtained, total_marks, grade |
| `Timetable` | ✅ COMPLETE | day_of_week, start/end_time, subject, room, is_library_session |
| `Notification` | ✅ COMPLETE | notification_type choices (timetable/fee/exam/assignment/general) |

#### Views, Serializers, Services, Selectors

| Component | Status | Details |
|-----------|--------|---------|
| Serializers | ✅ COMPLETE | All 10 serializers working |
| Views | ✅ COMPLETE | All 11 views (Dashboard, Profile, Subjects, MySubjects, SubjectSelection, Assignments, Submissions, Attendance, Results, Timetable, Notifications, Resources) |
| Services | ⚠️ PARTIAL | `create_student_profile` ✅, `assign_core_subjects` ✅, `validate_elective_counts` ✅, `add_student_subject_selection` ✅, **`approve_student_subjects`** ❌ never called from any view, **`admin_assign_subjects`** ❌ never called from any view, **`create_assignment`** ❌ exists but never called |
| Selectors | ✅ COMPLETE | All 10 selector functions present and used |
| Permissions | ✅ COMPLETE | IsStudent, IsTeacher, IsAdmin all defined in `student/permissions.py` |
| URLs | ✅ COMPLETE | All 11 student endpoints registered |
| **Signal Handlers** | ❌ NOT IMPLEMENTED | `assign_core_subjects` exists in services but is **never connected** to any signal (e.g., post_save on StudentProfile). Core subjects are never auto-assigned. |
| **StudentProfile Auto-Creation** | ❌ NOT IMPLEMENTED | When a user registers with role='student', no signal creates a StudentProfile. The user table has a student row but the student app cannot serve it — all views return 404. |

### 2.2 Frontend — Student Portal Routes

| Route | Status | Details |
|-------|--------|---------|
| `/student/dashboard` | ✅ COMPLETE | Stats, charts, assignments/attendance overview |
| `/student/assignments` | ✅ COMPLETE | View/submit assignments |
| `/student/attendance` | ✅ COMPLETE | Daily calendar + monthly bar chart |
| `/student/exams` | ✅ COMPLETE | Exam schedule with countdown |
| `/student/fees` | ✅ COMPLETE | Fee status & pay/receipt |
| `/student/results` | ✅ COMPLETE | Subject marks, rankings, radar comparison |
| `/student/subjects` | ✅ COMPLETE | Core/specialized/enriched with request workflow |
| `/student/timetable` | ✅ COMPLETE | Weekly timetable grid |
| `/student/notifications` | ✅ COMPLETE | Categorized notifications |
| `/student/profile` | ✅ COMPLETE | ProfileView component |

**Student Portal Frontend Summary:** All routes functional, all use mock data. **No real API integration** — subjects, assignments, attendance, results, timetable, notifications all read from `mock-data.ts`.

---

## 3. TEACHER MODULE — Backend + Frontend

### 3.1 Backend — `backend/teacher/`

#### Models

| Model | Status | Details |
|-------|--------|---------|
| `TeacherProfile` | ✅ COMPLETE | employee_id, assigned_subject (FK), qualification, experience, profile_photo |
| `TeacherClassAssignment` | ✅ COMPLETE | Maps teacher to classes, unique_together on (teacher, class_name) |
| `TimetableEntry` | ✅ COMPLETE | day_of_week, start/end_time, class_name, session_type, room, is_library_converted |
| `LibrarySession` | ✅ COMPLETE | Room booking with availability checks, unique_together on (room, date, start_time, end_time) |
| `Resource` | ✅ COMPLETE | Types: note/video/document/reference |
| `AnswerScript` | ✅ COMPLETE | Full evaluation workflow (pending→evaluating→completed), draft_marks, draft_remarks |

#### Views, Serializers, Services, Selectors

| Component | Status | Details |
|-----------|--------|---------|
| Serializers | ✅ COMPLETE | All 6 serializers working |
| Views | ✅ COMPLETE | All 13 views (Dashboard, Profile, Classes, ClassStudents, Timetable, LibraryConversion, LibraryBooking, AttendanceMark, ClassAttendanceSummary, EvaluationQueue, DraftMark, EvaluationSubmit, Resource) |
| Services | ✅ COMPLETE | All 10 service functions complete |
| Selectors | ✅ COMPLETE | All 10 selector functions complete |
| Permissions | ✅ COMPLETE | Uses `IsTeacher` from `student.permissions` |
| URLs | ✅ COMPLETE | All 12 teacher endpoints registered |

### 3.2 Frontend — Teacher Portal Routes

| Route | Status | Details |
|-------|--------|---------|
| `/teacher/dashboard` | ✅ COMPLETE | Subject stats, classes, timetable |
| `/teacher/assignments` | ✅ COMPLETE | Create/grade assignments |
| `/teacher/attendance` | ✅ COMPLETE | Mark student attendance |
| `/teacher/classes` | ✅ COMPLETE | Class overview, timetable, library/lab slots |
| `/teacher/exams` | ✅ COMPLETE | Exams & evaluate answer scripts |
| `/teacher/subjects` | ✅ COMPLETE | Subject progress, chapters, resources |
| `/teacher/timetable` | ✅ COMPLETE | Weekly timetable grid |
| `/teacher/profile` | ✅ COMPLETE | ProfileView component |
| `/teacher/resources` | ✅ COMPLETE | Notes/videos/documents with search/filter |

**Teacher Portal Frontend Summary:** All routes functional, all use mock data. **No real API integration.**

---

## 4. ADMIN MODULE — Backend

| Component | Status | Details |
|-----------|--------|---------|
| **Dedicated admin app** | ❌ NOT IMPLEMENTED | No `admin_app` directory exists in `backend/` |
| **Admin models** | ❌ NOT IMPLEMENTED | No SubjectRequestControl, FacultyAttendance, Exam, Event, ContactSubmission, AdmissionApplication, ClassTeacherAssignment, SubjectAllocation, SiteContent models |
| **Admin serializers** | ❌ NOT IMPLEMENTED | No serializers for admin operations |
| **Admin views** | ❌ NOT IMPLEMENTED | No admin API views |
| **Admin URLs** | ❌ NOT IMPLEMENTED | No admin API endpoints registered |
| **Admin services** | ❌ NOT IMPLEMENTED | No admin-specific business logic |
| **Admin selectors** | ❌ NOT IMPLEMENTED | No admin-specific queries |
| **Admin permissions** | ✅ COMPLETE | `IsAdmin` defined in `student/permissions.py` — **exists but unused** since there are no admin views |
| **Admin registration in INSTALLED_APPS** | ❌ NOT IMPLEMENTED | Not listed in `settings.py` |
| **Admin app added to eduSphere/urls.py** | ❌ NOT IMPLEMENTED | No admin API include |

---

## 5. ADMIN MODULE — Frontend

| Page | Status | Details |
|------|--------|---------|
| Dashboard | ✅ COMPLETE | Stats, charts, notifications, events |
| Students | ✅ COMPLETE | Class cards → class detail → student detail, fee report, add/export dialogs |
| Teachers | ✅ COMPLETE | Three-tab: Teachers, Subject Allocations, Class Teachers; send notification, assign dialogs |
| Classes | ✅ COMPLETE | Class cards → detail view with sections, subjects/teachers, timetable; add/assign dialogs |
| Attendance | ✅ COMPLETE | Two-tab: Analytics (charts) + Faculty Attendance (P/A/L/HD marking) |
| Exams | ✅ COMPLETE | Three-tab: Exams (create/publish/archive), Answer Scripts (upload), Evaluation Tracking |
| Fees | ✅ COMPLETE | Revenue dashboard + Fee Report by Class block |
| Events | ✅ COMPLETE | Cards with create/edit/publish/archive/delete |
| Contacts | ✅ COMPLETE | Table with send email, call, mark read/resolved/pending, delete |
| Admissions | ✅ COMPLETE | Stats cards, applicant table, detail panel, doc viewer, verification actions |
| Reports | ✅ COMPLETE | Growth/attendance/exam charts |
| Settings | ✅ COMPLETE | Four-tab CMS: About, Gallery, Home Page, Admission Page |
| Profile | ✅ COMPLETE | ProfileView component |

**Important:** All admin pages use **mock data exclusively**. There are zero real API calls.

---

## 6. CROSS-CUTTING FEATURES

| Feature | Backend | Frontend | Details |
|---------|---------|----------|---------|
| File Uploads (profile pics) | ✅ COMPLETE | ❌ NOT IMPLEMENTED | Backend has ImageField/FileField everywhere; frontend has no upload UI or API calls |
| File Uploads (answer scripts) | ✅ COMPLETE | ❌ NOT IMPLEMENTED | Backend AnswerScript model ready; frontend upload dialogs are mock-only (toast, no file sent) |
| File Uploads (admission docs) | ✅ COMPLETE | ❌ NOT IMPLEMENTED | AdmissionDocument model ready; frontend doc viewer shows mock data |
| File Uploads (resources) | ✅ COMPLETE | ❌ NOT IMPLEMENTED | Resource model ready; frontend resource page uses mock data |
| File Uploads (banner images) | ❌ NOT IMPLEMENTED | ⚠️ PARTIAL | No model for event/site banners; frontend settings page has image grids (mock) |
| Notifications | ✅ COMPLETE | ⚠️ PARTIAL | Backend Notification model/views work. Frontend admin can "send" (mock-only toast). Student/teacher notification pages show mock data. |
| Student Subject Request Workflow | ⚠️ PARTIAL | ✅ COMPLETE | Backend services exist (`approve_student_subjects`, `admin_assign_subjects`) but **never connected to any view**. Frontend subject request toggle + approval UI works (mock). |
| Export Functionality | ❌ NOT IMPLEMENTED | ⚠️ PARTIAL | No backend export endpoints. Frontend has export dialogs with scope selector (mock-only — logs to console). |
| Print/Download Reports | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | No PDF generation, no print stylesheets |
| Real Email Sending | ⚠️ PARTIAL | ❌ NOT IMPLEMENTED | Backend uses console email backend. Admin contacts page has "Send Email" dialog (mock-only — no API call). |
| SMS/Phone Integration | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | None |
| Real-time Updates | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | No WebSockets, no polling |
| Search/Filter APIs | ⚠️ PARTIAL | ✅ COMPLETE | Some backend selectors support search (e.g., `search_answer_scripts`); frontend has search/filter UI everywhere (using mock data) |
| Pagination | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | No DRF pagination on any view; frontend tables show all mock data at once |
| Dark Mode | ✅ COMPLETE | ✅ COMPLETE | next-themes provider, TailwindCSS dark mode classes |
| Responsive Design | ✅ COMPLETE | ✅ COMPLETE | Mobile sidebar, responsive grids |
| Loading States | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | No skeletons or loading spinners in admin pages (because data is instant from mock) |
| Error States | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | No error boundaries or error UI in pages |

---

## 7. ARCHITECTURE & CONFIGURATION

| Item | Status | Details |
|------|--------|---------|
| `AGENTS.md` rules compliance | ⚠️ PARTIAL | Backend admin app not created (violates AGENTS.md). StudentProfile auto-creation missing. Signal handlers missing. |
| Backend project structure | ✅ COMPLETE | Clean Django project with 3 apps |
| Frontend project structure | ✅ COMPLETE | TanStack Router with typed routes, layouts, lazy loading |
| Environment variables | ✅ COMPLETE | `.env` file with SECRET_KEY, OAuth credentials |
| Requirements | ⚠️ PARTIAL | `django-restframework==0.0.1` is a **fake package** — should be `djangorestframework` (already listed correctly separately). `cffi==2.0.0` is suspicious (latest is 1.17.x). |
| `eduSphere/urls.py` duplicate | ❌ BUG | `student.urls` included **twice**: `path("api/student/", include("student.urls"))` appears on two consecutive lines |
| Database | ✅ COMPLETE | SQLite with all 10+ tables migrated |
| Media Storage | ⚠️ PARTIAL | Local media storage configured for dev; **no production storage** (S3 not configured) |
| Web Server | ⚠️ PARTIAL | Gunicorn in requirements but no wsgi_asgi config for production |
| CORS | ✅ COMPLETE | `localhost:5173` allowed |

---

## 8. MISSING STUDENT PROFILE AUTO-CREATION

**Critical Gap:** When a user registers via `authentication/views.py:register_api`, the endpoint creates a `CustomUser` but **never creates** a `StudentProfile` or `TeacherProfile`. This means:

1. User registers → `CustomUser` created with `is_active=False`
2. User verifies OTP → `is_active=True`
3. User logs in → frontend redirects to `/student/dashboard`
4. `StudentDashboard` view tries `StudentProfile.objects.filter(user=request.user).first()` → `None`
5. API returns **404** — "Student profile not found"
6. Frontend sees error/missing data

**Affected apps:** student (all views). **Root cause:** No post_save signal on CustomUser, no profile creation in register_api.

---

## 9. ORPHANED / UNUSED CODE

| Location | Code | Status |
|----------|------|--------|
| `student/services.py` | `approve_student_subjects()` | Defined but **never called** from any view |
| `student/services.py` | `admin_assign_subjects()` | Defined but **never called** from any view |
| `student/services.py` | `create_assignment()` | Defined but **never called** from any view |
| `student/services.py` | `assign_core_subjects()` | Defined but **never connected** to any signal |
| `student/permissions.py` | `IsAdmin` | Defined but **never used** (no admin views to protect) |
| `frontend/src/lib/mock-data.ts` | All data | Every page reads from this; **no API calls exist anywhere** |

---

## 10. FEATURE COMPLETENESS MATRIX

### Portal-by-Portal

| Feature | Student Portal | Teacher Portal | Admin Portal |
|---------|---------------|----------------|--------------|
| Dashboard | ✅ Frontend (mock) | ✅ Frontend (mock) | ✅ Frontend (mock) |
| Profile | ✅ Frontend (mock) | ✅ Frontend (mock) | ✅ Frontend (mock) |
| Subjects | ✅ Frontend (mock) | ✅ Frontend (mock) | ❌ Not applicable |
| Assignments | ✅ Frontend (mock) | ✅ Frontend (mock) | ❌ Not applicable |
| Attendance | ✅ Frontend (mock) | ✅ Frontend (mock) | ✅ Frontend (mock) |
| Exams/Results | ✅ Frontend (mock) | ✅ Frontend (mock) | ✅ Frontend (mock) |
| Fees | ✅ Frontend (mock) | ❌ Not applicable | ✅ Frontend (mock) |
| Timetable | ✅ Frontend (mock) | ✅ Frontend (mock) | ❌ Not applicable |
| Notifications | ✅ Frontend (mock) | ❌ Not applicable | ✅ Frontend (mock) |
| Resources | ❌ Not applicable | ✅ Frontend (mock) | ❌ Not applicable |
| Class Management | ❌ Not applicable | ✅ Frontend (mock) | ✅ Frontend (mock) |
| Teacher Management | ❌ Not applicable | ❌ Not applicable | ✅ Frontend (mock) |
| Admissions | ❌ Not applicable | ❌ Not applicable | ✅ Frontend (mock) |
| Contacts | ❌ Not applicable | ❌ Not applicable | ✅ Frontend (mock) |
| Events | ❌ Not applicable | ❌ Not applicable | ✅ Frontend (mock) |
| Settings/CMS | ❌ Not applicable | ❌ Not applicable | ✅ Frontend (mock) |
| Reports | ❌ Not applicable | ❌ Not applicable | ✅ Frontend (mock) |

### Backend API Status

| API Group | Endpoints | Status |
|-----------|-----------|--------|
| Auth | 11 endpoints | ✅ COMPLETE |
| Student | 11 endpoints | ✅ COMPLETE (views exist) |
| Teacher | 12 endpoints | ✅ COMPLETE (views exist) |
| Admin | **~25+ endpoints needed** | ❌ NOT IMPLEMENTED (no admin app) |

---

## 11. PRIORITIZED BACKLOG

### 🔴 P0 — Critical (Blocking Production Use)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 1 | **Create backend admin_app** with all models, views, serializers, services, selectors, URLs | Admin portal has no real data | 2-3 days |
| 2 | **Auto-create StudentProfile/TeacherProfile on registration** (signal or in register_api) | Student portal returns 404 on every page | 2-4 hours |
| 3 | **Connect `approve_student_subjects` and `admin_assign_subjects` to admin views** | Subject approval workflow unusable | 2-4 hours |
| 4 | **Connect `assign_core_subjects` via post_save signal on StudentProfile** | Students get no core subjects | 1 hour |
| 5 | **Fix duplicate `student.urls` in `eduSphere/urls.py`** | Routes may conflict | 5 minutes |
| 6 | **Fix requirements.txt** (remove fake `django-restframework==0.0.1`, fix `cffi==2.0.0`) | Pip install may break | 5 minutes |

### 🟡 P1 — High (Required for MVP)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 7 | **Build API client/fetch layer on frontend** (Axios/TanStack Query hooks) | All pages use mock data only | 2-3 days |
| 8 | **Connect all admin pages to real API endpoints** | Replace mock data with API calls | 3-5 days |
| 9 | **Connect all student pages to real API endpoints** | Replace mock data with API calls | 2-3 days |
| 10 | **Connect all teacher pages to real API endpoints** | Replace mock data with API calls | 2-3 days |
| 11 | **File upload UI** (profile photos, answer scripts, admission docs, resources, banners) | Users cannot upload files | 2-3 days |
| 12 | **Export functionality** (CSV/PDF generation on backend + download on frontend) | Export buttons do nothing | 1-2 days |

### 🟢 P2 — Medium (Important for Quality)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 13 | **DRF pagination** on all list endpoints | Large datasets will be unusable | 1 day |
| 14 | **Loading states (skeletons)** on all pages | Users see blank screens during API calls | 1-2 days |
| 15 | **Error boundaries and error UI** | Unhandled errors confuse users | 1 day |
| 16 | **Print-friendly stylesheets** for reports | Reports cannot be printed | 4-6 hours |
| 17 | **Production email backend** (SMTP) | Emails print to console | 2-4 hours |
| 18 | **S3/Azure Blob storage for media** | Files lost on server restart | 1-2 days |

### 🔵 P3 — Low (Nice to Have)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 19 | **Real-time notifications** (WebSockets) | Unread badge never updates live | 3-5 days |
| 20 | **SMS integration** for fee reminders, alerts | No phone communication | 2-3 days |
| 21 | **Advanced search** with full-text search | Basic search only | 1-2 days |
| 22 | **Audit logging** for admin actions | No admin action history | 2-3 days |
| 23 | **Celery + Redis** for async tasks (email, exports) | Operations block requests | 2-3 days |
| 24 | **API documentation** (Swagger/DRF Spectacular) | No API docs for frontend | 1-2 days |
| 25 | **Unit/integration tests** | No test coverage | 5-10 days |

---

## 12. SUMMARY STATISTICS

| Dimension | Count |
|-----------|-------|
| Backend apps | 3 (authentication, student, teacher) |
| Backend models | 17 total (auth: 2, student: 10, teacher: 6) |
| Backend API views | 35 total (auth: 11, student: 11, teacher: 13) |
| Backend API endpoints | 34 total (auth: 11, student: 11, teacher: 12) |
| Backend endpoints with real DB reads | **0** (all frontend uses mock data) |
| Frontend route files | 53 |
| Frontend pages using mock data | **50** (all except auth pages) |
| Frontend API client files | **0** |
| TanStack Query hooks | **0** (library installed, unused) |
| Missing admin backend endpoints | **25+** |
| Critical bugs found | 5 (see P0 above) |
| P0 items (blocking) | 6 |
| P1 items (MVP) | 6 |
| P2 items (quality) | 6 |
| P3 items (nice to have) | 10 |
| Estimated effort for P0+P1 | **18-28 person-days** |

---

## 13. ARCHITECTURAL RECOMMENDATIONS

1. **Create `backend/admin_app/`** — new Django app with models, views, serializers, services, selectors, URLs. Register in INSTALLED_APPS and eduSphere/urls.py.

2. **Add signals** — `post_save` on `CustomUser` to auto-create `StudentProfile` (role=student) or `TeacherProfile` (role=teacher). Connect `assign_core_subjects` signal.

3. **Create frontend API layer** — Axios client with JWT interceptor, TanStack Query hooks for all entities.

4. **Paginate all list endpoints** — DRF `PageNumberPagination` default.

5. **Add file upload endpoints** — Each upload should return the URL. Frontend dialogs should POST to these endpoints.

6. **Replace mock data gradually** — Start with auth-dependent data (profile, dashboard stats), then core features (subjects, assignments, attendance), then admin features.

7. **Export endpoints** — CSV generation using Python `csv` module, PDF using ReportLab/WeasyPrint.

8. **Remove duplicate student URL** in eduSphere/urls.py.
