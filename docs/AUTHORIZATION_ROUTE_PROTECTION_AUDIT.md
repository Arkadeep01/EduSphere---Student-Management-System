# Authorization & Route Protection Audit

**Date:** 2026-07-26
**Status:** Audit Complete — No Implementation

---

## 1. Executive Summary

This audit examined the complete authorization, permission, route protection, data exposure, and object-level access control architecture across all EduSphere roles (Student, Teacher, Staff, Admin, Director) in both backend (Django REST Framework) and frontend (TanStack Router/React).

**Overall Assessment:** The system has a working role-based authentication layer (JWT + HttpOnly cookies + role-based login routing) but significant gaps in object-level authorization, queryset filtering, published-result integrity, IDOR protection, academic-session scoping, account-state enforcement, and role boundary separation.

**Critical (P0) Findings:** 5
**High (P1) Findings:** 12
**Medium (P2) Findings:** 18
**Low (P3) Findings:** 8

**Most Critical Risks:**
1. Published results are editable outside the rechecking workflow
2. Any authenticated user can read any notification by ID
3. Teacher class-student endpoint has no teacher-allocation verification
4. No account-state rechecking after JWT issuance
5. Rechecking views use `IsAuthenticated` instead of `[IsAuthenticated, IsTeacher]`

---

## 2. Current Authentication/Authorization Architecture

### Authentication Stack
- **JWT** via `rest_framework_simplejwt` (access: 1 hour, refresh: 7 days, rotated)
- **HttpOnly cookies** for refresh tokens (set via `set_jwt_cookies`)
- **localStorage** for access and refresh tokens on frontend
- **SessionAuthentication** as DRF fallback
- **django-allauth** for Google/GitHub OAuth
- **OTP-based** email verification for self-registration
- `/api/me/` endpoint for session resolution

### Authorization Stack
- **DRF permission classes**: `IsAuthenticated` (default), plus role-specific: `IsAdmin`, `IsStaff`, `IsStudent`, `IsTeacher`
- **Frontend**: `AuthContext` with `useRequireRole()` hook in `DashboardLayout`
- **Route protection**: No route-level guards — all gated by layout component

### Key Architectural Decisions
- `DEFAULT_PERMISSION_CLASSES` in settings.py: `[IsAuthenticated]`
- Role checks are role-based (string match on `CustomUser.role`), not capability-based
- No object-level permission framework (no `django-guardian`, no `rules`)
- No centralized permission registry — each view declares its own permission class

---

## 3. Role Model

| Role | Exists? | Permission Class | Notes |
|------|---------|-----------------|-------|
| Student | Yes (`student`) | `IsStudent` in `student/permissions.py` | Checks `is_active` |
| Teacher | Yes (`teacher`) | `IsTeacher` in `student/permissions.py` | Checks `is_active` |
| Staff | Yes (`staff`) | `IsStaff` (defined in TWO locations) | No `is_active` check |
| Admin | Yes (`admin`) | `IsAdmin` in `administration/permissions/admin_permissions.py` | Also allows `is_superuser` |
| Director | **NO** | Does not exist | Missing from `ROLE_CHOICES` |

**Dual Staff Permissions**: `IsStaff` is defined identically in both `administration/permissions/staff_permissions.py` and `staff/permissions.py`. No functional conflict but maintenance risk.

---

## 4. Current Backend Permission Architecture

### Permission Classes

**IsAdmin** (`administration/permissions/admin_permissions.py`):
```python
request.user.role == "admin" or request.user.is_superuser
```
- No `is_active` check
- `is_superuser` acts as backdoor override

**IsStaff** (`administration/permissions/staff_permissions.py` and `staff/permissions.py`):
```python
request.user.role == "staff"
```
- No `is_active` check

**IsStudent** (`student/permissions.py`):
```python
request.user.role == "student" and request.user.is_active
```

**IsTeacher** (`student/permissions.py`):
```python
request.user.role == "teacher" and request.user.is_active
```

### Authorization Pattern Violations

Several views in `administration/views/rechecking.py` use `permission_classes = [IsAuthenticated]` and then check role inline inside the method body:

- `TeacherRecheckingQueueView` (line 300)
- `TeacherRecheckingHistoryView` (line 332)
- `TeacherRecheckingDraftView` (line 364)
- `TeacherRecheckingSubmitView` (line 396)

These use `IsTeacher().has_permission(request, self)` manually instead of `permission_classes = [IsAuthenticated, IsTeacher]`.

Similarly, `StudentRecheckingEligibleView`, `StudentRecheckingCreateView`, `StudentRecheckingListView` use `permission_classes = [IsAuthenticated]` and resolve the student from `request.user` internally — which happens to be correct for owned-resource access, but the permission declaration is misleading.

---

## 5. Current Frontend Route Protection Architecture

### Route Structure
- All portal routes are children of `/admin`, `/student`, `/teacher`, `/staff` parent routes
- Parent routes (`admin.tsx`, `student.tsx`, `teacher.tsx`, `staff.tsx`) render `DashboardLayout` with the appropriate role
- `__root.tsx` provides 404 page and error component — no 401/403 page exists

### AuthContext Protection

**`useRequireRole(role)`** in `DashboardLayout.tsx`:
```typescript
useEffect(() => {
  if (!loading && !user) navigate({ to: "/login" });
  else if (!loading && user && user.role !== role)
    navigate({ to: getRoleRedirect(user.role) });
}, [user, loading, role, navigate]);
```

**Critical Gap**: The `useRequireRole` hook on wrong-role match calls `navigate()` to the user's correct dashboard. This means:
- A Student typing `/admin/dashboard` gets silently redirected to `/student/dashboard` (no 403)
- A Staff typing `/admin/dashboard` gets redirected to `/staff/dashboard`
- The redirect happens AFTER the layout mounts — brief content flash possible

**`RequireAuth` pattern**: `useRequireAuth()` redirects to `/login` if unauthenticated.

### No Route-Level Guards
The `routeTree.gen.ts` has no `beforeLoad` or route-level guards. All protection is delegated to the layout component. The route tree also includes `register.tsx` (public signup) — matches the backend's still-functional `register_api`.

### Missing Director Routes
No `/director/*` routes exist. The `DashboardLayout` has no `director` entry in `navByRole`.

---

## 6. Student Permission Audit

### Student-Accessed Views (all protect via `[IsAuthenticated, IsStudent]`)

| View | Endpoint | Authorization | OK? |
|------|----------|---------------|-----|
| `StudentDashboard` | GET /api/student/dashboard/ | IsAuthenticated + IsStudent | OK |
| `StudentProfileView` | GET/PATCH /api/student/profile/ | IsAuthenticated + IsStudent | OK — user-owned profile |
| `SubjectListView` | GET /api/student/subjects/ | IsAuthenticated + IsStudent | OK — no sensitive data |
| `MySubjectsView` | GET /api/student/subjects/my/ | IsAuthenticated + IsStudent | OK — user's own subjects |
| `SubjectSelectionView` | POST /api/student/subjects/select/ | IsAuthenticated + IsStudent | OK — user's own selection |
| `AssignmentListView` | GET /api/student/assignments/ | IsAuthenticated + IsStudent | OK — class-based filter |
| `SubmissionView` | GET/POST /api/student/submissions/ | IsAuthenticated + IsStudent | OK — user's own submissions |
| `SubmissionFileView` | DELETE /api/student/submissions/files/:id/ | IsAuthenticated + IsStudent | OK — ownership check |
| `AttendanceView` | GET /api/student/attendance/ | IsAuthenticated + IsStudent | OK — user's own records |
| `ResultView` | GET /api/student/results/ | IsAuthenticated + IsStudent | OK — user's own results |
| `TimetableView` | GET /api/student/timetable/ | IsAuthenticated + IsStudent | OK — user's own timetable |
| `NotificationView` | GET/POST /api/student/notifications/ | IsAuthenticated + IsStudent | OK — filtered by user |
| `StudentExamListView` | GET /api/student/exams/ | IsAuthenticated + IsStudent | OK — class-based filter |
| `SubjectChaptersView` | GET /api/student/subjects/:id/chapters/ | IsAuthenticated + IsStudent | OK — subject info only |
| `StudentRecheckingEligibleView` | GET /api/student/rechecking/eligible/ | IsAuthenticated (only) | Needs IsStudent |
| `StudentRecheckingCreateView` | POST /api/student/rechecking/create/ | IsAuthenticated (only) | Needs IsStudent |
| `StudentRecheckingListView` | GET /api/student/rechecking/ | IsAuthenticated (only) | Needs IsStudent |

**Finding**: Student rechecking views are properly scoped to the authenticated student's own records (resolved from `request.user`), but the permission class should be `[IsAuthenticated, IsStudent]` for consistency.

---

## 7. Subject Teacher Permission Audit

### Teacher-Accessed Views

| View | Endpoint | Authorization | Object-Level Check? |
|------|----------|---------------|--------------------|
| `TeacherDashboard` | GET /api/teacher/dashboard/ | IsAuthenticated + IsTeacher | OK — own profile |
| `TeacherProfileView` | GET/PATCH /api/teacher/profile/ | IsAuthenticated + IsTeacher | OK — own profile |
| `TeacherClassView` | GET/POST /api/teacher/classes/ | IsAuthenticated + IsTeacher | **P1**: POST allows self-assigning classes |
| `ClassStudentsView` | GET /api/teacher/classes/:name/students/ | IsAuthenticated + IsTeacher | **P0**: NO teacher-allocation check |
| `TimetableView` | GET/POST /api/teacher/timetable/ | IsAuthenticated + IsTeacher | OK — own timetable |
| `AttendanceMarkView` | POST /api/teacher/attendance/mark/ | IsAuthenticated + IsTeacher | **P1**: No allocation check on student IDs |
| `EvaluationQueueView` | GET /api/teacher/evaluation/queue/ | IsAuthenticated + IsTeacher | OK — filtered by teacher |
| `DraftMarkView` | POST /api/teacher/evaluation/:id/draft/ | IsAuthenticated + IsTeacher | **P1**: No ownership check on script |
| `EvaluationSubmitView` | POST /api/teacher/evaluation/:id/submit/ | IsAuthenticated + IsTeacher | **P1**: No ownership check on script |
| `TeacherAssignmentListView` | GET/POST /api/teacher/assignments/ | IsAuthenticated + IsTeacher | OK — subject-scoped |
| `AssignmentSubmissionsView` | GET /api/teacher/assignments/:id/submissions/ | IsAuthenticated + IsTeacher | **P1**: No subject/teacher ownership check |
| `SubmissionMarksView` | POST /api/teacher/submissions/:id/marks/ | IsAuthenticated + IsTeacher | **P1**: No assignment ownership check |
| `TeacherExamListView` | GET /api/teacher/exams/ | IsAuthenticated + IsTeacher | OK — class-overlap filter |

### Critical: `ClassStudentsView` (teacher/views.py:87-95)

```python
class ClassStudentsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, class_name):
        profile = get_or_create_teacher_profile(request.user)
        students = get_students_in_class(profile, class_name)
        serializer = StudentProfileSerializer(students, many=True)
        return Response(serializer.data)
```

`get_students_in_class` (teacher/selectors.py:57-61):
```python
def get_students_in_class(teacher_profile, class_name):
    return StudentProfile.objects.filter(class_assigned=class_name,)
```

**There is NO filter ensuring the teacher is actually assigned to `class_name`.** A teacher could request `/api/teacher/classes/XII-C/students/` and receive the full student roster of any class, without any allocation check.

Additionally, the serializer exposes `date_of_birth`, `father_name`, `mother_name`, `address`, `gender`, `phone` — all of which are beyond Subject Teacher scope.

---

## 8. Class Teacher Permission Audit

### Current Representation
Class Teachers are represented by `ClassTeacherAssignment` in `administration/models/teacher.py`. The backend has no permission class that distinguishes Subject Teacher vs Class Teacher.

### Backend Support
- `ClassTeacherAssignment` is created by Admin via `TeacherAssignClassTeacherView`
- No view currently checks `is_class_teacher` status for extended access
- The `ClassDetailView` (admin) resolves Class Teacher info, but Teacher views do not differentiate

**Finding**: The backend has no mechanism to grant Class Teachers broader access (guardian contact info, class-wide performance, etc.) vs Subject Teachers. All Teachers receive the same Student data regardless of role.

---

## 9. Staff Permission Audit

### Staff-Accessed Views

| View | Endpoint | Authorization | OK? |
|------|----------|---------------|-----|
| `StaffDashboardView` | GET /api/staff/dashboard/ | IsAuthenticated + IsStaff | OK |
| `StaffUploadTasksView` | GET/POST /api/staff/upload-tasks/ | IsAuthenticated + IsStaff | OK |
| `StaffUploadView` | GET/POST /api/staff/upload/ | IsAuthenticated + IsStaff | **P1**: Can view pending_upload scripts across all exams/subjects |
| `StaffUploadDetailView` | GET/PUT/DELETE /api/staff/upload/:pk/ | IsAuthenticated + IsStaff | OK — filtered by `uploaded_by=request.user` |
| `StaffUploadHistoryView` | GET /api/staff/history/ | IsAuthenticated + IsStaff | OK — filtered by `uploaded_by=request.user` |
| `StaffRejectedUploadsView` | GET /api/staff/rejected/ | IsAuthenticated + IsStaff | OK — filtered by `uploaded_by=request.user` |
| `ScriptProcessingInitView` | POST /api/staff/processing/init/:id/ | IsAuthenticated + IsStaff | **P1**: No exam/subject allocation check |
| `StaffRecheckingOverviewView` | GET /api/staff/rechecking/ | IsAuthenticated + IsStaff | See rechecking section |

### Staff Student Access
Staff `StaffUploadTasksView.post()` and `StaffUploadView` access `StudentProfile` directly by ID (line 86 of staff/views.py):
```python
student = StudentProfile.objects.filter(id=s.get("student_id")).first()
```
There is no check that this student is enrolled in the specified exam or subject. Staff can attempt to create answer scripts for any student in the system.

### Staff Teacher Management
No Staff views for Teacher management exist in the current codebase (consistent with V1 scope — Staff only handles answer scripts).

---

## 10. Admin Permission Audit

### Admin-Accessed Views

| View | Endpoint | Object-Level Check? |
|------|----------|--------------------|
| `StudentListView` | GET/POST /api/admin/students/ | OK — institution-wide for Admin |
| `StudentDetailView` | GET/PATCH /api/admin/students/:id/ | **P2**: No verification that student_id references a valid StudentProfile |
| `TeacherListView` | GET/POST /api/admin/teachers/ | **P2**: POST creates Teacher (should be Staff-only per target architecture) |
| `TeacherDetailView` | GET/PATCH /api/admin/teachers/:id/ | OK — institution-wide for Admin |
| `SubjectAdminListView` | GET/POST /api/admin/subjects/ | OK |
| `SubjectAdminDetailView` | GET/PATCH/DELETE /api/admin/subjects/:id/ | **P2**: Hard delete with no cascade protection |
| `AdmissionApplicationListView` | GET /api/admin/admissions/ | OK |
| `AdmissionApplicationDetailView` | GET /api/admin/admissions/:id/ | OK |
| `GradeBoundaryListView` | GET/PUT /api/admin/results/grade-boundaries/ | **P0**: PUT replaces ALL grade boundaries |
| `GenerateResultsView` | POST /api/admin/results/publications/:id/generate/ | **P1**: Lock check exists but no result integrity validation |
| `WorkflowTransitionView` | POST /api/admin/results/publications/:id/transition/ | OK — workflow-gated |
| `BulkPublishView` | POST /api/admin/results/publications/:id/bulk-publish/ | **P0**: No verification that publication is in correct workflow state |
| `ResultPublicationDetailView` | GET /api/admin/results/publications/:id/ | OK |
| `AdminAssignScriptsView` | POST /api/admin/exams/assign-scripts/ | **P1**: No check that teacher is qualified for the subject |
| `AdminRecheckingActionView` | POST /api/admin/rechecking/:id/action/ | OK |
| `AdminRecheckingCompleteView` | POST /api/admin/rechecking/:id/complete/ | **P1**: No verification that both evaluations exist |
| `FeePaymentListView` | GET /api/admin/fees/payments/ | OK |
| `NotificationBroadcastListView` | GET/POST /api/admin/notifications/ | OK |

---

## 11. Director Permission Audit

**No Director implementation exists** in the current codebase:
- No `Director` role in `CustomUser.ROLE_CHOICES`
- No `IsDirector` permission class
- No Director views, serializers, or URL routes
- No Director frontend routes or navigation
- Django `is_superuser` is the only fallback for system-level access

**Risk**: Any existing Director-level functionality falls back to `is_superuser` checks or is currently inaccessible. The `IsAdmin` permission allows `is_superuser` as an override, which conflates superuser with admin.

---

## 12. Object-Level Permission Findings

| Finding | Severity | Location |
|---------|----------|----------|
| NotificationDetailView: No ownership filter | **P0** | `notification/views.py:151` |
| ClassStudentsView: No teacher-class allocation check | **P0** | `teacher/views.py:87-95` |
| DraftMarkView: No script ownership check | **P1** | `teacher/views.py:207-229` |
| EvaluationSubmitView: No script ownership check | **P1** | `teacher/views.py:235-273` |
| AssignmentSubmissionsView: No subject/teacher ownership | **P1** | `teacher/views.py:341-354` |
| SubmissionMarksView: No assignment ownership check | **P1** | `teacher/views.py:357-377` |
| TeacherChapterDetailView: No subject ownership check | **P2** | `teacher/views.py:506-521` |
| SubjectAdminDetailView.delete(): No cascade protection | **P2** | `administration/views/subject_admin.py:55-56` |
| StaffUploadTasksView: No exam-subject allocation check | **P1** | `staff/views.py:68-106` |

### Notification Detail Object Access (P0)

`notification/views.py:147-153`:
```python
class NotificationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, notification_id):
        notification = Notification.objects.get(id=notification_id)
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
```

Any authenticated user can read any notification by ID, regardless of ownership. This includes notifications intended for other users, containing potentially sensitive administrative content.

---

## 13. Queryset Filtering Findings

| Endpoint | Current Filter | Issue | Severity |
|----------|---------------|-------|----------|
| `TeacherListView.get()` | `.all()` | Returns all Teachers (intentional for Admin) | OK |
| `StudentListView.get()` | Service-layer filtered | OK for Admin | OK |
| `ClassStudentsView.get()` | `class_assigned=class_name` | No teacher-allocation filter | **P0** |
| `EvaluationQueueView.get()` | `teacher=profile` | Properly scoped | OK |
| `PendingSubjectRequestsListView.get()` | Optional class_name filter | No unauthorized access — Admin only | OK |
| `NotificationDetailView.get()` | No filter | Any notification accessible | **P0** |
| `StaffUploadView.get()` | `upload_status="pending_upload"` | No staff-exam assignment filter | **P1** |
| `AdminEvaluatorListView.get()` | `.all()` | Returns ALL teachers' names/emails to Admin | OK for Admin |
| `SubjectListView.get()` (student) | `.all()` | All subjects visible to all students | **P2**: No class-scoping |
| `TeacherExamListView.get()` | `classes__overlap=class_names` | Properly scoped | OK |

---

## 14. Serializer/Data Exposure Findings

### StudentProfileSerializer (student/serializers.py:15-45)
Exposed to: Admin (student list/detail), **Teacher (ClassStudentsView)**

Fields exposed to Teachers unnecessarily:
- `date_of_birth` — **Subject Teacher does not need this**
- `address` — **Subject Teacher does not need this**
- `father_name`, `mother_name` — **Subject Teacher does not need this**
- `blood_group` — **Subject Teacher does not need this**
- `phone` (from `user.mobile`) — **Subject Teacher does not need this**

### TeacherProfileSerializer (teacher/serializers.py:9-30)
Exposed to: Admin (teacher list/detail)

Fields OK for Admin scope. No unnecessary exposure.

### NotificationDetailView gets NotificationSerializer
Includes `title`, `message`, `notification_type`, `is_read`, `created_at` — moderately sensitive but not secrets.

### AdminEvaluatorListView (rechecking.py:177-191)
Returns: ALL teachers with `id`, `email`, `name`, `subject_name` — appropriate for Admin.

### RecheckingResponse Data
`TeacherRecheckingQueueView` returns: `script_id`, `exam_name`, `subject_name`, `marks`, `total_marks`, `remarks`, `status` — no student identity exposed. Good.

### `get_class_student_performance` (teacher/selectors.py:144-213)
Returns: `id`, `roll_number`, `name`, `class`, `attendance_percentage`, `assignment_average`, `midterm` result data — no DOB/address/parent info. Good pattern for Class Teacher view.

---

## 15. Frontend Route Findings

### Route Guard Architecture

**Current**: Role-based access control is implemented via `DashboardLayout` which wraps all child routes. The layout calls `useRequireRole(role)` on mount.

**Weaknesses**:
1. **No route-level guards** — All child routes within `/admin/*`, `/student/*`, etc. are unprotected at the route level. Any component-level API calls fire regardless of role check.
2. **Silent redirect on wrong role** — `useRequireRole` redirects to the user's correct dashboard instead of showing a 403. This hides authorization failures.
3. **Loading flash** — The layout renders a spinner while auth resolves, then potentially flashes "Unauthorized Access" before redirecting.
4. **No 401/403 pages** — `__root.tsx` only has a 404 `NotFoundComponent`. Auth failures are handled inline in the layout as JSX, not as proper route-level error boundaries.

### Route Inventory vs Navigation

| Route | In Navbar? | Protected? | Notes |
|-------|-----------|------------|-------|
| `/register` | No | No (public) | Still exists — pending removal per Part 1 plan |
| `/admissionForms` | No (public) | No | Public admission form |
| `/admin/*` | Yes (admin nav) | Layout-level | 31 admin routes |
| `/student/*` | Yes (student nav) | Layout-level | 13 student routes |
| `/teacher/*` | Yes (teacher nav) | Layout-level | 14 teacher routes |
| `/staff/*` | Yes (staff nav) | Layout-level | 8 staff routes |
| `/director/*` | **Missing** | N/A | No Director portal exists |

### Missing Route Protection
The `register.tsx` route still exists and is publicly accessible, matching the still-functional `register_api` backend endpoint.

---

## 16. Action-Level Permission Findings

| Action | View | Current Check | Should Be |
|--------|------|---------------|-----------|
| Teacher self-assign class | `TeacherClassView.post()` | IsTeacher | Should verify admin-allowed |
| Staff create upload batch | `StaffUploadTasksView.post()` | IsStaff | OK for Staff scope |
| Admin create Teacher | `TeacherListView.post()` | IsAdmin | Should be Staff-only per target arch |
| Admin publish result | `BulkPublishView.post()` | IsAdmin + publication exists | Should verify workflow state allows publish |
| Admin assign evaluator | `AdminAssignScriptsView.post()` | IsAdmin | Should verify teacher is qualified for subject |
| Admin complete rechecking | `AdminRecheckingCompleteView.post()` | IsAdmin | Should verify second evaluation exists |
| Teacher submit evaluation | `EvaluationSubmitView.post()` | IsTeacher | Should verify script is assigned to this teacher |
| Teacher save draft marks | `DraftMarkView.post()` | IsTeacher | Should verify script is assigned to this teacher |

---

## 17. Account-State / Session Findings

### Finding: No `password_changed` Enforcement
The `CustomUser` model has no `password_changed` or `needs_activation` field. The first-login activation flow described in Part 1 plan is not implemented.

### Finding: `is_active` Checked Only at Login
The `login_api` view checks `user.is_active` on authentication. However:
- JWT tokens remain valid after `is_active` is set to `False`
- No middleware or decorator re-verifies `is_active` on each request
- The `IsStudent` and `IsTeacher` permission classes do check `is_active` inline, but `IsAdmin` and `IsStaff` do NOT

### Finding: No Session Invalidation on Role Change
If an admin changes a user's role (e.g., Student → Teacher), the existing JWT tokens remain valid with the old role claim until expiration (up to 7 days for refresh tokens).

### Finding: OAuth Activation Gate
The OAuth `pre_social_login` adapter (`adapters.py:22-56`) verifies account existence and role match, but does NOT check `password_changed`/activation state (field doesn't exist yet). OAuth bypasses first-login activation.

---

## 18. Academic-Session Permission Findings

### Current State
- `Subject` model has no `academic_session` FK
- Most list endpoints return ALL records regardless of academic session
- `TeacherSubjectAllocation` and `StudentSubject` have `academic_session` fields
- `AcademicSession` model exists with `is_archived` flag (migration 0010)

### Findings
| Issue | Severity | Details |
|-------|----------|---------|
| No session scoping on Subject list | **P2** | All subjects visible regardless of session |
| No session scoping on Teacher allocation list | **P2** | `TeacherAllocationsView.get()` returns all years |
| Archived session mutation possible | **P2** | `is_archived` flag exists but no view checks it |
| Student dashboard shows all subjects | **P2** | No academic-year filtering on student subject lists |

---

## 19. Notification Permission Findings

### NotificationDetailView — P0 (cross-reference Section 12)

### NotificationListView — OK
`NotificationListView.get()` (notification/views.py:106-121) calls `NotificationService.get_user_notifications(user_id=request.user.id)` — properly filtered by user.

### PriorityOverrideView — OK
Requires `role == "admin"` explicitly (notification/views.py:208-220). Consistent.

### NotificationAnalyticsView — OK
Requires `role == "admin"` explicitly (notification/views.py:198-205). Consistent.

### NotificationBroadcastListView — OK
Uses `[IsAuthenticated, IsAdmin]` in `administration/views/notification_admin.py`.

### Student NotificationView — OK
Uses `[IsAuthenticated, IsStudent]` and filters by `request.user`. Also correctly scopes mark-read to `Notification.objects.get(id=notification_id, user=request.user)`.

---

## 20. Rank List Security Findings

### Current Implementation
Rank lists are computed via `ComputeRankView.post()` (admin) and stored in `StudentResult`. There is no dedicated Student-facing rank list endpoint in the current codebase. The `SubjectRankView` (admin only) returns rankings with `subject_name` and student rankings.

### Student Result Access
Students can access their own results via `ResultView.get()` which returns `PublishedResult` records filtered to their own `StudentProfile`. No rank list is exposed to students in the current codebase.

**Finding**: When a rank list feature is implemented, it must:
- Only show published results
- Expose minimum data: rank, subject, marks, percentage
- NOT expose: DOB, address, parent info, fee data, admission details
- Be scoped to the student's own class and session

---

## 21. Result Lock / Rechecking Security Findings

### Published Result Mutation Risk — P0

**Paths to modify published results:**

1. **GradeBoundaryListView.put()**: Can replace ALL grade boundaries at once. Affects result calculation retroactively.
2. **GenerateResultsView.post()**: Generates/regenerates results. Only allowed when `is_locked == False`.
3. **BulkPublishView.post()**: Publishes results. No check that results were previously unpublished — could re-publish over existing.
4. **AdminRecheckingCompleteView.post()**: Can complete rechecking and update results. Should verify second evaluator is different from first.

**Current protections:**
- `GenerateResultsView` checks `publication.is_locked` — good
- `DraftMarkView` and `EvaluationSubmitView` check `upload_status not in (evaluation_completed, archived)` — good
- `WorkflowTransitionView` uses `transition_workflow()` which enforces state machine

**Missing protections:**
- No check that a Teacher evaluating a script is the assigned teacher
- No constraint preventing the same Teacher from being both original and second evaluator in rechecking
- No immutable audit trail for published marks (they could be regenerated)

### Rechecking Flow Integrity

| Step | Permission | Object Check | Issue |
|------|-----------|--------------|-------|
| Student requests rechecking | Any authenticated user | Resolves student from `request.user` — OK | Should use IsStudent |
| Admin approves/rejects | IsAdmin | OK | — |
| Admin assigns second evaluator | IsAdmin | **P1**: No check that second evaluator != original evaluator | Blind isolation broken |
| Second evaluator drafts marks | Inline IsTeacher check | `save_rechecking_draft` verifies teacher is the assigned evaluator — OK | Pattern inconsistency |
| Second evaluator submits | Inline IsTeacher check | Verifies assignment — OK | — |
| Admin completes/comparison | IsAdmin | `compare_and_complete` processes final result — **P1**: No verification that both evaluations exist and are valid | — |

### Published Result Editing Controls

**Summary of mutation paths for published results:**
1. `GradeBoundaryListView.put()` — affects all grade calculations retroactively
2. `GenerateResultsView.post()` — blocked by `is_locked`
3. `BulkPublishView.post()` — can re-publish
4. `AdminRecheckingCompleteView.post()` — controlled path through rechecking workflow
5. `ExamAdminService.publish_result()` (PublishedResultCreateView) — creates new PublishedResult records
6. `StudentResult` is a separate model — not directly editable after publication

---

## 22. IDOR/BOLA Findings

| ID | Endpoint | Risk | Severity | Details |
|----|----------|------|----------|---------|
| IDOR-1 | GET /api/notifications/:id/ | Any user reads any notification | **P0** | No user filter in `NotificationDetailView` |
| IDOR-2 | GET /api/teacher/classes/:name/students/ | Teacher views any class's students | **P0** | No teacher-class allocation check |
| IDOR-3 | POST /api/teacher/evaluation/:id/draft/ | Teacher drafts marks on any unassigned script | **P1** | No teacher ownership check on script |
| IDOR-4 | POST /api/teacher/evaluation/:id/submit/ | Teacher submits marks on any unassigned script | **P1** | No teacher ownership check on script |
| IDOR-5 | GET /api/teacher/assignments/:id/submissions/ | Teacher views submissions for any assignment | **P1** | No subject/teacher ownership check |
| IDOR-6 | POST /api/teacher/submissions/:id/marks/ | Teacher grades any submission | **P1** | No assignment ownership check |
| IDOR-7 | GET /api/admin/students/:id/ | Admin access by ID (intentional) | OK | Admin scope includes all students |
| IDOR-8 | POST /api/staff/upload-tasks/ | Staff references any student by ID | **P1** | No exam-enrollment check |
| IDOR-9 | PATCH /api/admin/students/:id/ | Admin modifies any student's profile data | **P2** | Intentionally broad for Admin |
| IDOR-10 | GET /api/admin/students/:id/notifications/ | Admin views any student's notifications | **P1** | No admin-access-level check for student notifications |
| IDOR-11 | POST /api/admin/students/:id/notifications/ | Admin sends notification as any student | **P1** | No verification that admin should be sending as this student |
| IDOR-12 | GET /api/admin/teachers/:id/ | Admin access by ID (intentional) | OK | Admin scope includes all teachers |
| IDOR-13 | GET /api/admin/fees/payments/ | Admin views payments (intentional) | OK | Admin scope includes fees |
| IDOR-14 | POST /api/staff/processing/init/:id/ | Staff initiates processing on any script | **P1** | No check that script belongs to staff's workflow |
| IDOR-15 | GET /api/teacher/chapters/:id/ | Teacher modifies ANY chapter | **P2** | `get_object_or_404(Chapter, id=chapter_id)` with no subject ownership filter |
| IDOR-16 | PATCH/DELETE /api/teacher/chapters/:id/ | Teacher modifies ANY chapter's topics | **P2** | Same as IDOR-15 |

---

## 23. Cross-Role Access Findings

| Scenario | Current Behavior | Correctness |
|----------|-----------------|-------------|
| Student accesses /admin/dashboard | Redirected to /student/dashboard | P2 — silent redirect, should 403 |
| Teacher accesses /api/admin/students/ | 403 from IsAdmin permission | OK |
| Staff accesses /api/admin/teachers/ | 403 from IsAdmin permission | OK |
| Student accesses /api/admin/notifications/ | 403 from IsAdmin | OK |
| Unauthenticated accesses /api/teacher/dashboard/ | 401 from IsAuthenticated | OK |
| Inactive student accesses /api/student/dashboard/ | 403 from IsStudent (checks is_active) | OK |
| Inactive teacher accesses /api/teacher/dashboard/ | 403 from IsTeacher (checks is_active) | OK |
| Inactive admin accesses /api/admin/dashboard/ | **ALLOWED** (IsAdmin doesn't check is_active) | **P1** |
| Inactive staff accesses /api/staff/dashboard/ | **ALLOWED** (IsStaff doesn't check is_active) | **P1** |
| Teacher accesses /api/teacher/rechecking/queue/ | Inline IsTeacher check | OK (inconsistent pattern) |
| Student accesses /api/student/rechecking/eligible/ | IsAuthenticated only — resolves student from user | P2 — no explicit role check |
| Teacher accesses another Teacher's resource detail | 404 (filtered by teacher) | OK |

---

## 24. Navigation Findings

### Admin Navigation
- "Notification Center" + "Notifications" + "Notification Mgmt" — three entries causing confusion
- "Admission Forms" refers to admin admission management, not public forms — naming unclear
- No "Teacher Management" distinction from "Teachers" — both go to same route

### Staff Navigation
- No Teacher management entries (correct for V1 scope)
- Document/export management absent (on hold per requirements)

### Missing Navigation
- No Director sidebar (entire role missing)
- No "Return to Dashboard" link on unauthorized pages (layout provides this inline)
- Admin navigation has no direct link to "Subject Allocations" separate from "Subjects"

### Redirect Chain Issues
- Login redirects to role-specific dashboard via `getRoleRedirect()`
- After OAuth callback, redirect goes to `/auth/callback` which processes tokens
- No `returnTo` re-validation after authentication (Section 40 risk)

---

## 25. Permission Matrix

### LEGEND
- ✅ ALLOWED
- ❌ DENIED
- ⚠️ CONDITIONAL (see note)
- 🔴 CURRENTLY OVER-PERMISSIVE
- 🟡 CURRENTLY UNDER-PERMISSIVE
- ❓ UNCLEAR

| Resource | Action | Student | Subject Teacher | Class Teacher | Staff | Admin | Director |
|----------|--------|---------|----------------|---------------|-------|-------|----------|
| **Own Profile** | Read | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| | Update | ✅ own | ✅ own | ✅ own | ✅ own | ✅ own | N/A |
| **Student Profile** | Read own | ✅ | — | — | — | — | — |
| | Read any | ❌ | 🔴 over-permissive (class-based, no allocation check) | 🔴 same as Subject Teacher — no distinction | ❌ (should be) | ✅ | N/A |
| | Update own | ✅ | ❌ | ❌ | ❌ | ✅ institution | N/A |
| | Update any | ❌ | ❌ | ❌ | ❌ | 🔴 over-permissive (all fields editable) | N/A |
| | Delete | ❌ | ❌ | ❌ | ❌ | ❌ (no soft-delete exists) | N/A |
| **Subject** | List | ✅ all (no class filter) | ✅ own | ✅ own | ❌ | ✅ all | N/A |
| | Create | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| | Update | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| | Delete | ❌ | ❌ | ❌ | ❌ | 🔴 hard delete, no cascade check | N/A |
| **StudentSubject** | Read own | ✅ | ❌ | ❌ | ❌ | ✅ | N/A |
| | Enroll | ✅ (subject to request control) | ❌ | ❌ | ❌ | ✅ (direct assignment) | N/A |
| | Approve/Reject | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| **TeacherSubjectAllocation** | Read | ❌ | ✅ own | ✅ own | ❌ | ✅ all | N/A |
| | Create | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| | Update | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| | Delete | ❌ | ❌ | ❌ | ❌ | ⚠️ No deallocation endpoint | N/A |
| **ClassTeacherAssignment** | Read | ❌ | ❌ | ✅ own | ❌ | ✅ all | N/A |
| | Create | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| **Assignment** | Read | ✅ class-based | ✅ own subject | ✅ own subject | ❌ | ✅ | N/A |
| | Create | ❌ | ✅ own subject | ✅ own subject | ❌ | ✅ | N/A |
| | Update | ❌ | ✅ own | ✅ own | ❌ | ✅ | N/A |
| | Delete | ❌ | ✅ own | ✅ own | ❌ | ✅ | N/A |
| **AssignmentSubmission** | Create own | ✅ | ❌ | ❌ | ❌ | ❌ | N/A |
| | Read own | ✅ | ✅ own subject's | ✅ own class's | ❌ | ✅ | N/A |
| | Grade | ❌ | ✅ own subject's | ✅ own class's | ❌ | ❌ (should not) | N/A |
| **Attendance** | Read own | ✅ | ✅ class-based | ✅ class-wide | ❌ | ✅ analytics | N/A |
| | Mark | ❌ | ✅ class-based | ✅ class-wide | ❌ | ✅ (faculty) | N/A |
| **Exam** | Read | ✅ own class | ✅ own class | ✅ own class | ❌ | ✅ all | N/A |
| | Create | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| | Publish/Archive | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| **AnswerScript** | Upload | ❌ | ❌ | ❌ | ✅ | ✅ | N/A |
| | Assign evaluator | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| | Evaluate | ❌ | ✅ assigned only | ✅ assigned only | ❌ | ❌ | N/A |
| **Result/PublishedResult** | Read own | ✅ | ❌ | ❌ (should have class view) | ❌ | ✅ | N/A |
| | Generate | ❌ | ❌ | ❌ | ❌ | ✅ locked-check | N/A |
| | Publish | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| | Modify published | ❌ | ❌ | ❌ | ❌ | 🔴 can regenerate | N/A |
| **GradeBoundary** | Create/Update | ❌ | ❌ | ❌ | ❌ | 🔴 bulk replace | N/A |
| **Fee** | Read own | ✅ | ❌ | ❌ | ❌ | ✅ all | N/A |
| | Manage | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| **Notification** | Read own | ✅ | ✅ | ✅ | ✅ | ✅ + all broadcasts | N/A |
| | Read any | ❌ | ❌ | ❌ | ❌ | 🔴 IDOR-1 | N/A |
| | Broadcast | ❌ | ✅ (teacher) | ✅ (teacher) | ❌ | ✅ | N/A |
| | Override priority | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| **AcademicSession** | Read | ✅ current | ✅ current | ✅ current | ❌ | ✅ all | N/A |
| | Create/Archive | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| **Promotion** | Execute | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| **SubjectRequestControl** | Toggle | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| **AdmissionApplication** | CRUD | ❌ (public can create via form) | ❌ | ❌ | ❌ | ✅ | N/A |
| **Director operations** | All | N/A | N/A | N/A | N/A | N/A | ❌ (not implemented) |
| **Registration** | Self | ✅ (currently) | ✅ (currently) | ✅ (currently) | ✅ (currently) | — | — |

### Key Over-Permissive States

1. **Subject Teacher → Student Profile**: Can read DOB, address, parents, blood group through `ClassStudentsView`
2. **Subject Teacher → Any class students**: Can access any class by guessing/changing class_name
3. **Admin → Edit any Student field**: PATCH on `StudentDetailView` allows modifying `father_name`, `mother_name`, `address`, `date_of_birth` even after initial provisioning
4. **Any authenticated user → Any notification**: `NotificationDetailView` has no ownership filter
5. **Admin → Grade boundaries**: PUT replaces ALL grade boundaries without confirmation
6. **Admin → Regenerate results**: Can regenerate even after publication (only `is_locked` prevents this)

---

## 26. P0 Findings

### P0-1: Published Result Mutation Outside Rechecking
**Location**: `administration/views/result_engine.py:46-82` (GradeBoundaryListView PUT)
**Problem**: Grade boundaries can be bulk-replaced after results are published, changing all calculated grades retroactively.
**Impact**: Result integrity violation. A malicious or mistaken admin could alter every student's grade.
**Current behavior**: PUT replaces all GradeBoundary records without checking if related results are published.
**Target behavior**: Grade boundaries should be locked once any result using them is published. Modification should require explicit unlocking or a new academic session.

### P0-2: Notification Object Access Without Ownership
**Location**: `notification/views.py:147-153` (NotificationDetailView)
**Problem**: `Notification.objects.get(id=notification_id)` returns ANY notification for ANY authenticated user.
**Impact**: Any user can enumerate notification IDs and read sensitive notifications addressed to other users (e.g., disciplinary actions, fee defaults, private admin communications).
**Current behavior**: No user/ownership filter.
**Target behavior**: Must filter by `user=request.user` or have explicit role-based authorization.

### P0-3: Teacher Class Students Access Without Allocation Check
**Location**: `teacher/views.py:87-95` (ClassStudentsView)
**Problem**: `get_students_in_class(profile, class_name)` queries `StudentProfile.objects.filter(class_assigned=class_name)` with no verification that the requesting teacher is allocated to that class.
**Impact**: Any teacher can access detailed profiles (including DOB, address, phone) of any class's students.
**Current behavior**: Teacher can change `class_name` parameter to access any class.
**Target behavior**: Must verify teacher-class allocation before returning student data.

### P0-4: No Account-State Rechecking After JWT Issuance
**Location**: System-wide
**Problem**: `is_active` is only checked at login. JWT tokens remain valid even after account deactivation. `IsAdmin` and `IsStaff` permission classes don't check `is_active`.
**Impact**: Deactivated/expelled students or resigned teachers can continue accessing APIs until token expiry (up to 7 days for refresh).
**Current behavior**: JWT doesn't encode `is_active`. No middleware re-verifies account state.
**Target behavior**: Each request should verify account is still active. JWT should be short-lived or contain account-state claims that are validated.

### P0-5: Rechecking Views Use Inconsistent Role Checks
**Location**: `administration/views/rechecking.py:240-426`
**Problem**: Teacher and Student rechecking views use `permission_classes = [IsAuthenticated]` and then call `IsTeacher().has_permission(request, self)` manually. This means the permission class doesn't properly gate the view — a non-teacher user would pass `IsAuthenticated` and then be rejected inside the method body, but the pattern is fragile and inconsistent.
**Impact**: The public `permission_classes` declaration is misleading. If the inline check is ever removed or refactored, the endpoint becomes accessible to any authenticated user.
**Target behavior**: Use `permission_classes = [IsAuthenticated, IsTeacher]` consistently.

---

## 27. P1 Findings

### P1-1: Teacher Self-Assigns Classes
**Location**: `teacher/views.py:74-84` (TeacherClassView.post())
**Problem**: Any Teacher can create their own class assignments via POST.
**Impact**: Teacher can grant themselves access to classes they aren't authorized to teach.
**Target**: Class assignment should be admin-only.

### P1-2: Teacher Script Draft/Submit Without Ownership Check
**Location**: `teacher/views.py:207-229` (DraftMarkView), `teacher/views.py:235-273` (EvaluationSubmitView)
**Problem**: These views fetch scripts by ID without verifying the script is assigned to the requesting teacher.
**Current behavior**: `AdminAnswerScriptUpload.objects.get(id=script_id)` — no teacher filter.
**Target**: Must filter by `teacher=teacher_profile` as well.

### P1-3: Teacher Assignment Submissions View Without Ownership
**Location**: `teacher/views.py:341-354` (AssignmentSubmissionsView)
**Problem**: Fetches submissions for any assignment by ID without verifying the teacher owns the assignment's subject.
**Impact**: Teacher can view/graded submissions for assignments created by other teachers.
**Target**: Must verify assignment-subject belongs to teacher's allocation.

### P1-4: Teacher Grades Any Submission
**Location**: `teacher/views.py:357-377` (SubmissionMarksView)
**Problem**: `AssignmentSubmission.objects.get(id=submission_id)` with no ownership check that the assignment's subject belongs to the teacher.
**Target**: Must verify teacher is allocated to the assignment's subject.

### P1-5: Staff Can Reference Any Student for Script Upload
**Location**: `staff/views.py:86-88`
**Problem**: `StudentProfile.objects.filter(id=s.get("student_id")).first()` — no check that the student is enrolled in the specified exam or class.
**Impact**: Staff can create answer scripts for any student in any exam.
**Target**: Must verify student enrollment in the specified exam/subject.

### P1-6: Admin Creates Teacher (Should Be Staff)
**Location**: `administration/views/teacher_admin.py:24-29` (TeacherListView.post())
**Problem**: Admin can create Teacher accounts directly, but the target architecture assigns this to Staff.
**Target**: Remove Teacher creation from Admin; move to Staff.

### P1-7: Admin Assigns Scripts Without Subject Qualification Check
**Location**: `administration/views/exam_admin.py:192-231` (AdminAssignScriptsView)
**Problem**: No verification that the assigned teacher is qualified for the script's subject.
**Target**: Verify teacher-subject allocation before assignment.

### P1-8: Admin Rechecking Complete Without Validation
**Location**: `administration/views/rechecking.py:130-139` (AdminRecheckingCompleteView)
**Problem**: `compare_and_complete()` could be called before second evaluation exists.
**Target**: Verify both evaluations exist and are valid before completing.

### P1-9: Inactive Admin/Staff Can Access APIs
**Location**: `administration/permissions/admin_permissions.py`, `administration/permissions/staff_permissions.py`, `staff/permissions.py`
**Problem**: `IsAdmin` and `IsStaff` don't check `user.is_active`.
**Target**: Add `user.is_active` check to both permission classes.

### P1-10: No Second-Evaluator Distinctness Check in Rechecking
**Location**: `administration/services/rechecking_service.py` (approve_rechecking_request)
**Problem**: Admin could assign the original evaluator as the second evaluator, breaking blind isolation.
**Target**: Verify second evaluator != original evaluator.

### P1-11: Student Notification Access by Admin
**Location**: `administration/views/student_admin.py:67-80` (StudentNotificationsView)
**Problem**: Admin can read and send notifications as any student. No audit trail for admin-sent notifications.
**Target**: Log admin-initiated notifications sent on behalf of students.

### P1-12: Subject Hard Deletion Without Cascade Check
**Location**: `administration/views/subject_admin.py:55-56`
**Problem**: `get_object_or_404(Subject, id=subject_id).delete()` — hard deletes a subject that may have active enrollments, allocations, assignments, and results referencing it.
**Target**: Soft-delete (is_active flag) or prevent deletion when references exist.

---

## 28. P2 Findings

### P2-1: No 403 Error Page (Frontend)
**Current**: Unauthorized access shows inline JSX in `DashboardLayout` with "You do not have permission" message and "Return to Login" button.
**Target**: A dedicated 403 route/page consistent with the existing 404 page in `__root.tsx`.

### P2-2: Silent Wrong-Role Redirect (Frontend)
**Current**: `useRequireRole` redirects to the user's correct dashboard instead of showing 403.
**Target**: Should show 403 with "Return to Dashboard" link, not silently redirect.

### P2-3: Subject List Not Scoped to Class/Session
**Current**: `SubjectListView` (student) returns ALL subjects regardless of the student's class or academic session.
**Target**: Filter by student's class or enrolled subjects only.

### P2-4: No Session Scoping on List Endpoints
**Current**: Most list endpoints (`TeacherListView`, `StudentListView`, etc.) return all records across all academic sessions.
**Target**: Add default current-session filter with optional session override.

### P2-5: Archived Session Mutation Not Prevented
**Current**: `AcademicSession.is_archived` exists in migration but no view checks it.
**Target**: All mutation endpoints should reject writes targeting archived sessions.

### P2-6: Dual Staff Permission Classes
**Current**: `IsStaff` defined in both `administration/permissions/staff_permissions.py` and `staff/permissions.py`.
**Target**: Consolidate to single definition.

### P2-7: Superfluous `TeacherClassAssignment` Duplication
**Current**: `TeacherClassAssignment` in `teacher/models.py` duplicates `ClassTeacherAssignment` in `administration/models/teacher.py`. Different models, same concept.
**Target**: Consolidate. The `administration` version is the authoritative one.

### P2-8: `TeacherProfile.assigned_subject` Dual Source
**Current**: Subject assignment stored in both `TeacherProfile.assigned_subject` and `TeacherSubjectAllocation`. Creates sync issues.
**Target**: Deprecate `TeacherProfile.assigned_subject` in favor of `TeacherSubjectAllocation` (already documented in Part 1 plan).

### P2-9: Teacher Chapter/Topic Operations Without Subject Ownership
**Current**: `TeacherSubjectChapterDetailView.patch/delete` uses `get_object_or_404(Chapter, id=chapter_id)` — no verification that the chapter's subject belongs to the teacher.
**Target**: Verify teacher-subject allocation before allowing chapter/topic mutations.

### P2-10: Public Registration Still Enabled
**Current**: `register_api` and `register.tsx` still exist and are functional. `student_signup_api`, `teacher_signup_api`, `staff_signup_api` also exist.
**Target**: Remove or gate behind authorized creator per Part 1 plan.

### P2-11: No `is_superuser` Distinction from Admin
**Current**: `IsAdmin` allows `is_superuser` as a pass. `is_superuser` is never used separately.
**Target**: Define superuser as a separate capability, not conflated with admin.

### P2-12: No Rate Limiting on Sensitive Endpoints
**Current**: No rate limiting except OTP throttle.
**Target**: Rate-limit login, password reset, and other auth endpoints.

### P2-13: `token_obtain_pair` Re-authenticates User
**Current**: `CustomTokenObtainPairSerializer.validate()` calls `authenticate()` and the view also calls `authenticate()` again. Redundant.
**Target**: Clean up duplicate authentication.

### P2-14: OAuth Callback Doesn't Verify Account State
**Current**: `oauth_callback_api` creates JWT for any authenticated `request.user` without rechecking `is_active`.
**Target**: Verify account state before issuing JWT.

### P2-15: Frontend API Tokens in localStorage
**Current**: Access tokens stored in `localStorage`. Vulnerable to XSS.
**Target**: Use httpOnly cookies for access tokens (requires architecture change — flagged, not to be casually replaced).

### P2-16: Admin Fee Ledger Shows "My Ledger"
**Current**: Admin route `fees/my-ledger/` — unclear if this is admin's own fee record or a student lookup. Naming is confusing.
**Target**: Rename to clarify purpose.

### P2-17: No Subject Count Validation on Enrollment
**Current**: `assign_core_subjects` and subject selection don't validate minimum/maximum subject counts per business rules.
**Target**: Enforce "Minimum 2 Specialized, Minimum 1 Enrichment" rules.

### P2-18: `AnonymousEvaluationSerializer` Name Is Misleading
**Current**: The serializer is named "Anonymous" but still exposes evaluation context (exam name, subject). No student identity is leaked, which is good, but the naming doesn't accurately describe its scope.
**Target**: Rename or document clearly.

---

## 29. P3 Findings

### P3-1: Redundant Admin Nav Entries
Three notification entries: "Notifications", "Notification Center", "Notification Mgmt" — confusing.

### P3-2: `StudentProfileSerializer` `update` Method Modifies User
**Current**: The serializer's `update()` modifies `user.first_name` and `user.last_name` directly through the user object. Should use a dedicated user serializer.

### P3-3: No Inline Documentation on Permission Classes
**Current**: `IsAdmin` and `IsStaff` have no docstrings explaining their purpose.

### P3-4: `FacultyAttendance` in Teacher Model File
**Current**: `FacultyAttendance` is defined in `administration/models/teacher.py` — logically belongs in an attendance module, not teacher models.

### P3-5: `ClassTeacherAssignment` Academic Year Default
**Current**: Hardcoded `default="2026-27"` in multiple model fields. Will need updating annually.

### P3-6: No Confirmation on Destructive Actions
**Current**: Subject deletion, grade boundary replacement, bulk publish — no confirmation step.

### P3-7: `TeacherListView.get()` Sends All Data
**Current**: Returns `TeacherProfileSerializer` for all teachers — appropriate for Admin but the service layer has no pagination.

### P3-8: `is_superuser` in User Type (Frontend)
**Current**: Frontend `User` type includes `is_superuser` but no code uses it.

---

## 30. Existing Security That Must Be Preserved

### Correct Patterns
1. **Student views consistently use `IsStudent`** and scope to own profile via `request.user`
2. **Teacher evaluation queue** is properly filtered by teacher assignment
3. **Staff upload detail** is filtered by `uploaded_by=request.user` — good object-level ownership
4. **Notification list** for students is filtered by `request.user`
5. **Student notification mark-read** correctly checks `user=request.user`
6. **Result generation** checks `is_locked` before generating
7. **Evaluation submit** checks `upload_status not in (evaluation_completed, archived)`
8. **Subject enrollment request control** properly gates student subject selection
9. **OTP throttle** prevents brute-force OTP attacks
10. **OAuth pre_social_login** correctly verifies account existence and role match
11. **Login role validation** checks `user.role != selected_role` — correct cross-role prevention
12. **Password validation** uses Django's built-in validators
13. **JWT blacklisting** on logout via `token.blacklist()`

### Architecture Decisions Worth Preserving
- Role-based routing structure (`/admin/*`, `/student/*`, etc.)
- Service/Selector separation for query logic
- JWT + HttpOnly cookie hybrid pattern
- OAuth account-existence verification (no auto-creation)
- `StudentSubject` lifecycle states (pending → approved/rejected)
- `ResultPublication` workflow state machine

---

## 31. Proposed Implementation Architecture

### Phase 1: Permission Class Consolidation (No Migration Required)

**Problem**: `IsAdmin` and `IsStaff` don't check `is_active`; dual `IsStaff` classes; rechecking views use wrong pattern.

**Proposed Changes**:
1. Add `is_active` check to `IsAdmin` and both `IsStaff` classes
2. Delete `administration/permissions/staff_permissions.py`, consolidate to `staff/permissions.py`
3. Change rechecking view `permission_classes` to `[IsAuthenticated, IsTeacher]` and `[IsAuthenticated, IsStudent]`
4. Add `IsDirector` permission class

**Files affected**:
- `administration/permissions/__init__.py` (update imports)
- `administration/permissions/admin_permissions.py` (add is_active check)
- `administration/permissions/staff_permissions.py` (delete or consolidate)
- `staff/permissions.py` (add is_active check)
- `administration/views/rechecking.py` (update permission_classes)
- `student/permissions.py` (add IsDirector)

**Database impact**: None
**Migration**: No

---

### Phase 2: P0 Fixes — Object-Level Authorization (No Migration)

**P0-2**: Fix `NotificationDetailView`
- Add `user=request.user` filter
- Alternatively, implement role-based access for admin notifications

**P0-3**: Fix `ClassStudentsView`
- Before querying students, verify teacher is assigned to `class_name`
- Check both `TeacherClassAssignment` and `TeacherSubjectAllocation.assigned_classes`
- Create a `teacher_has_class(teacher_profile, class_name)` selector

**P0-4**: JWT Account State
- Option A (minimal): Add middleware that checks `request.user.is_active` on each authenticated request
- Option B (better): Encode `is_active` in JWT claims and verify on each request via custom authentication class

**P0-5**: Fix rechecking permission classes (Phase 1 covers this)

**Files affected**:
- `notification/views.py`
- `teacher/views.py`
- `teacher/selectors.py` (new selector)
- `middleware` or authentication classes

**Database impact**: None
**Migration**: No

---

### Phase 3: Published Result Integrity (Migration Not Required)

**Changes**:
1. `GradeBoundaryListView.put()`: Check if any published result references the boundaries. If yes, reject with 400.
2. `BulkPublishView.post()`: Add idempotency check — verify target status allows publishing.
3. `GenerateResultsView.post()`: Verify publication workflow state allows regeneration (only in `draft` state).
4. Add `result_lock` concept to `ResultPublication`: once locked, only rechecking workflow can modify.

**Files affected**:
- `administration/views/result_engine.py`
- `administration/services/result_engine.py`
- `administration/models/results.py`
- `administration/serializers/result_engine.py`

**Database impact**: Possibly add `is_finalized` field to ResultPublication
**Migration**: Maybe (if adding field)

---

### Phase 4: IDOR Fixes — Script and Assignment Ownership (No Migration)

**Changes**:
1. `DraftMarkView` and `EvaluationSubmitView`: Filter by `teacher=teacher_profile`
2. `AssignmentSubmissionsView`: Verify teacher's subject ownership of the assignment
3. `SubmissionMarksView`: Same ownership chain check
4. `StaffUploadTasksView.post()`: Verify student is enrolled in the exam/subject
5. `TeacherSubjectChapterDetailView`: Verify teacher-subject allocation before allowing chapter mutation

**Files affected**:
- `teacher/views.py`
- `teacher/services.py` (add ownership verification)
- `staff/views.py`
- `staff/services.py`

**Database impact**: None
**Migration**: No

---

### Phase 5: Serializer Data Exposure Reduction (No Migration)

**Changes**:
1. Create `TeacherStudentProfileSerializer` with limited fields for Subject Teacher context
2. Create `ClassTeacherStudentProfileSerializer` that adds guardian contact info
3. `ClassStudentsView` uses `TeacherStudentProfileSerializer` instead of full `StudentProfileSerializer`
4. Remove `date_of_birth`, `address`, `father_name`, `mother_name`, `blood_group`, `phone` from Subject Teacher view

**Files affected**:
- `student/serializers.py` (new serializers)
- `teacher/views.py` (update serializer import)
- `administration/serializers/teacher.py` (if needed)

**Database impact**: None
**Migration**: No

---

### Phase 6: Director Role Implementation (Migration Required)

(Per Part 1 implementation plan — summarized here for authorization completeness)

**Changes**:
1. Add `'director'` to `CustomUser.ROLE_CHOICES`
2. Create `IsDirector` permission class
3. Create Director views for Admin/Staff account management
4. Add Director frontend routes and navigation

**Files affected**: As listed in `docs/role-account-architecture-implementation-plan.md`
**Migration**: Yes

---

### Phase 7: Academic-Session Scoping (Migration Not Required for Most)

**Changes**:
1. Add default current-session filter to list endpoints via a mixin or base view
2. `SubjectAdminListView`: Filter by session if `Subject` gets session FK
3. `TeacherAllocationsView`: Filter by current academic year
4. `StudentListView`: Default to current session
5. Add session override via query parameter

**Files affected**:
- `administration/views/student_admin.py`
- `administration/views/teacher_admin.py`
- `administration/services/*.py`
- Potentially a base class or mixin

**Database impact**: None (unless adding session FK to Subject)
**Migration**: Maybe

---

### Phase 8: Account-State Enforcement (Migration Required)

**Changes**:
1. Add `password_changed` BooleanField to `CustomUser`
2. Add middleware to verify `is_active` on each request
3. Update `IsAdmin` and `IsStaff` to check `is_active`
4. Implement first-login activation flow (per Part 1 plan)
5. OAuth activation gate

**Files affected**:
- `authentication/models.py`
- `authentication/middleware.py` (new)
- `authentication/views.py`
- `authentication/adapters.py`
- All permission classes

**Migration**: Yes

---

### Phase 9: Frontend Route Protection Enhancement (No DB Impact)

**Changes**:
1. Add `beforeLoad` route guards to parent routes (`/admin`, `/student`, `/teacher`, `/staff`)
2. Implement proper 403 error route
3. Fix silent redirect to show 403 with "Return to Dashboard"
4. Add loading-state handling to prevent content flash
5. Add `returnTo` revalidation after authentication

**Files affected**:
- `frontend/src/router.tsx`
- `frontend/src/routes/__root.tsx` (add 403 component)
- `frontend/src/routes/admin.tsx`, `student.tsx`, `teacher.tsx`, `staff.tsx` (add beforeLoad)
- `frontend/src/context/AuthContext.tsx` (update useRequireRole behavior)
- `frontend/src/components/layouts/DashboardLayout.tsx` (remove redundant checks)

**Database impact**: None
**Migration**: No

---

### Phase 10: Rechecking Integrity Improvements (Migration Maybe)

**Changes**:
1. Verify second evaluator != original evaluator in `approve_rechecking_request`
2. Add validation in `compare_and_complete`: require both evaluations
3. Add immutable audit trail for published result changes through rechecking
4. Ensure evaluator isolation: original evaluator cannot see second evaluator's marks and vice versa

**Files affected**:
- `administration/services/rechecking_service.py`
- `administration/views/rechecking.py`
- `administration/models/rechecking.py`

**Database impact**: Maybe (audit fields)
**Migration**: Maybe

---

## 32. Proposed Implementation Order

```
Phase 1:  Permission class fixes        — No migration, immediate security benefit
Phase 2:  P0 object-level fixes          — No migration, closes critical IDORs
Phase 3:  Result integrity               — No migration, closes P0 result mutation
Phase 4:  IDOR fixes                     — No migration, closes P1 IDORs
Phase 5:  Serializer data exposure       — No migration, reduces overexposure
Phase 6:  Director role                  — Migration required, new feature
Phase 7:  Academic session scoping       — Maybe migration, scoping improvement
Phase 8:  Account-state enforcement      — Migration required, activation flow
Phase 9:  Frontend route protection      — No migration, UX/auth boundary
Phase 10: Rechecking integrity           — Maybe migration, workflow hardening
```

Each phase can be implemented independently. Phases 1-5 are migration-free and can be done without schema changes. Phases 6 and 8 require migrations.

---

## 33. Questions Requiring User Decision

### Q1: Result Publication Lock Model

**Question**: Should published results be permanently immutable (locked forever after publication), or should there be a controlled window where Admin can unpublish and regenerate?

**Current behavior**: Results can be regenerated as long as `is_locked == False`. `BulkPublishView` can publish again.

**Option A**: Once published → locked forever. Only rechecking can change individual results.
**Option B**: Published → lock window (e.g., 7 days) during which Admin can unpublish. After window → permanently locked.
**Option C**: Admin can always unlock/republish (current behavior but with confirmation).

**Recommendation**: Option A — strongest integrity guarantee. Rechecking is the only path for post-publication changes.

**Security consequence**: Option C maintains current P0 risk. Options A/B close it.

---

### Q2: Teacher Class Self-Assignment

**Question**: Should Teachers be able to self-assign classes via the API?

**Current behavior**: `TeacherClassView.post()` allows Teachers to create class assignments.

**Option A**: Remove Teacher self-assignment entirely. Admin-only class assignment.
**Option B**: Keep self-assignment but require Admin approval (add pending state).
**Option C**: Keep as-is (convenience feature).

**Recommendation**: Option A — Admin is the authority for academic deployment.

---

### Q3: Staff Student Reference in Script Upload

**Question**: Should Staff be limited to referencing only students enrolled in the specific exam/subject when creating answer script batches?

**Current behavior**: Staff can reference any StudentProfile by ID regardless of exam enrollment.

**Option A**: Strict — validate student is enrolled in the exam+subject before allowing script creation.
**Option B**: Loose — allow any student but add a warning.
**Option C**: Keep as-is (Staff is trusted).

**Recommendation**: Option A — enrollment validation prevents data entry errors and scope violations.

---

### Q4: Admin Student Profile Edit Scope

**Question**: Which Student profile fields should Admin be able to edit after initial provisioning?

**Current behavior**: `StudentDetailView.patch()` uses `StudentProfileSerializer` which allows editing all fields including `first_name`, `last_name`, `father_name`, `mother_name`, `address`, `date_of_birth`, `gender`, `blood_group`, `section`, `class_assigned`.

**Option A**: Admin can edit all fields (current behavior).
**Option B**: Restrict to academic fields only (`class_assigned`, `section`, `roll_number`, `admission_number`). Profile data becomes read-only after initial setup.
**Option C**: Require a reason/audit trail for any profile data change.

**Recommendation**: Option B + C — academic fields remain editable; personal data changes go through a logged workflow.

---

### Q5: Class Teacher vs Subject Teacher Distinction

**Question**: Should Class Teacher permissions be explicitly distinguished from Subject Teacher permissions at the backend level?

**Current behavior**: No distinction. All Teachers get the same data.

**Option A**: Implement `IsClassTeacher` permission. Grant Class Teachers access to guardian contact info and class-wide analytics.
**Option B**: Keep flat Teacher model. Add conditional logic that checks `ClassTeacherAssignment` where needed.
**Option C**: Keep current behavior — no distinction needed.

**Recommendation**: Option B — pragmatic. Add `ClassTeacherAssignment` checks in specific views that need broader access.

---

### Q6: Grade Boundary Protection

**Question**: Should grade boundaries be locked after any result publication depends on them?

**Current behavior**: `GradeBoundaryListView.put()` replaces all boundaries unconditionally.

**Option A**: Lock boundaries after first result publication. Unlock requires admin override with reason.
**Option B**: Boundaries are always editable (keep current).
**Option C**: Boundaries versioned — editing creates new version; published results reference their version.

**Recommendation**: Option A — simple and protects result integrity.

---

### Q7: Inactive Account Token Invalidation

**Question**: How should the system handle JWT tokens for accounts that are deactivated while tokens are still valid?

**Current behavior**: No invalidation. Tokens remain valid until expiry (up to 7 days for refresh).

**Option A**: Add middleware that checks `is_active` on every request (simplest).
**Option B**: Add `is_active` to JWT claims; custom authentication class verifies on each request.
**Option C**: Maintain blacklist of deactivated user IDs; check against it on each request.
**Option D**: Accept the 7-day window as acceptable risk.

**Recommendation**: Option B — most robust. JWT claims contain account state; authentication class validates claims match current DB state.

---

### Q8: Subject Deletion Strategy

**Question**: Should subject deletion be soft-delete or hard-delete with protection?

**Current behavior**: Hard delete via `SubjectAdminDetailView.delete()` with no cascade protection.

**Option A**: Soft delete — add `is_active` field; filter out inactive subjects by default.
**Option B**: Hard delete but block if references exist (StudentSubject, TeacherSubjectAllocation, Assignment, etc.).
**Option C**: Keep current (hard delete, no protection).

**Recommendation**: Option A — soft delete provides safety and recoverability.

---

### Q9: Archive Session Mutation Control

**Question**: Should archived academic sessions be fully read-only or allow controlled corrections?

**Current behavior**: `is_archived` flag exists but no view enforces read-only.

**Option A**: Fully read-only. All mutation endpoints check `is_archived` and reject.
**Option B**: Read-only by default but Admin can override (logged).
**Option C**: No enforcement (keep current).

**Recommendation**: Option A — prevents accidental data corruption in historical records.

---

### Q10: Rechecking Evaluator Isolation

**Question**: Should the system enforce that original and second evaluator are different people?

**Current behavior**: No enforcement. Admin could theoretically assign the same teacher as both evaluators.

**Option A**: Strict — reject assignment of original evaluator as second evaluator at the backend level.
**Option B**: Admin responsibility — keep flexibility but add warning.
**Option C**: Auto-assign second evaluator from qualified teacher pool (no manual assignment).

**Recommendation**: Option A — blind rechecking integrity depends on evaluator distinctness.

---

## 34. On-Hold/Out-of-Scope Items

The following are explicitly excluded from this audit and any implementation:

1. **Export/Letterhead** — `docs/role-account-architecture-implementation-plan.md` section confirms ON HOLD
2. **Document Repository enhancements** — ON HOLD per requirements
3. **Parent/Guardian portal** — No V1 implementation
4. **Full permission framework replacement** — Not replacing DRF permissions
5. **Authentication architecture replacement** — JWT/cookie/OAuth architecture preserved
6. **Database schema changes** — Only proposed, not implemented (see Phases 6, 8)
7. **Frontend 401/403 page implementation** — Design proposed, no code written
8. **rate limiting expansion** — Noted but not implemented
9. **CSRF protection redesign** — Current `@csrf_exempt` pattern acceptable for API

---

*End of Audit Report*
