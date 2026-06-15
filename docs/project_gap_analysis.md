# EduSphere — Complete Project Gap Analysis

> **Date:** 2026-06-16 (updated)  
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
| Services | ⚠️ PARTIAL | `create_student_profile` ✅ (called from auth views), `assign_core_subjects` ✅ (called from auth views & admin services), `validate_elective_counts` ✅, `add_student_subject_selection` ✅ (called from SubjectSelectionView), `approve_student_subjects` ✅ (called from admin views), `admin_assign_subjects` ✅ (called from admin views), **`create_assignment`** ❌ defined but never called, **`evaluate_submission`** ❌ defined but never called |
| Selectors | ✅ COMPLETE | All 10 selector functions present and used |
| Permissions | ✅ COMPLETE | IsStudent, IsTeacher, IsAdmin all defined in `student/permissions.py` (IsAdmin unused — admin app uses its own) |
| URLs | ✅ COMPLETE | All 12 student endpoints registered |
| **Signal Handlers** | ⚠️ PARTIAL | No `signals.py` file exists; **no signals connected anywhere** in the project. However, `assign_core_subjects` IS called **inline** from `register_api` and `verify_otp_api` in auth views. Functionality works without signals. |
| **StudentProfile Auto-Creation** | ✅ COMPLETE | `register_api` calls `create_student_profile(user, data)` and `assign_core_subjects(profile)` at lines 228-231. `verify_otp_api` also calls `get_or_create` + `assign_core_subjects` at lines 168-171. Teacher profiles similarly auto-created. |

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

## 4. ADMIN MODULE — Backend (`backend/administration/`)

| Component | Status | Details |
|-----------|--------|---------|
| **Dedicated admin app** | ✅ COMPLETE | `administration/` app exists with **modular package structure**: separate views/, services/, models/, serializers/, selectors/, permissions/ directories |
| **Admin models** | ✅ COMPLETE | 10 model modules: SubjectRequest, TeacherManagement, Exam, Event, Contact, Admission, CMS (About/Gallery/Homepage), Document, Notification, Export |
| **Admin serializers** | ✅ COMPLETE | Serializers for all models in dedicated module files |
| **Admin views** | ✅ COMPLETE | **14 view modules** covering all admin operations (dashboard, students, teachers, classes, attendance, exams, events, contacts, admissions, CMS, exports, documents, notifications, subject requests) |
| **Admin URLs** | ✅ COMPLETE | **31 endpoints** registered at `/api/admin/` — covers dashboard (4), subject requests (1), students (6), teachers (9), classes (2), attendance (3), exams (7), events (4), contacts (2), admissions (6), CMS (6), exports (3), documents (3), notifications (2) |
| **Admin services** | ✅ COMPLETE | **13 service modules**: admission, attendance, class, CMS, contact, dashboard, document, event, exam, export, notification, student, teacher |
| **Admin selectors** | ✅ COMPLETE | 2 selector modules (student_admin, teacher_admin) with search/filter support |
| **Admin permissions** | ✅ COMPLETE | `IsAdmin` in `administration/permissions/admin_permissions.py` (checks `role=="admin"` or `is_superuser`) — used across all admin views |
| **Admin registration in INSTALLED_APPS** | ✅ COMPLETE | `"administration"` listed in `settings.py:42` |
| **Admin app added to eduSphere/urls.py** | ✅ COMPLETE | `path("api/admin/", include("administration.urls"))` in `urls.py:12` |

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
| File Uploads (answer scripts) | ✅ COMPLETE | ❌ NOT IMPLEMENTED | AnswerScript model ready; admin `AnswerScriptUploadView` at `/api/admin/exams/answer-scripts/`; frontend upload is mock-only (toast, no file sent) |
| File Uploads (admission docs) | ✅ COMPLETE | ❌ NOT IMPLEMENTED | AdmissionDocument model ready; admin `DocumentUploadView` at `/api/admin/documents/upload/`; frontend doc viewer shows mock data |
| File Uploads (resources) | ✅ COMPLETE | ❌ NOT IMPLEMENTED | Resource model ready; `ResourceView.post()` in teacher app accepts file upload; frontend uses mock |
| File Uploads (banner images) | ✅ COMPLETE | ⚠️ PARTIAL | `Event.banner_image` model exists; admin `GalleryImageView`, `HomepageFeaturedImageView` handle file uploads; frontend settings page has image grids (mock) |
| Notifications | ✅ COMPLETE | ⚠️ PARTIAL | Backend Notification model + admin `NotificationBroadcastListView/SendView` at `/api/admin/notifications/`. Frontend admin "send" is mock-only toast. Student/teacher notification pages show mock data. |
| Student Subject Request Workflow | ✅ COMPLETE | ✅ COMPLETE | Backend: `SubjectRequestControlView`, `StudentSubjectApprovalView`, `StudentSubjectAssignmentView` all implemented in admin. `approve_student_subjects` and `admin_assign_subjects` are connected via admin views. Frontend subject request toggle + approval UI works (mock). |
| Export Functionality | ✅ COMPLETE | ⚠️ PARTIAL | **3 export endpoints** in admin: `/api/admin/exports/students/`, `/api/admin/exports/teachers/`, `/api/admin/exports/attendance/`; frontend export dialogs are still mock-only (logs to console). No PDF generation yet. |
| Print/Download Reports | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | No PDF generation, no print stylesheets |
| Real Email Sending | ⚠️ PARTIAL | ❌ NOT IMPLEMENTED | Backend uses console email backend. Admin contacts page has "Send Email" dialog (mock-only — no API call). |
| SMS/Phone Integration | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | None |
| Real-time Updates | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | No WebSockets, no polling |
| Search/Filter APIs | ✅ COMPLETE | ✅ COMPLETE | Admin selectors support search/filter (student name, email, class; teacher name, subject; etc.). Frontend has search/filter UI everywhere (using mock data). |
| Pagination | ❌ NOT IMPLEMENTED | ❌ NOT IMPLEMENTED | No DRF pagination on any view; all list endpoints return unpaginated data; frontend tables show all mock data at once |
| Dark Mode | ✅ COMPLETE | ✅ COMPLETE | next-themes provider, TailwindCSS dark mode classes |
| Responsive Design | ✅ COMPLETE | ✅ COMPLETE | Mobile sidebar, responsive grids |
| Loading States | ❌ NOT IMPLEMENTED | ⚠️ PARTIAL | Auth context has loading state + spinner. **No per-page skeletons or loading spinners** in portal pages (data is instant from mock). |
| Error States | ❌ NOT IMPLEMENTED | ⚠️ PARTIAL | TanStack Router `errorComponent` provides root-level error boundary. **No per-page error boundaries** or error UI in portal pages. |

---

## 7. ARCHITECTURE & CONFIGURATION

| Item | Status | Details |
|------|--------|---------|
| `AGENTS.md` rules compliance | ✅ COMPLETE | Backend admin app (`administration/`) exists. StudentProfile/TeacherProfile auto-creation is implemented inline in auth views. Signal handlers are not needed — logic handled directly. |
| Backend project structure | ✅ COMPLETE | Clean Django project with **4 apps** (authentication, student, teacher, administration) |
| Frontend project structure | ✅ COMPLETE | TanStack Router with typed routes, layouts, lazy loading |
| Environment variables | ✅ COMPLETE | `.env` file with SECRET_KEY, OAuth credentials |
| Requirements | ⚠️ PARTIAL | `django-restframework==0.0.1` is a **fake package** — should be removed. `dotenv==0.9.9` is legacy (duplicates `python-dotenv`). `Django==6.0.6` does not exist (latest is 5.x). `cryptography==48.0.1` likely invalid. `certifi==2026.5.20` and `urllib3==2.7.0` have suspicious version numbers. A `pip install -r requirements.txt` would likely fail. |
| `eduSphere/urls.py` duplicate | ✅ COMPLETE | **Bug fixed.** `student.urls` is included **exactly once** at `urls.py:10`. |
| Database | ✅ COMPLETE | SQLite with all tables migrated |
| Media Storage | ⚠️ PARTIAL | Local media storage configured for dev; **no production storage** (S3 not configured) |
| Web Server | ⚠️ PARTIAL | Gunicorn in requirements but no wsgi_asgi config for production |
| CORS | ✅ COMPLETE | `localhost:5173` allowed |

---

## 8. STUDENT/TEACHER PROFILE AUTO-CREATION (RESOLVED)

**Previously a critical gap — now FIXED.** Profile auto-creation was implemented directly in auth views:

**`register_api` (lines 227-234):**
- If `role == "student"`: calls `create_student_profile(user, data)` + `assign_core_subjects(profile)`
- If `role == "teacher"`: calls `TeacherProfile.objects.get_or_create(user=user)`

**`verify_otp_api` (lines 167-174):**
- After activating user, ensures profile exists with `get_or_create` + `assign_core_subjects`

**Admission flow** (`administration/services/admission_admin.py`):
- `create_student` calls `create_student_profile(user, data)` + `assign_core_subjects(profile)`

**Status:** ✅ **RESOLVED** — profiles are auto-created for all registration paths. No signals are used; the logic runs directly in the view/service layer.

---

## 9. ORPHANED / UNUSED CODE

| Location | Code | Status |
|----------|------|--------|
| `student/services.py` | `create_assignment()` | Defined but **never called** from any view (teacher views use their own service layer) |
| `student/services.py` | `evaluate_submission()` | Defined but **never called** from any view |
| `teacher/services.py` | `get_available_teachers_for_subject()` | Defined but **never called** from any view |
| `student/permissions.py` | `IsAdmin` | Defined in `student/permissions.py` but **never used** (admin app uses its own `IsAdmin` in `administration/permissions/admin_permissions.py`) |
| `frontend/src/services/adminApi.ts` | All API service functions (145 lines) | **Complete API client** for all admin operations, but **never imported or called** from any page component |
| `frontend/src/lib/mock-data.ts` | All data (1243 lines) | Every portal page reads from this; **zero real API calls** from any page component |

**Previously orphaned — now connected:**
- `approve_student_subjects()` → ✅ Used via `administration/services/student_admin.py`
- `admin_assign_subjects()` → ✅ Used via `administration/services/student_admin.py`
- `assign_core_subjects()` → ✅ Called from auth `register_api`, `verify_otp_api`, and admin admission services

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
| Auth | 14+ endpoints | ✅ COMPLETE |
| Student | 12 endpoints | ✅ COMPLETE (all wired) |
| Teacher | 13 endpoints | ✅ COMPLETE (all wired) |
| Admin | **31 endpoints** | ✅ COMPLETE (administration app has 14 view modules, 31 URL routes) |

---

## 11. PRIORITIZED BACKLOG

### 🔴 P0 — Critical (Blocking Production Use)

| # | Item | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 1 | **Fix requirements.txt** (remove fake `django-restframework==0.0.1`, `dotenv==0.9.9`; fix `Django==6.0.6`, `cryptography==48.0.1`, `certifi==2026.5.20`, `urllib3==2.7.0`) | Pip install will fail | 10 minutes | ⏳ PENDING |
| 2 | **Connect frontend to real backend APIs** — build API client layer and replace mock data | All pages use mock-only data | 3-5 days | ⏳ PENDING |
| 3 | **Add DRF pagination** to all list endpoints (student list, teacher list, class list, attendance, etc.) | Large datasets unusable | 1 day | ⏳ PENDING |
| 4 | **Add file upload UI** (profile photos, answer scripts, admission docs, resources, banners) | Users cannot upload files | 2-3 days | ⏳ PENDING |
| 5 | **Replace console email backend with SMTP** | Emails never actually sent | 2-4 hours | ⏳ PENDING |

**Previously P0 — now RESOLVED ✅:**
- ✅ `administration/` app created with full modular architecture (31 endpoints)
- ✅ StudentProfile/TeacherProfile auto-created in `register_api` and `verify_otp_api`
- ✅ `approve_student_subjects` and `admin_assign_subjects` connected via admin views
- ✅ `assign_core_subjects` called from auth views and admin admission flow
- ✅ Duplicate `student.urls` bug fixed

### 🟡 P1 — High (Required for MVP)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 6 | **Build API client/fetch layer on frontend** — create TanStack Query hooks for all entities. Note: `src/services/adminApi.ts` already exists as a foundation (145 lines, complete API service file) but is unused. | All pages use mock data only | 2-3 days |
| 7 | **Connect all admin pages to real API endpoints** — 31 backend endpoints are ready and waiting | Replace mock data with API calls | 3-5 days |
| 8 | **Connect all student pages to real API endpoints** — 12 backend endpoints ready | Replace mock data with API calls | 2-3 days |
| 9 | **Connect all teacher pages to real API endpoints** — 13 backend endpoints ready | Replace mock data with API calls | 2-3 days |
| 10 | **File upload UI** (profile photos, answer scripts, admission docs, resources, banners) — 6+ upload endpoints exist on backend | Users cannot upload files | 2-3 days |
| 11 | **Export frontend integration** — 3 export endpoints exist on backend (`/api/admin/exports/students/`, `/api/admin/exports/teachers/`, `/api/admin/exports/attendance/`); frontend export dialogs need real calls | Export buttons do nothing | 1-2 days |
| 12 | **Loading states (skeletons)** on all pages — currently only auth has loading spinner; no per-page skeletons | Users see blank screens during API calls | 1-2 days |
| 13 | **Error boundaries and error UI** on all pages — currently only root error boundary exists | Unhandled errors confuse users | 1 day |

### 🟢 P2 — Medium (Important for Quality)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 14 | **Print-friendly stylesheets** for reports | Reports cannot be printed | 4-6 hours |
| 15 | **Production email backend** (SMTP) | Emails print to console | 2-4 hours |
| 16 | **S3/Azure Blob storage for media** | Files lost on server restart | 1-2 days |
| 17 | **Add error/loading states** to all admin portal views | Currently no per-page feedback | 1-2 days |

### 🔵 P3 — Low (Nice to Have)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 18 | **Real-time notifications** (WebSockets) | Unread badge never updates live | 3-5 days |
| 19 | **SMS integration** for fee reminders, alerts | No phone communication | 2-3 days |
| 20 | **Advanced search** with full-text search | Basic search only | 1-2 days |
| 21 | **Audit logging** for admin actions | No admin action history | 2-3 days |
| 22 | **Celery + Redis** for async tasks (email, exports) | Operations block requests | 2-3 days |
| 23 | **API documentation** (Swagger/DRF Spectacular) | No API docs for frontend | 1-2 days |
| 24 | **Unit/integration tests** | No test coverage | 5-10 days |
| 25 | **Remove orphaned service functions** (`create_assignment`, `evaluate_submission`, `get_available_teachers_for_subject`) | Dead code in codebase | 1 hour |
| 26 | **Consolidate duplicate `IsAdmin` permissions** (`student/permissions.py` vs `administration/permissions/admin_permissions.py`) | Slightly different logic may cause confusion | 30 min |

---

## 12. SUMMARY STATISTICS

| Dimension | Count |
|-----------|-------|
| Backend apps | 4 (authentication, student, teacher, **administration**) |
| Backend models | ~28 total (auth: 2, student: 10, teacher: 6, admin: 10 model modules) |
| Backend API views | ~55+ total (auth: 14+, student: 12, teacher: 13, admin: 14 view modules) |
| Backend API endpoints | ~70+ total (auth: 14+, student: 12, teacher: 13, admin: **31**) |
| Backend endpoints with real DB reads | **All ~55+** (backend views read from DB; frontend never calls them) |
| Frontend route files | 52 |
| Frontend pages using mock data | **~48** (all except auth pages: login, register, forgot/reset password) |
| Frontend API client files | **2** (`src/services/request.ts` + `src/services/adminApi.ts` — **both unused by pages**) |
| TanStack Query hooks | **0** (library installed, `QueryClientProvider` wraps app, but no `useQuery`/`useMutation` calls) |
| Missing admin backend endpoints | **0** (all 31 endpoints implemented) |
| Critical bugs found | 2 (see P0 above: requirements.txt, mock data dependency) |
| P0 items (blocking) | 5 |
| P1 items (MVP) | 8 |
| P2 items (quality) | 4 |
| P3 items (nice to have) | 9 |
| Estimated effort for P0+P1 | **14-22 person-days** |

---

## 13. ARCHITECTURAL RECOMMENDATIONS

1. **Fix `requirements.txt`** — Remove fake/broken packages (`django-restframework`, `dotenv`). Fix version numbers for `Django`, `cryptography`, `certifi`, `urllib3`. Pin to known-good versions.

2. **Connect frontend to backend APIs** — The `src/services/adminApi.ts` service file (145 lines) already defines a complete API layer. Create TanStack Query hooks (`useQuery`/`useMutation`) that call these services, then replace mock data imports page by page.

3. **Add DRF pagination** — Set `DEFAULT_PAGINATION_CLASS` in `REST_FRAMEWORK` settings. Apply `PageNumberPagination` to all list views.

4. **Add pagination-aware frontend** — Update table components to accept `page`, `pageSize`, `totalPages` props. Use TanStack Query's `keepPreviousData` for smooth transitions.

5. **Add file upload UI** — Each backend upload endpoint (profile photo, answer script, admission doc, resource, gallery image, document) needs a corresponding frontend component. Use `FormData` and track upload progress.

6. **Add loading and error states** — Every page needs skeleton components (loading) and error boundaries (error). Use React Suspense + TanStack Query's `isLoading`/`isError` states.

7. **Production email** — Switch from `console.EmailBackend` to SMTP backend. Use environment variables for credentials.

8. **Production media storage** — Configure `DEFAULT_FILE_STORAGE` for S3/Azure Blob in production settings.

9. **Replace mock data gradually** — Start with auth-dependent data (profile, dashboard stats), then core features (subjects, assignments, attendance), then admin features.

10. **Remove orphaned code** — Delete or integrate `create_assignment`, `evaluate_submission`, `get_available_teachers_for_subject` service functions that are defined but never called.

11. **Consolidate duplicate permissions** — The `IsAdmin` class in `student/permissions.py` is unused. The admin app uses its own version in `administration/permissions/admin_permissions.py`. Either remove the orphaned one or make `administration` import from `student.permissions`.

12. **Add export frontend integration** — 3 export endpoints already exist (`/api/admin/exports/students/`, `/api/admin/exports/teachers/`, `/api/admin/exports/attendance/`). Connect the export dialog buttons to download CSV files from these endpoints.
