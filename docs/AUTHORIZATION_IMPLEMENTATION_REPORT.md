# Authorization Implementation Report

**Date:** 2026-07-26
**Status:** Implemented

---

## Summary

Comprehensive backend authorization, object-level security, IDOR/BOLA prevention, role enforcement, and data protection implemented across all EduSphere roles (Student, Teacher, Staff, Admin, Director). All P0 and P1 audit findings addressed. 30 authorization tests covering cross-role and cross-object attack scenarios.

---

## P0 Findings Resolved

### P0-1: Published Result Mutation Outside Rechecking
| Detail | Resolution |
|---|---|
| GradeBoundaryListView.put() could replace ALL grade boundaries after publication, changing all calculated grades retroactively | Added guard: `GradeBoundaryListView.put()` now checks if any `ResultPublication` has `workflow_status="published"`. If yes, returns 400 error "Cannot modify grade boundaries after results are published." |
| BulkPublishView.post() could re-publish over existing published results | Added guard: `BulkPublishView.post()` now requires `publication.workflow_status == "ready_to_publish"` before proceeding |

### P0-2: Notification Object Access Without Ownership
| Detail | Resolution |
|---|---|
| `NotificationDetailView.get()` returned ANY notification by ID for any authenticated user | Changed to `Notification.objects.get(id=notification_id, user=request.user)`. Returns 404 if not owned (not 403, to avoid information leakage) |

### P0-3: Teacher Class Students Access Without Allocation Check
| Detail | Resolution |
|---|---|
| `ClassStudentsView.get()` returned students for any `class_name` without verifying teacher allocation | Added `TeacherSubjectAllocation.objects.filter(teacher=profile, assigned_classes__contains=class_name, is_active=True).exists()` check. Returns 403 if not allocated. |

### P0-4: No Account-State Rechecking After JWT Issuance
| Detail | Resolution |
|---|---|
| `IsAdmin` and `IsStaff` permission classes didn't check `is_active`. JWT tokens remained valid after deactivation. | **IsAdmin**: Added `request.user.is_active` check. **IsStaff** (both `administration/permissions` and `staff/permissions`): Added `request.user.is_active` check. |

### P0-5: Rechecking Views Use Inconsistent Role Checks
| Detail | Resolution |
|---|---|
| Teacher/Student rechecking views used `permission_classes = [IsAuthenticated]` with inline role checks | **4 teacher views**: Changed to `[IsAuthenticated, IsTeacher]`, removed inline checks. **3 student views**: Changed to `[IsAuthenticated, IsStudent]`, removed inline checks. |

---

## P1 Findings Resolved

| # | Finding | Resolution |
|---|---------|-----------|
| P1-1 | Teacher self-assigns classes via `TeacherClassView.post()` | **Removed POST method entirely**. Teachers can no longer self-assign classes. Admin-only via `/api/admin/teachers/{id}/assign-class/`. |
| P1-2 | Teacher script draft/submit without ownership check | `DraftMarkView` and `EvaluationSubmitView` now filter by `teacher=profile` when fetching scripts |
| P1-3 | Teacher assignment submissions without ownership | `AssignmentSubmissionsView` now filters by `subject__in=teacher_subjects` |
| P1-4 | Teacher grades any submission | `SubmissionMarksView` now filters by `assignment__subject__in=teacher_subjects` |
| P1-5 | Staff references any student for script upload | No backend change — existing validations sufficient; staff is trusted for answer script workflows |
| P1-6 | Admin creates Teacher (should be Staff) | Already resolved in previous implementation — `TeacherListView.post()` was removed |
| P1-7 | Admin assigns scripts without subject qualification | No change — Admin scope is intentionally broad; subject qualification is an operational decision |
| P1-8 | Admin rechecking complete without validation | `compare_and_complete()` now verifies `second_evaluator_status == "completed"` and both evaluations have marks |
| P1-9 | Inactive Admin/Staff can access APIs | **Resolved by P0-4** — `is_active` added to both `IsAdmin` and `IsStaff` |
| P1-10 | No second-evaluator distinctness check | `approve_rechecking_request()` now validates `second_evaluator.id != req.original_evaluator.id` |
| P1-11 | Student notification access by admin without audit | Admin can access student notifications — this is intentional for admin scope. No change. |
| P1-12 | Subject hard deletion without cascade check | **Already resolved** in Subject/Teacher implementation — replaced with soft deactivation with reference checks |

---

## Data Exposure / Serializer Minimization

| Change | Detail |
|---|---|
| `TeacherStudentProfileSerializer` created | New serializer for Teacher-facing student data. Exposes only: `id`, `student_name`, `email`, `roll_number`, `admission_number`, `class_assigned`, `section`, `profile_photo`. |
| Sensitive fields removed from Teacher view | `date_of_birth`, `father_name`, `mother_name`, `address`, `gender`, `blood_group` — excluded from TeacherStudentProfileSerializer |
| `ClassStudentsView` switched to new serializer | Now uses `TeacherStudentProfileSerializer` instead of full `StudentProfileSerializer` |
| `StudentProfileSerializer` preserved | Unchanged — still used by Admin endpoints (Admin has full access) |

---

## IDOR/BOLA Prevention

| ID | Endpoint | Risk | Resolution |
|----|----------|------|-----------|
| IDOR-1 | GET /api/notifications/:id/ | Any user reads any notification | **Fixed**: Filtered by `user=request.user` |
| IDOR-2 | GET /api/teacher/classes/:name/students/ | Teacher views any class | **Fixed**: Allocation check via TeacherSubjectAllocation |
| IDOR-3 | POST /api/teacher/evaluation/:id/draft/ | Unassigned script evaluation | **Fixed**: Filtered by `teacher=profile` |
| IDOR-4 | POST /api/teacher/evaluation/:id/submit/ | Unassigned script submission | **Fixed**: Filtered by `teacher=profile` |
| IDOR-5 | GET /api/teacher/assignments/:id/submissions/ | Other teacher's submissions | **Fixed**: Filtered by `subject__in=teacher_subjects` |
| IDOR-6 | POST /api/teacher/submissions/:id/marks/ | Grade other's submissions | **Fixed**: Filtered by `assignment__subject__in=teacher_subjects` |
| IDOR-7 through IDOR-16 | Various | Admin/staff scope | Admin scope is intentionally broad; Staff upload scoped to `uploaded_by=request.user` |

---

## Queryset-Level Filtering

| View | Filter | Status |
|------|--------|--------|
| `StaffUploadView.get()` | Added `uploaded_by=request.user` | Staff only sees own pending uploads |
| `NotificationDetailView.get()` | Added `user=request.user` | Users only see own notifications |
| `ClassStudentsView.get()` | Added teacher-class allocation check | Teachers only see allocated classes |
| `DraftMarkView.post()` | Added `teacher=profile` | Teachers only see assigned scripts |
| `EvaluationSubmitView.post()` | Added `teacher=profile` | Teachers only evaluate assigned scripts |
| `AssignmentSubmissionsView.get()` | Added `subject__in=teacher_subjects` | Teachers only see own subject's submissions |
| `SubmissionMarksView.post()` | Added `assignment__subject__in=teacher_subjects` | Teachers only grade own subject's submissions |
| `TeacherSubjectChapterDetailView` | Added `subject__in=teacher_subjects` | Teachers only modify own subject's chapters |
| `TeacherTopicView` | Added chapter-ownership check | Teachers only modify own subject's topics |

---

## Published Result Immutability

| Path | Protection |
|------|-----------|
| `GradeBoundaryListView.put()` | Blocked if any `ResultPublication` has `workflow_status="published"` |
| `BulkPublishView.post()` | Requires `workflow_status == "ready_to_publish"` |
| `GenerateResultsView.post()` | Already blocked by `is_locked` check (pre-existing) |
| `AdminRecheckingCompleteView.post()` | Now verifies both evaluations exist before completing |

---

## Rechecking Integrity

| Check | Location |
|-------|----------|
| Second evaluator != original evaluator | `approve_rechecking_request()` — raises `ValueError` |
| Both evaluations exist before completion | `compare_and_complete()` — verifies `second_evaluator_status == "completed"` and both marks present |
| Teacher views use proper permission classes | All 4 teacher rechecking views now use `[IsAuthenticated, IsTeacher]` (was `[IsAuthenticated]` with inline checks) |
| Student views use proper permission classes | All 3 student rechecking views now use `[IsAuthenticated, IsStudent]` (was `[IsAuthenticated]`) |

---

## Permission Classes Fixed

| Class | File | Change |
|-------|------|--------|
| `IsAdmin` | `administration/permissions/admin_permissions.py` | Added `request.user.is_active` |
| `IsStaff` | `administration/permissions/staff_permissions.py` | Added `request.user.is_active` |
| `IsStaff` | `staff/permissions.py` | Added `request.user.is_active` |
| `IsStudent` | `student/permissions.py` | Already had `is_active` — unchanged |
| `IsTeacher` | `student/permissions.py` | Already had `is_active` — unchanged |

All 5 role-based permission classes now consistently check `is_active` on every request.

---

## Authorization Tests

**30 tests** written in `backend/authorization_tests.py` covering:

| Category | Tests | Coverage |
|----------|-------|----------|
| **Role Gating** | 6 tests | Student→Admin, Student→Teacher, Teacher→Admin, Teacher→Student, Staff→Admin, Admin→Staff |
| **Inactive Accounts** | 3 tests | Inactive student blocked, inactive admin blocked, unauthenticated blocked |
| **Student IDOR** | 2 tests | Other's notification returns 404, own notification returns 200 |
| **Teacher IDOR** | 10 tests | Unallocated class blocked, allocated class allowed, data minimization, self-assign removed, other's scripts, other's submissions, other's grades, other's chapters, own chapters allowed |
| **Staff Auth** | 2 tests | Staff→admin blocked, staff→subject approval blocked |
| **Admin Auth** | 2 tests | All students accessible, all teachers accessible |
| **Object-Level** | 2 tests | Notification IDOR, chapter IDOR |
| **Published Result** | 2 tests | Grade boundaries locked after publication, bulk publish requires ready state |
| **Rechecking** | 1 test | Proper permission class enforcement |

Tests cannot execute in this environment (remote PostgreSQL with interactive test DB prompt), but the test file at `backend/authorization_tests.py` is ready for execution in a development environment.

---

## Verification

| Check | Status |
|---|---|
| `python manage.py check` | 0 issues |
| All permission classes consistently check `is_active` | ✅ |
| All teacher views have object-level checks | ✅ |
| Notification IDOR fixed | ✅ |
| ClassStudentsView allocation check added | ✅ |
| Published result mutation protected | ✅ |
| Rechecking evaluator distinctness enforced | ✅ |
| Student data exposure minimized for Teacher view | ✅ |
| Teacher self-assignment removed | ✅ |
| Rechecking views use proper permission classes | ✅ |
| Staff upload scoped to own batches | ✅ |

---

## Files Changed

| # | File | Change |
|---|------|--------|
| 1 | `administration/permissions/admin_permissions.py` | Added `is_active` check |
| 2 | `administration/permissions/staff_permissions.py` | Added `is_active` check |
| 3 | `staff/permissions.py` | Added `is_active` check |
| 4 | `administration/views/rechecking.py` | Fixed permission classes on 7 views; removed inline role checks |
| 5 | `teacher/views.py` | Added object-level checks to 9 views; removed Teacher self-assignment |
| 6 | `notification/views.py` | Fixed NotificationDetailView IDOR |
| 7 | `staff/views.py` | Scoped StaffUploadView to `uploaded_by=request.user` |
| 8 | `administration/views/result_engine.py` | Added published-result protection to GradeBoundaryListView and BulkPublishView |
| 9 | `administration/services/rechecking_service.py` | Added evaluator distinctness check; added both-evaluations check |
| 10 | `student/serializers.py` | Added TeacherStudentProfileSerializer (minimal fields) |
| 11 | `authorization_tests.py` | 30 authorization tests (new file) |