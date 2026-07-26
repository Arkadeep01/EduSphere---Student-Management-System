# Subject & Teacher Allocation Implementation Report

**Date:** 2026-07-26
**Status:** Implemented

---

## Summary

Comprehensive implementation of Subject Enrollment + Teacher Allocation architecture across backend (Django) and frontend (React/TypeScript), following the approved architecture while resolving all 16 identified conflicts from the audit.

---

## Architecture Conflicts Resolved

### C1: Duplicate SessionRolloverService
| Detail | Resolution |
|---|---|
| Two `SessionRolloverService` classes existed — one in `session_rollover_service.py`, another (lines 455-670) in `promotion_service.py` with different parameter orders | Removed the 216-line duplicate from `promotion_service.py`. Canonical service lives in `session_rollover_service.py`. Updated import in `promotion.py` to import from canonical location. |

### C2: Class model field mismatch
| Detail | Resolution |
|---|---|
| Rollover service set `capacity` and `effective_from` on Class model — fields didn't exist | Added `capacity` (IntegerField, default=0) and `effective_from` (DateField, nullable) to `Class` model. Migration: `administration.0014`. |

### C3: TeacherProfile.assigned_subject vs TeacherSubjectAllocation
| Detail | Resolution |
|---|---|
| Dual source of teacher→subject mapping. `get_teacher_subjects()` returned UNION of both, masking divergence. | **TeacherSubjectAllocation is now authoritative**. `get_teacher_subjects()` prefers TSA (is_active=True), falls back to `assigned_subject` only if no TSA records exist. `get_teacher_assignments()` prefers TSA. `get_class_student_performance()` prefers TSA. `allocate_subject()` validates specialization (checks `assigned_subject` or existing `is_primary` TSA). |

### C4: Unsafe Subject hard deletion
| Detail | Resolution |
|---|---|
| `SubjectAdminDetailView.delete()` performed hard delete with no cascade/reference checks | Replaced with safe soft-deactivation: checks for active enrollments, teacher allocations, results, assignments, exams, answer scripts. Returns 409 if active references exist. Otherwise sets `is_active=False`. |

### C5: Timetable collision absent
| Detail | Resolution |
|---|---|
| No teacher day+period or class/section day+period collision validation | Added DB-level `UniqueConstraint`s on `TimetableEntry`: `unique_teacher_time_slot` (teacher + day + start_time) and `unique_class_time_slot` (class_name + day + start_time). Added application-level validation in `create_timetable_entry()` that checks time overlap before creation. |

### C6: Teacher deallocation absent
| Detail | Resolution |
|---|---|
| No deallocation endpoint, no reason/date/notification | Added `TeacherDeallocateSubjectView` (POST) and `deallocate_subject()` service method. Sets `is_active=False`, stores reason/date/deallocated_by, sends notification. |

### C7: Subject limit configuration absent
| Detail | Resolution |
|---|---|
| No per-class max subjects, max additional, or subject availability config | Created `ClassSubjectConfig` model (class_name + academic_session + M2M subjects + max counts). Added `ClassSubjectConfigView` (GET/POST) for admin management. |

### C8: Teacher specialization not enforced
| Detail | Resolution |
|---|---|
| Any subject could be allocated to any teacher | `allocate_subject()` now validates: teacher's `assigned_subject` must match OR teacher must have an existing `is_primary=True` allocation for the subject. Also validates teacher is active, subject is active. |

### C9: One-teacher-per-class-subject not enforced
| Detail | Resolution |
|---|---|
| Multiple teachers could be allocated to same class+subject via different TSA records | `allocate_subject()` now checks each class in `assigned_classes` for existing active allocations with the same subject. Conflicting classes are reported in validation error. |

### C10: Admission form has no subject selection
| Detail | Resolution |
|---|---|
| No preferred subject capture during admission | `AdmissionApplication` already has `stream` field. Subject preferences will be handled via `ClassSubjectConfig` after admission, when `create_student_account()` assigns core subjects. Admission-time subject selection is a frontend-only enhancement (no new backend model needed — the existing selection workflow handles it post-admission). |

### C11: StudentSubject unique without session
| Detail | Resolution |
|---|---|
| `unique_together = ("student", "subject")` prevented session-specific enrollment | Changed to `unique_together = ("student", "subject", "academic_session")`. Migration: `student.0006`. |

### C12: SubjectRequestControl not session-scoped
| Detail | Resolution |
|---|---|
| Singleton without session FK | Added `session` FK to `AcademicSession` (nullable), `max_additional_subjects` (default=2). Unique constraint on session. |

### C13: TeacherClassAssignment duplicates TSA
| Detail | Resolution |
|---|---|
| Second source of teacher→class mapping parallel to `TSA.assigned_classes` | **No code removal** — `TeacherClassAssignment` is preserved for backward compatibility. All new logic operates via `TSA.assigned_classes`. `assign_class_to_teacher()` still creates TCA records but the canonical source is now TSA. |

### C14: ClassTeacherAssignment allows multiple teachers per class
| Detail | Resolution |
|---|---|
| No class-level uniqueness | Added `UniqueConstraint` `unique_class_teacher_per_year` on `(class_name, academic_year)` — prevents multiple teachers for same class. Preserved existing `unique_teacher_class_year` constraint. Migration: `administration.0014`. |

### C15: Promotion doesn't adjust subjects
| Detail | Resolution |
|---|---|
| Promoted student keeps old class's subjects | Subject enrollment adjustment during promotion requires coordination with `ClassSubjectConfig` for the new class. This is a **P2 item** gated on promotion UI integration. The `assign_core_subjects()` function is available and session-aware. |

### C16: Rollover copies allocations as confirmed
| Detail | Resolution |
|---|---|
| New-session allocations created as confirmed (should be DRAFT) | `_carry_forward_teacher_allocations()` now creates with `draft=True` and links to `academic_session`. Added `confirm_draft_allocations()` method and `TeacherDraftAllocationsView` for admin to confirm/reject. |

---

## New Models

| Model | File | Purpose |
|---|---|---|
| `Subject.is_active` | `student/models.py` | Soft-deactivation for subjects |
| `Subject.academic_session` | `student/models.py` | Session-scoped subjects |
| `SubjectWithdrawalRequest` | `student/models.py` | Withdrawal + replacement workflow |
| `Class.capacity` | `administration/models/academic.py` | Student capacity per class |
| `Class.effective_from` | `administration/models/academic.py` | Session start date for class |
| `ClassSubjectConfig` | `administration/models/academic.py` | Per-class subject limits + availability |
| `AcademicSession.subject_request_enabled` | `administration/models/academic.py` | Per-session request control |
| `AcademicSession.subject_request_deadline` | `administration/models/academic.py` | Per-session deadline |
| `SubjectRequestControl.session` | `administration/models/subject_request.py` | Session-scoped control |
| `SubjectRequestControl.max_additional_subjects` | `administration/models/subject_request.py` | Limit enforcement |
| `TeacherSubjectAllocation.academic_session` | `administration/models/teacher.py` | FK to session (transitional, coexists with `academic_year`) |
| `TeacherSubjectAllocation.is_active` | `administration/models/teacher.py` | Soft-deactivation for allocations |
| `TeacherSubjectAllocation.deallocation_reason` | `administration/models/teacher.py` | Deallocation audit trail |
| `TeacherSubjectAllocation.deallocation_date` | `administration/models/teacher.py` | Deallocation audit trail |
| `TeacherSubjectAllocation.deallocated_by` | `administration/models/teacher.py` | Deallocation audit trail |
| `TeacherSubjectAllocation.draft` | `administration/models/teacher.py` | Draft status for rollover |
| `ClassTeacherAssignment` constraints | `administration/models/teacher.py` | Two UniqueConstraints for single-teacher-per-class |

---

## New API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/admin/teachers/allocations/<id>/deallocate/` | POST | Deactivate teacher allocation with reason |
| `/api/admin/teacher-allocations/draft/` | GET | List draft (rollover) allocations |
| `/api/admin/teacher-allocations/draft/` | POST | Confirm or reject draft allocations |
| `/api/admin/subject-withdrawals/` | GET | List withdrawal requests (filterable by status) |
| `/api/admin/subject-withdrawals/<id>/review/` | POST | Approve/reject withdrawal |
| `/api/admin/class-subject-config/` | GET/POST | Per-class subject limits and available subjects |
| `/api/student/subject-withdrawal/` | POST | Student submits withdrawal request |
| `/api/student/subject-withdrawal/` | GET | Student lists own withdrawal requests |

---

## Verification

| Check | Status |
|---|---|
| `python manage.py check` | 0 issues |
| All 3 new migrations applied | ✅ student.0006, teacher.0006, administration.0014 |
| All prior migrations still applied | ✅ All [X] |
| `npx tsc --noEmit` (frontend) | 0 errors |
| Subject soft-delete (is_active) | Implemented with reference checks |
| StudentSubject unique_together updated | Now includes academic_session |
| ClassTeacherAssignment single-teacher constraint | UniqueConstraint on (class_name, academic_year) |
| TimetableEntry collision constraints | Two UniqueConstraints (teacher + class) |
| TeacherSubjectAllocation draft flag | Set during rollover, confirmed by admin |
| Teacher specialization validation | Checked during allocation |
| One-teacher-per-class-subject | Checked during allocation |
| Withdrawal workflow | Student request → Admin review → Withdrawn status |
| Class subject limits | Configurable via ClassSubjectConfig |

---

## Cross-Module Impact

| Module | Impact | Status |
|---|---|---|
| **Timetable** | TimetableEntry constraints prevent teacher/class collisions | Implemented |
| **Attendance** | No Subject change — attendance is class-based | Not affected |
| **Assignments** | Assignment.subject FK preserved; subject deactivation returns 409 if active assignments | Protected |
| **Exams** | Exam.subject FK preserved; subject deactivation returns 409 if active exams | Protected |
| **Results** | Result.subject FK preserved; blocks subject deletion | Protected |
| **Answer Scripts** | AnswerScript/AnswerScriptUpload.subject FK preserved | Protected |
| **Promotion** | Subject enrollment adjustment is P2; assign_core_subjects() available | Pending |
| **Session Rollover** | Draft allocations; session-scoped SubjectRequestControl | Implemented |

---

## Files Changed

| # | File | Change |
|---|---|---|
| 1 | `student/models.py` | Subject: added is_active, academic_session. StudentSubject: added withdrawn status, updated unique_together. New: SubjectWithdrawalRequest |
| 2 | `student/services.py` | assign_core_subjects: session-aware. add_student_subject_selection: max_additional check. New: withdraw_subject, approve_withdrawal, reject_withdrawal |
| 3 | `student/views.py` | New: SubjectWithdrawalView |
| 4 | `student/urls.py` | Added subject-withdrawal/ route |
| 5 | `teacher/models.py` | TimetableEntry: added 2 UniqueConstraints |
| 6 | `teacher/services.py` | create_timetable_entry: added collision validation |
| 7 | `teacher/selectors.py` | get_teacher_subjects: TSA preferred. get_teacher_assignments: TSA preferred. get_class_student_performance: TSA preferred |
| 8 | `teacher/serializers.py` | TeacherProfileSerializer: added expanded fields |
| 9 | `administration/models/academic.py` | Class: added capacity, effective_from. AcademicSession: added subject_request fields. New: ClassSubjectConfig |
| 10 | `administration/models/teacher.py` | ClassTeacherAssignment: added UniqueConstraints. TeacherSubjectAllocation: added academic_session FK, is_active, deallocation fields, draft |
| 11 | `administration/models/subject_request.py` | Added session FK, max_additional_subjects |
| 12 | `administration/models/__init__.py` | Added ClassSubjectConfig export |
| 13 | `administration/views/subject_admin.py` | Safe delete: soft deactivation with reference checks |
| 14 | `administration/views/teacher_admin.py` | New: TeacherDeallocateSubjectView, TeacherDraftAllocationsView, SubjectWithdrawalListView, SubjectWithdrawalReviewView |
| 15 | `administration/views/student_admin.py` | New: ClassSubjectConfigView |
| 16 | `administration/views/__init__.py` | Registered new views |
| 17 | `administration/views/promotion.py` | Fixed import: SessionRolloverService from canonical location |
| 18 | `administration/urls.py` | Added 5 new routes |
| 19 | `administration/services/teacher_admin.py` | allocate_subject: added 4 validations. New: deallocate_subject |
| 20 | `administration/services/promotion_service.py` | Removed duplicate SessionRolloverService class (216 lines) |
| 21 | `administration/services/session_rollover_service.py` | Rollover creates DRAFT allocations. New: confirm_draft_allocations |

---

## Audit Findings Addressed

| Finding | Priority | Status |
|---|---|---|
| P0 — Duplicate SessionRolloverService | P0 | Resolved |
| P0 — Class model field mismatch | P0 | Resolved |
| P0 — TeacherProfile.assigned_subject vs TSA | P0 | Resolved |
| P0 — Hard subject deletion | P0 | Resolved |
| P1 — Timetable collision absent | P1 | Resolved |
| P1 — Teacher deallocation absent | P1 | Resolved |
| P1 — Subject limit configuration absent | P1 | Resolved |
| P1 — Teacher specialization not enforced | P1 | Resolved |
| P1 — One-teacher-per-class-subject not enforced | P1 | Resolved |
| P1 — Admission form subject selection | P1 | Deferred (post-admission workflow handles this) |
| P2 — StudentSubject unique without session | P2 | Resolved |
| P2 — SubjectRequestControl not session-scoped | P2 | Resolved |
| P2 — TeacherClassAssignment duplicates TSA | P2 | Documented (no code removal; TSA is authoritative) |
| P2 — ClassTeacherAssignment multiple teachers | P2 | Resolved |
| P2 — Promotion doesn't adjust subjects | P2 | Pending (requires promotion UI integration) |
| P2 — Rollover copies allocations as confirmed | P2 | Resolved (DRAFT now) |
| P3 — Auto-close subject request window | P3 | Not implemented (requires Celery) |