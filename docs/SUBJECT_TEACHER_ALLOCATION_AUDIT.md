# Subject & Teacher Allocation Architecture Audit

## 1. Executive Summary

Comprehensive audit of EduSphere's Subject Management, Teacher Allocation, Student Subject Enrollment, Admission Subject Selection, Timetable Collision, and Academic Session Rollover systems. The system has significant architectural strengths (Subject tier classification, StudentSubject lifecycle states, TeacherSubjectAllocation model) but contains critical gaps: duplicate SessionRolloverService implementations, no timetable collision validation, missing subject limit configuration, no Teacher specialization restriction, admission form lacks subject selection, and `TeacherProfile.assigned_subject` vs `TeacherSubjectAllocation` dual-source conflict.

---

## 2. Current Subject Architecture

### 2.1 Subject Model (`student/models.py:6-25`)

**WORKING** — The `Subject` model supports the required tier structure:

```
TIER_CHOICES = [("core", "Core"), ("specialized", "Specialized"), ("enrichment", "Enrichment")]
```

**Fields:** `name`, `code` (unique=True), `tier`, `teacher_name`, `description`, `color`, `progress`

**Strengths:**
- Three-tier classification already exists
- `code` has `unique=True` constraint — no duplicate codes
- `teacher_name` is a plain CharField (display-only, NOT relational)

**Gaps:**
- No `is_active` or `is_archived` field for soft-deactivation
- No `academic_session` FK — subjects are session-agnostic
- No `class` relationship — subjects are not associated with specific classes
- `delete()` is hard deletion — no protection for referenced subjects
- No validation that prevents deletion of subjects with active enrollments

### 2.2 Subject CRUD (`administration/views/subject_admin.py`)

**WORKING** — Full CRUD with `SubjectAdminListView` (GET/POST) and `SubjectAdminDetailView` (GET/PATCH/DELETE).

**Risky operations:**
- `delete()` at line 56 performs hard delete with NO cascade checks
- Subject can be deleted while students are enrolled and teachers are allocated
- No validation for existing references in: StudentSubject, TeacherSubjectAllocation, Result, Exam, AnswerScriptUpload, Assignment, Timetable, TimetableEntry

### 2.3 Subject Uniqueness

```
Subject.code — unique=True (enforced at DB level)
Subject.name — NO uniqueness constraint
```

No composite unique constraint on `(name, tier)` or `(code, academic_session)`.

---

## 3. Current Student Enrollment Architecture

### 3.1 StudentSubject Model (`student/models.py:54-88`)

**WORKING** — Model supports rich lifecycle states:

```
STATUS_CHOICES = [
    ("pending", "Pending Admin Approval"),
    ("approved", "Approved"),
    ("rejected", "Rejected"),
    ("selected", "Selected"),
    ("request_pending", "Request Pending"),
    ("not_selected", "Not Selected"),
]
```

**Fields:** `student` (FK→StudentProfile), `subject` (FK→Subject), `academic_session` (FK→AcademicSession, nullable), `status`, `assigned_by_admin`, `created_at`, `updated_at`

**Uniqueness:** `unique_together = ("student", "subject")` — one record per student+subject

### 3.2 Current State Mapping to Target Lifecycle

| Target State | Current Status | Notes |
|---|---|---|
| AVAILABLE | (not stored — subject exists in Subject table) | Not explicitly modeled |
| SELECTED/REQUESTED | `pending` | Student selects via `SubjectSelectionView` |
| APPROVED | `approved` | Admin approves via `StudentSubjectApprovalView` |
| ENROLLED | `approved` + `assigned_by_admin=True` | Same status, distinguished by flag |
| REJECTED | `rejected` | Admin rejects |
| WITHDRAWN | (no status) | **MISSING** — no withdrawal state |

**Gaps:**
- No `withdrawn` status in STATUS_CHOICES
- No replacement workflow
- No marks/assessment check before withdrawal
- `unique_together = ("student", "subject")` blocks re-enrollment after withdrawal

### 3.3 StudentSubject Uniqueness Issue

`unique_together = ("student", "subject")` means a student can have at most ONE record per subject. This prevents:
- Same subject in different sessions
- Re-adding a withdrawn/rejected subject
- Session-specific enrollment records

**Missing: session in unique constraint.** The `academic_session` FK is nullable and not part of the unique constraint.

---

## 4. Admission Subject Selection

### 4.1 Admission Application Model (`administration/models/admission.py`)

**PARTIAL** — The `AdmissionApplication` model has applicant fields but:
- **No subject selection fields** — no `preferred_subjects` or `subject_preferences` JSON field
- `marks_json` exists but is for previous exam marks, not subject preferences
- No `stream` properly linked to subjects
- `AdmissionForm` frontend (`admissionForms.tsx`) has NO subject selection at all
- Stream selection is hardcoded: "Science", "Arts", "Commerce" — NOT sourced from Subject master

### 4.2 Admission Create Student Flow (`admission_admin.py:60-78`)

When admin creates student from application:
1. Creates StudentProfile with personal data
2. Calls `assign_core_subjects(profile)` — auto-enrolls in ALL core subjects
3. **No specialized/enriched subject enrollment** — student gets only core subjects
4. No admission preferences are carried forward to StudentSubject

### 4.3 Frontend Admission Form (`admissionForms.tsx`)

**MISSING:**
- No subject category selection (specialized, enriched)
- No subject master query
- Stream selection is hardcoded radio buttons
- Form saves to client-side `admission-store.ts` only
- No backend API submission

---

## 5. Additional Subject Request Workflow

### 5.1 Student Subject Selection (`student/views.py:110-147`)

**WORKING** — `SubjectSelectionView` with controls:
- Checks `SubjectRequestControl.enabled` before allowing
- Checks `start_date`/`end_date` boundaries
- Validates elective counts (min 2 specialized, min 1 enriched)
- Creates StudentSubject records with `status="pending"`
- Admins approve via `StudentSubjectApprovalView`

### 5.2 Subject Request Control (`administration/models/subject_request.py`)

**PARTIAL** — Has `enabled`, `start_date`, `end_date` fields but:
- **No automatic deadline enforcement** — `end_date` is checked in view but no cron/celery task for auto-closure
- **No maximum additional subjects limit** (target: max 2)
- **No per-student limit enforcement**
- **No session linkage** — `SubjectRequestControl` has no FK to `AcademicSession`

### 5.3 Limitations

| Feature | Status |
|---------|--------|
| Global enable/disable | ✅ WORKING |
| Start/end date boundaries | ✅ WORKING |
| Auto-closure at deadline | ❌ MISSING — manual only |
| Max additional subjects (2) | ❌ MISSING — no limit enforced |
| Per-student limit check | ❌ MISSING |
| Session-scoped requests | ❌ MISSING |
| Auto-approval | ✅ NOT PRESENT — correct per business rules |

---

## 6. Replacement/Withdrawal Workflow

**MISSING** — No replacement or withdrawal workflow exists:

- No `withdrawn` status in StudentSubject
- No replacement request model
- No UI for requesting subject change
- No admin approval panel for replacements
- No validation that blocks withdrawal when marks/assessments exist

---

## 7. Subject Limit Configuration

**MISSING** — No configuration exists for:
- Maximum subjects per student
- Maximum additional subjects (target: 2)
- Per-class subject limits

---

## 8. Teacher Specialization Architecture

### 8.1 TeacherProfile.assigned_subject (`teacher/models.py:13-20`)

**WORKING** — FK to Subject, intended as teacher's primary specialization.
- `on_delete=SET_NULL` — preserves records if subject deleted
- `related_name="teachers"`

### 8.2 TeacherSubjectAllocation (`administration/models/teacher.py:24-49`)

**WORKING** — The authoritative allocation model (per architecture decision):
- `teacher` FK→TeacherProfile
- `subject` FK→Subject
- `assigned_classes` JSONField (list of class names)
- `academic_year` CharField (not FK to AcademicSession)

**Uniqueness:** `unique_together = ("teacher", "subject", "academic_year")`
- One allocation per teacher+subject+year
- But a teacher CAN have allocations for multiple subjects (conflicts with "one subject per teacher" rule)
- Same subject with same teacher across multiple classes → stored as single record with JSON array

### 8.3 TeacherClassAssignment (`teacher/models.py:33-48`)

**OBSOLETE/DUAL** — Parallel class assignment model:
- `teacher` FK→TeacherProfile
- `class_name` CharField
- `unique_together = ("teacher", "class_name")`

This is a SECOND source of teacher→class mapping, separate from TeacherSubjectAllocation.assigned_classes.

**Conflict:** A teacher's classes can be stored in BOTH:
1. `TeacherClassAssignment` records
2. `TeacherSubjectAllocation.assigned_classes` JSONField

---

## 9. Teacher Allocation Architecture

### 9.1 Allocation Panel UI (`admin.teachers.tsx`)

**WORKING** — The `admin.teachers.tsx` page has:
- `AllocateSubjectForm` component (dialog-based)
- Teacher selection dropdown
- Subject selection dropdown
- Class multi-select badges
- `teacherAdminApi.allocateSubject()` → `TeacherAllocateSubjectView`

### 9.2 Allocation Backend (`teacher_admin.py:55-64`)

```python
def allocate_subject(teacher_id, subject_id, assigned_classes, academic_year):
    obj, _ = TeacherSubjectAllocation.objects.get_or_create(
        teacher=teacher, subject=subject, academic_year=academic_year,
        defaults={"assigned_classes": assigned_classes},
    )
```

**Critical gap:** `get_or_create` with NO update of `assigned_classes` if record already exists. If allocation exists, new classes are IGNORED.

### 9.3 Missing Allocation Validations

| Validation | Status |
|-----------|--------|
| Teacher specialization matches subject | ❌ MISSING — any subject can be allocated to any teacher |
| Active Teacher check | ❌ MISSING |
| Valid Subject check | ❌ MISSING |
| Valid Class check | ❌ MISSING |
| Valid AcademicSession check | ❌ MISSING — uses CharField, no FK |
| Duplicate detection (same class/subject) | ✅ PARTIAL — `unique_together` prevents teacher duplicate but not class duplicate |
| One teacher per class+subject | ❌ MISSING — multiple teachers can be allocated to same class+subject via different records |

### 9.4 Allocation Authority

- **Admin** — full access via `IsAdmin` permission
- **Staff** — no allocation endpoints exposed
- **Teacher** — read-only via `get_teacher_subjects()` in selectors

---

## 10. Teacher Deallocation

**MISSING** — No deallocation endpoint exists:
- `TeacherAllocateSubjectView` only has POST (create), no DELETE/PATCH for deactivation
- No `effective_date` or `reason` fields in `TeacherSubjectAllocation`
- No deallocation notification
- No `is_active` field — allocations cannot be soft-deactivated

---

## 11. Class Teacher Architecture

### 11.1 ClassTeacherAssignment Model (`administration/models/teacher.py:5-21`)

**WORKING** — Separate model for Class Teacher role:
```
Fields: teacher (FK), class_name (CharField), academic_year (CharField), assigned_at
Unique: (teacher, class_name, academic_year)
```

### 11.2 Constraints

- **Class-level (not section):** `class_name` stores e.g. "X" not "X-A" — per business rule ✅
- **One class per teacher per year:** `unique_together` allows only one assignment ✅
- **Multiple teachers for same class?** `unique_together` is on teacher+class — another teacher CAN be assigned to same class ❌
- **Class Teacher UI:** Present in `admin.teachers.tsx` via `AssignClassTeacherForm` ✅
- **API:** `TeacherAssignClassTeacherView` via POST + `TeacherClassTeacherAssignmentsView` via GET ✅

### 11.3 Gap

The `unique_together` does NOT prevent multiple teachers from being assigned as Class Teacher for the same class in the same year. A `unique_together = ("class_name", "academic_year")` constraint would be needed (but would then limit to one teacher per class).

---

## 12. Timetable Collision Handling

### 12.1 Timetable Models

Two separate timetable models exist:

**Teacher-side:** `TimetableEntry` (`teacher/models.py:51-86`)
```
teacher, day_of_week, start_time, end_time, class_name, session_type, room, is_library_converted
```
**NO unique constraints** — `unique_together` is empty.

**Student-side:** `Timetable` (`student/models.py:242-259`)
```
student, day_of_week, start_time, end_time, subject, room, is_library_session
```
**NO unique constraints.**

### 12.2 Collision Validation

**MISSING** — No collision validation exists anywhere:
- `create_timetable_entry()` in `teacher/services.py:29-40` just creates the record with no overlap check
- No teacher day+period collision check
- No class/section day+period collision check
- No room collision check (V1 design decision — skip room collision)
- No database constraints for collision prevention

### 12.3 Library Session Collision

**PARTIAL** — `check_library_availability()` in `teacher/services.py:43-51` checks room overlap for LibrarySession only, not for regular TimetableEntry.

---

## 13. Session Rollover

### 13.1 CRITICAL CONFLICT — Duplicate SessionRolloverService

Two SEPARATE `SessionRolloverService` classes exist with DIFFERENT implementations:

**File 1: `administration/services/session_rollover_service.py`**
- Uses `from_session`/`to_session` parameters correctly
- `_carry_forward_subjects` copies StudentSubject from `from_session` to `to_session`
- `_carry_forward_class_structure` has `capacity=cls.capacity` — **BUG: Class model has no `capacity` field**
- Single class definition with all methods

**File 2: `administration/services/promotion_service.py` (lines 455-670)**
- Same class name — DUPLICATE
- `_carry_forward_subjects(self, to_session, from_session=None)` — parameter order is DIFFERENT (swapped)
- `_process_rollover` calls `_carry_forward_subjects(to_session, from_session)` — WRONG parameter order
- `_carry_forward_academic_settings` — additional method not in the other implementation
- References `GradeBoundary` and duplicates them (which may not be intended)

**Impact:** Depending on which view imports which service, rollover behavior is UNPREDICTABLE.

### 13.2 Session Rollover Student Subjects

- `StudentSubject` records are copied from `from_session` to `to_session` with `status="not_selected"` and `assigned_by_admin=False`
- **Gap:** Core subjects are copied as `not_selected` — no mechanism to auto-assign core subjects for the new session's class structure
- **Gap:** Old optional choices are copied forward as `not_selected` — this is acceptable per business rules (students re-select)

### 13.3 Session Rollover Teacher Allocations

- `TeacherSubjectAllocation` records are copied with `academic_year=to_session.name`
- **No draft status** — copied as confirmed (should be DRAFT requiring admin verification)
- AcademicSessionRollover model has COPY_CHOICES including "teachers" but rollover creates confirmed records

### 13.4 Promotion Service (`administration/services/promotion_service.py`)

**WORKING** — Core promotion logic:
- `PromotionService.promote_student()` — updates StudentProfile.class_assigned, creates PromotionLog + StudentPromotionHistory
- `RepeatDetainService` — handles repeat/detain with rollback
- `BulkPromotionService` — batch promotion
- All create proper AuditLog entries and notifications
- **Gap:** Subject enrollment is NOT adjusted during promotion — student keeps old subjects

---

## 14. Frontend Audit

| Page | Path | Status | Details |
|------|------|--------|---------|
| Admin Subject Management | `/admin/subjects` | ✅ WORKING | Full CRUD, real API, tier display |
| Admin Teacher Management | `/admin/teachers` | ✅ WORKING | Real API, allocation tab, class teacher tab |
| Admin Class Management | `/admin/classes` | ✅ WORKING | Real API, class detail with subjects/teachers |
| Admin Students | `/admin/students` | ⚠️ MOCK-DISCONNECTED | Uses mock data, not real API |
| Admin Promotions | `/admin/promotions` | ✅ WORKING | Real API, multiple sub-routes |
| Admin Session Rollover | `/admin/promotions/rollover` | ✅ WORKING | Uses `AcademicSessionRolloverView` |
| Admin Admissions | `/admin/admissions` | ⚠️ MOCK-DISCONNECTED | Uses mock data |
| Student Subjects | `/student/subjects` | ✅ WORKING | Real API, tier-based browsing, request flow |
| Student Dashboard | `/student/dashboard` | ✅ WORKING | Real hooks |
| Student Results | `/student/results` | ❌ MOCK-FALLBACK | Falls back to mock data |
| Student Fees | `/student/fees` | ✅ WORKING | Real API |
| Teacher Dashboard | `/teacher/dashboard` | ✅ WORKING | Real hooks |
| Teacher Subjects | `/teacher/subjects` | ❌ MOCK-DEPENDENT | Uses mock fallback |
| Teacher Profile | `/teacher/profile` | ✅ WORKING | Real API |
| Admission Form | `/admissionForms` | ❌ DISCONNECTED | No backend, no subject selection |
| Public Register | `/register` | ❌ CONFLICTING | Public signup violates domain rules |

**Key finding:** Staff portal (7/7 pages) is the only fully migrated portal. Admin portal has the most mock-dependent pages.

---

## 15. API Audit

| Endpoint | Method | View | Model(s) | Status |
|----------|--------|------|----------|--------|
| `/api/admin/subjects/` | GET/POST | SubjectAdminListView | Subject | ✅ WORKING |
| `/api/admin/subjects/{id}/` | GET/PATCH/DELETE | SubjectAdminDetailView | Subject | ✅ WORKING (risky delete) |
| `/api/admin/teachers/` | GET/POST | TeacherListView | TeacherProfile | ✅ WORKING |
| `/api/admin/teachers/{id}/` | GET/PATCH | TeacherDetailView | TeacherProfile | ✅ WORKING |
| `/api/admin/teachers/{id}/allocate-subject/` | POST | TeacherAllocateSubjectView | TeacherSubjectAllocation | ✅ WORKING (no validations) |
| `/api/admin/teachers/{id}/assign-class-teacher/` | POST | TeacherAssignClassTeacherView | ClassTeacherAssignment | ✅ WORKING |
| `/api/admin/teacher-allocations/` | GET | TeacherAllocationsView | TeacherSubjectAllocation | ✅ WORKING |
| `/api/admin/class-teacher-assignments/` | GET | TeacherClassTeacherAssignmentsView | ClassTeacherAssignment | ✅ WORKING |
| `/api/admin/students/{id}/approve-subjects/` | POST | StudentSubjectApprovalView | StudentSubject | ✅ WORKING |
| `/api/admin/students/{id}/assign-subjects/` | POST | StudentSubjectAssignmentView | StudentSubject | ✅ WORKING |
| `/api/admin/subject-requests/pending/` | GET | PendingSubjectRequestsListView | StudentSubject | ✅ WORKING |
| `/api/admin/subject-request-control/` | GET/PATCH | SubjectRequestControlView | SubjectRequestControl | ✅ WORKING |
| `/api/admin/sessions/` | GET/POST | AcademicSessionListView | AcademicSession | ✅ WORKING |
| `/api/admin/promotions/rollover/` | POST | AcademicSessionRolloverView | AcademicSessionRollover | ⚠️ DUPLICATE SERVICE |
| `/api/student/subjects/` | GET | SubjectListView | Subject | ✅ WORKING |
| `/api/student/subjects/my/` | GET | MySubjectsView | Subject, StudentSubject | ✅ WORKING |
| `/api/student/subjects/select/` | POST | SubjectSelectionView | StudentSubject | ✅ WORKING |
| `/api/student/subject-request-status/` | GET | SubjectRequestStatusView | SubjectRequestControl | ✅ WORKING |

---

## 16. Database/Constraint Audit

| Model | Field | Constraint | Status |
|-------|-------|-----------|--------|
| Subject | code | unique=True | ✅ Enforced |
| Subject | name | No unique | ❌ No constraint |
| StudentSubject | (student, subject) | unique_together | ⚠️ Missing session |
| TeacherSubjectAllocation | (teacher, subject, academic_year) | unique_together | ✅ But no class-section uniqueness |
| TeacherClassAssignment | (teacher, class_name) | unique_together | ✅ |
| ClassTeacherAssignment | (teacher, class_name, academic_year) | unique_together | ❌ Doesn't prevent multi-teacher per class |
| Class | (name, academic_session) | unique_together | ✅ |
| TimetableEntry | (none) | No constraints | ❌ No collision prevention |
| Timetable (student) | (none) | No constraints | ❌ No collision prevention |
| LibrarySession | (room, date, start_time, end_time) | unique_together | ✅ Room booking only |
| SubjectRequestControl | singleton (pk=1) | Application-level | ⚠️ Not DB-enforced |

---

## 17. TeacherProfile.assigned_subject Conflict Trace

### Every reference to both fields:

**Reads `TeacherProfile.assigned_subject`:**
1. `teacher/models.py:14` — field definition
2. `teacher/selectors.py:16` — `get_teacher_subjects()` reads it
3. `teacher/selectors.py:136` — `get_teacher_assignments()` reads it
4. `teacher/selectors.py:151` — `get_class_student_performance()` reads it
5. `teacher/views.py:43` — `TeacherDashboard` uses `get_or_create_teacher_profile` (no assigned_subject read directly)
6. `teacher/serializers.py` — likely serializes it
7. `administration/services/teacher_admin.py:14` — `list_teachers()` select_related("assigned_subject")
8. `administration/services/teacher_admin.py:18` — `get_teacher_detail()` select_related("assigned_subject")
9. `administration/services/teacher_admin.py:32` — `create_teacher()` writes `assigned_subject_id`
10. `administration/selectors/teacher_admin.py` — likely reads it
11. `teacher/services.py:187-189` — `get_available_teachers_for_subject()` uses it

**Reads `TeacherSubjectAllocation`:**
1. `administration/models/teacher.py:24` — class definition
2. `administration/services/teacher_admin.py:56-65` — `allocate_subject()` creates/reads
3. `administration/services/teacher_admin.py:77-78` — `get_allocations()` reads
4. `administration/views/teacher_admin.py:98-104` — `TeacherAllocationsView` reads
5. `teacher/selectors.py:14-19` — `get_teacher_subjects()` reads and UNIONS with assigned_subject
6. `administration/services/student_admin.py:123-130` — `_notify_teachers_for_subject()` reads
7. `administration/services/session_rollover_service.py:124-135` — rollover copies TSA records
8. `administration/services/promotion_service.py:609-620` — duplicate rollover copies TSA records

**Writes `TeacherProfile.assigned_subject`:**
1. `administration/services/teacher_admin.py:32` — `create_teacher()` sets it

**Writes `TeacherSubjectAllocation`:**
1. `administration/services/teacher_admin.py:56-65` — `allocate_subject()` creates with `get_or_create`
2. `administration/services/session_rollover_service.py:129-134` — rollover copies
3. `administration/services/promotion_service.py:614-619` — duplicate rollover copies

**Where values may diverge:**
- If a teacher is created with `assigned_subject=Mathematics` but later allocated to Physics via `TeacherSubjectAllocation`, the specialization says Mathematics but the allocation says Physics
- `get_teacher_subjects()` returns the UNION of both — masking the conflict

---

## 18. Cross-Module Impact

| Module | Subject Change Impact | Allocation Change Impact |
|--------|----------------------|------------------------|
| **Admission** | Subject master changes affect admission preferences | N/A |
| **Student Profile** | Subject enrollment changes affect dashboard/display | N/A |
| **Teacher Profile** | Subject deletion breaks `assigned_subject` FK (SET_NULL) | Allocation changes affect displayed classes |
| **Timetable** | Subject deletion breaks timetable entry FK | Teacher allocation changes invalidate timetable |
| **Attendance** | N/A (attendance is class-based) | Teacher reallocation affects attendance marking |
| **Assignments** | Subject deletion cascades? No — Assignment has FK to Subject | Teacher change affects assignment ownership |
| **Exams** | Subject deletion breaks Exam.subject FK (SET_NULL) | Teacher change affects exam evaluation |
| **Results** | Subject deletion breaks Result.subject FK | N/A |
| **AnswerScripts** | Subject deletion breaks AnswerScriptUpload.subject FK | Teacher reallocation breaks evaluation assignment |
| **Promotion** | Subject enrollment not adjusted during promotion | Teacher allocation not adjusted |
| **Session Rollover** | StudentSubject copies forward | TeacherSubjectAllocation copies forward |

**Critical finding:** Subject deletion cascades to 8+ related models with varying `on_delete` behaviors (CASCADE, SET_NULL, PROTECT not used).

---

## 19. Git History Findings

### Key Commits:
- `99f5a0b` — v1.0.0 mock-era baseline
- `fcaa53f` — v1.0.1 current HEAD
- `51b73f7` — Student/Teacher Panel
- `638bb2e` — Admin Panel

### Historical Subject Features:
- `admin.students.tsx` in v1.0.0 had full TanStack Query implementation with real API calls. Current version regressed to mock data.
- `admin.subjects.tsx` has always been real-API (never had mock data)
- `student.subjects.tsx` has always been real-API (never had mock data)
- `student.results.tsx` had mock fallback since v1.0.0 — unchanged
- `SubjectRequestControl` model was added after v1.0.0

---

## 20. Critical Conflicts

### P0 Conflicts

| # | Conflict | Description | Files Affected |
|---|----------|-------------|----------------|
| C1 | **Duplicate SessionRolloverService** | Two classes with same name, different implementations, different parameter orders | `services/session_rollover_service.py`, `services/promotion_service.py` |
| C2 | **Class model field mismatch** | Rollover service sets `capacity` and `effective_from` on Class model — fields don't exist | `services/session_rollover_service.py:180-181` |
| C3 | **TeacherProfile.assigned_subject vs TSA** | Dual source of teacher→subject mapping, UNION in selectors masks divergence | 15 files across teacher + administration apps |
| C4 | **Hard subject deletion** | No protection against deleting subjects with active enrollments/allocation | `views/subject_admin.py:55-56` |

### P1 Conflicts

| # | Conflict | Description |
|---|----------|-------------|
| C5 | **Timetable collision absent** | No teacher, class/section, or room collision validation |
| C6 | **Teacher deallocation absent** | No deactivation, effective date, reason, or notification |
| C7 | **Subject limit configuration absent** | No max subjects, max additional, or per-class limits |
| C8 | **Teacher specialization not enforced** | Any teacher can be allocated any subject |
| C9 | **One-teacher-per-class-subject not enforced** | Multiple teachers can be allocated same class+subject |
| C10 | **Admission form has no subject selection** | No preferred subject capture during admission |

### P2 Conflicts

| # | Conflict | Description |
|---|----------|-------------|
| C11 | **StudentSubject unique without session** | `(student, subject)` prevents session-specific enrollment |
| C12 | **SubjectRequestControl not session-scoped** | Singleton record without session FK |
| C13 | **TeacherClassAssignment duplicates TSA** | Second source of teacher→class mapping |
| C14 | **ClassTeacherAssignment allows multiple teachers per class** | No class-level uniqueness |
| C15 | **Promotion doesn't adjust subjects** | Promoted student keeps old class's subjects |
| C16 | **Rollover copies allocations as confirmed** | Should be DRAFT requiring admin verification |

---

## 21. Missing Functionality

| Feature | Priority | Impact |
|---------|----------|--------|
| Subject deactivation/archive (soft delete) | P1 | Prevents data loss |
| Subject-class association | P1 | Core subjects per class currently not defined |
| Per-class subject limit configuration | P1 | Required for enrollment validation |
| Maximum additional subjects (2) enforcement | P1 | Business rule requirement |
| Withdrawal workflow with marks check | P1 | Prevents academic record corruption |
| Teacher specialization validation in allocation | P1 | Prevents out-of-specialization teaching |
| Teacher deallocation with reason/date/notification | P1 | Required for teacher lifecycle |
| Timetable collision (teacher) | P1 | Required for scheduling integrity |
| Timetable collision (class/section) | P1 | Required for scheduling integrity |
| Admission subject preferences | P1 | Required for admission pipeline |
| Rollover → DRAFT allocations | P1 | Required for admin verification |
| StudentSubject session-scoped uniqueness | P2 | Prevents session ambiguity |
| Withdrawn status in StudentSubject | P2 | Required for lifecycle completion |
| Auto-close subject request window | P2 | Deadline enforcement |
| Promotion → subject re-enrollment | P2 | Students get new class's subjects |
| Class teacher single-assignment constraint | P2 | Prevents ambiguous class teacher |

---

## 22. Existing Functionality That Should Be Preserved

| Feature | File | Reason to Preserve |
|---------|------|--------------------|
| Subject tier classification | `student/models.py:7-11` | Three-tier system exactly matches requirements |
| StudentSubject lifecycle states | `student/models.py:55-62` | Rich state model covering request→approval flow |
| Subject request control with dates | `administration/models/subject_request.py` | Enable/disable + date boundaries |
| Subject selection validation (min counts) | `student/services.py:47-60` | Validates 2 specialized + 1 enriched |
| Student subjects page with browse/request | `student.subjects.tsx` | Tier-based browsing + request UI |
| Admin teacher allocation tab | `admin.teachers.tsx` | Allocation panel with teacher/subject/class selection |
| Admin class teacher assignment tab | `admin.teachers.tsx` | Class teacher assignment panel |
| TeacherSubjectAllocation model | `administration/models/teacher.py` | Per architecture decision — will be source of truth |
| StudentSubject approval/rejection API | `views/student_admin.py` | Admin review workflow |
| Notification on subject approval | `services/student_admin.py:56-65` | Notifies student + teachers |
| AcademicSession model | `administration/models/academic.py` | Session management with is_current/is_archived |
| PromotionLog + StudentPromotionHistory | `administration/models/promotion.py` | Complete promotion audit trail |
| AcademicSessionRollover model | `administration/models/promotion.py` | Rollover tracking with status/copy options |

---

## 23. Questions Requiring User Decision

| # | Question | Context |
|---|----------|---------|
| Q1 | Which `SessionRolloverService` should be canonical? | Two duplicate implementations exist with different parameter orders. The one in `session_rollover_service.py` appears more correct, but both need reconciliation. |
| Q2 | Should `TeacherSubjectAllocation` remain `academic_year` CharField or become FK→AcademicSession? | Currently CharField; FK would provide referential integrity. |
| Q3 | Should `StudentSubject` unique constraint include `academic_session`? | Currently `(student, subject)` without session. Adding session would allow same subject in different years. |
| Q4 | Should `TeacherProfile.assigned_subject` be deprecated in favor of `TeacherSubjectAllocation`? | Per architecture decision, TSA is source of truth. When should the migration happen? |
| Q5 | What should happen to existing `assigned_subject` data during migration? | Options: (a) create TSA records from existing values, (b) keep as specialization reference only |
| Q6 | Should `ClassTeacherAssignment` prevent multiple teachers per class? | Currently allows it. Business rule says one class teacher per class. |
| Q7 | Should subject deletion be blocked or soft? | Currently hard delete. Blocking with error message vs soft-deactivation with `is_active=False` vs archiving. |
| Q8 | Should timetable collision be stored in DB constraints or application-level? | Application-level is more flexible; DB constraints are safer. |
| Q9 | Should rollover teacher allocations be created as DRAFT? | Currently created as confirmed. Business rule requires admin verification. |
| Q10 | Should `TeacherClassAssignment` model be deprecated in favor of `TeacherSubjectAllocation.assigned_classes`? | Dual source of class assignment. One should be canonical. |

---

## 24. Recommended Implementation Order

1. **P0 — Fix duplicate SessionRolloverService** (consolidate to one)
2. **P0 — Fix Class model field mismatch** (remove capacity/effective_from or add fields)
3. **P0 — Add subject deletion protection** (block if referenced)
4. **P1 — Teacher specialization validation** (check subject matches allocation)
5. **P1 — One-teacher-per-class-subject enforcement** (unique constraint or validation)
6. **P1 — Timetable collision validation** (teacher + class/section)
7. **P1 — Teacher deallocation** (reason, effective date, notification)
8. **P1 — Subject limit configuration** (per-class max subjects, max additional)
9. **P1 — Withdrawal workflow** (status, marks check, admin approval)
10. **P1 — Admission subject preferences** (Subject-master-sourced selection in admission form)
11. **P2 — StudentSubject session-scoped uniqueness**
12. **P2 — Rollover DRAFT allocations**
13. **P2 — Promotion subject re-enrollment**
14. **P2 — TeacherProfile.assigned_subject → TSA migration**
15. **P2 — TeacherClassAssignment deprecation**
16. **P3 — Auto-close subject request window** (Celery task)
17. **P3 — ClassTeacherAssignment single-teacher constraint**

---

## 25. Final Status Matrix

| Requirement | Status | Implementation | Gap | Files Affected | DB Impact | Cross-Module Impact | Priority | User Decision? |
|------------|--------|---------------|-----|---------------|-----------|-------------------|----------|---------------|
| 3-tier subject classification | WORKING | Subject.tier field | None | student/models.py | None | Enrollment, Admission | — | No |
| Subject master CRUD | WORKING | SubjectAdminListView/DetailView | Hard deletion, no soft-delete | views/subject_admin.py, admin.subjects.tsx | Yes — delete behavior | All modules referencing Subject | P0 | Q7 |
| Core auto-assignment | WORKING | assign_core_subjects() | No per-class core subject config | student/services.py | None | Admission, Enrollment | P1 | No |
| Subject selection (specialized/enriched) | WORKING | student.subjects.tsx + SubjectSelectionView | No admission-time selection | student/views.py, student.subjects.tsx | None | Admission | P1 | No |
| Additional subject request (max 2) | MISSING | — | No limit enforcement | student/services.py | None | StudentSubject | P1 | No |
| Subject request control (dates) | PARTIAL | SubjectRequestControl | No session scope, no auto-close | models/subject_request.py | Yes — needs session FK | Student enrollment | P1 | No |
| Subject withdrawal | MISSING | — | No status, no workflow, no marks check | student/models.py | Yes — new status | Results, Assignments | P1 | No |
| Subject replacement | MISSING | — | No workflow | — | Yes — new model/endpoints | StudentSubject | P1 | No |
| Subject limit config | MISSING | — | No per-class limits | — | Yes — new model | Enrollment | P1 | Q3 |
| Teacher specialization | WORKING | TeacherProfile.assigned_subject | Not enforced in allocation | teacher/models.py, teacher_admin.py | Yes — potential migration | Allocation | P1 | Q4, Q5 |
| Teacher allocation (TSA) | WORKING | TeacherSubjectAllocation | No specializ. check, no dealloc., no TSA→AcademicSession FK | admin/models/teacher.py, services/teacher_admin.py | Yes — FK vs CharField | Timetable, Exams | P1 | Q2 |
| Teacher deallocation | MISSING | — | No endpoint, no reason/date/notification | — | Yes — new fields | Timetable, Attendance | P1 | No |
| One teacher per class-subject | CONFLICTING | unique_together insufficient | Multi-teacher possible for same class+subject | admin/models/teacher.py | Yes — constraint change | Timetable | P1 | No |
| Class Teacher assignment | WORKING | ClassTeacherAssignment | Multiple teachers per class possible | admin/models/teacher.py | Yes — constraint change | Student profile | P2 | Q6 |
| Timetable collision (teacher) | MISSING | — | No validation | teacher/services.py | No | TimetableEntry | P1 | Q8 |
| Timetable collision (class/section) | MISSING | — | No validation | teacher/services.py | No | TimetableEntry | P1 | Q8 |
| Subject-allocation separation | WORKING | Allocation ≠ timetable | No validation issues | Various | No | — | — | No |
| Allocation authority | WORKING | IsAdmin permission | OK | Various | No | — | — | No |
| Session rollover (teacher) | CONFLICTING | Duplicate services | Different implementations | services/session_rollover_service.py, services/promotion_service.py | Yes — inconsistent behavior | All rollover | P0 | Q1 |
| Session rollover (student subjects) | PARTIAL | Copies StudentSubject | Core subjects not reassigned | services/session_rollover_service.py | None | Student enrollment | P1 | No |
| Session rollover → DRAFT | MISSING | Creates confirmed | No admin verification step | services/session_rollover_service.py | Yes — status | Allocations | P1 | Q9 |
| Promotion → subject adjustment | MISSING | — | Students keep old subjects | — | None | StudentSubject | P2 | No |
| Historical ownership | WORKING | Records are session-scoped | Generally OK | Various | No | — | — | No |
| Subject deactivation edge case | MISSING | Hard delete | No retirement mechanism | views/subject_admin.py | Yes — new field | All subject references | P1 | Q7 |
| Admission subject preferences | MISSING | — | No subject selection in form | admissionForms.tsx | No | Admission | P1 | No |
| TeacherProfile + TSA dual source | CONFLICTING | Both exist | Values can diverge | teacher/models.py, admin/models/teacher.py | Yes — migration needed | All teacher features | P0 | Q4, Q5 |
| TeacherClassAssignment + TSA.assigned_classes | CONFLICTING | Both exist | Dual class assignment source | teacher/models.py, admin/models/teacher.py | Yes — deprecation | Teacher classes | P2 | Q10 |
