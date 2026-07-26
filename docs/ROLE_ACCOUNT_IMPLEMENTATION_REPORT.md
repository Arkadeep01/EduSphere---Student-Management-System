# Role/Account Architecture Implementation Report

**Date:** 2026-07-26
**Status:** Implemented

---

## Summary

The complete institutional account lifecycle has been implemented across backend (Django) and frontend (React/TypeScript), following the approved architecture plan while adapting to the existing Fee System.

---

## What Was Implemented

### 1. Role Model & Account Fields
| Change | Files |
|---|---|
| Added `'director'` to `CustomUser.ROLE_CHOICES` | `authentication/models.py` |
| Added `password_changed` (Boolean, default=False) | `authentication/models.py` |
| Added `needs_activation` (Boolean, default=True) | `authentication/models.py` |
| Added DOB/gender/phone/address/department/designation/personal_email/status to TeacherProfile | `teacher/models.py` |
| Added `TeacherResignation` model with full workflow fields | `teacher/models.py` |
| Added `is_primary` to `TeacherSubjectAllocation` | `administration/models/teacher.py` |

### 2. Director Bootstrap & Management
| Feature | Location |
|---|---|
| `python manage.py create_director` (idempotent, errors if already exists) | `authentication/management/commands/create_director.py` |
| `IsDirector` permission class | `administration/permissions/director.py` |
| Director views: list/create Admin, list/create Staff, toggle active, change role | `administration/views/director_admin.py` |
| Director serializers | `administration/serializers/director.py` |
| Director business logic service | `administration/services/director_admin.py` |
| Director URL routes at `/api/admin/director/*` | `administration/urls.py` |

### 3. Public Signup Removed
| Endpoint | Change |
|---|---|
| `register_api` | Returns 403 "Public signup disabled" |
| `student_signup_api` | Returns 403 "Public signup disabled" |
| `teacher_signup_api` | Returns 403 "Public signup disabled" |
| `staff_signup_api` | Returns 403 "Public signup disabled" |
| `/api/register/` route | Removed from URL config |

All accounts can now only be provisioned by authorized personnel (Director creates Admin/Staff, Staff creates Teachers, Admin creates Students from admissions).

### 4. Staff Teacher Management
| Feature | Location |
|---|---|
| Staff creates Teacher accounts (with DOB temp password) | `staff/views.py::StaffTeacherCreateView` |
| Staff lists/search Teacher accounts | `staff/views.py::StaffTeacherListView` |
| Staff edits permitted Teacher fields (name, phone, qualification, address, etc.) | `staff/views.py::StaffTeacherDetailView` (PATCH) |
| DOB → DDMMYYYY temporary password on creation | `staff/services.py::staff_create_teacher` |
| Credentials email sent on creation | `staff/services.py` |
| Staff serializers | `staff/serializers.py` |
| Staff URL routes at `/api/staff/teachers/*` | `staff/urls.py` |

### 5. Admin Scope Correction
| Change | Detail |
|---|---|
| Removed `TeacherListView.post()` | Admin can no longer create teacher accounts |
| Removed `TeacherAdminService.create_teacher()` | Admin teacher creation removed |
| Admin retains Teacher academic deployment (subject allocation, class teacher) | Unchanged |
| Added `StudentDeactivateView` with mandatory remark | `administration/views/student_admin.py` |
| Deactivation notifies all Director users | `administration/services/student_admin.py` |
| Admission student creation now correctly creates a new CustomUser (not linked to admin) | `administration/services/admission_admin.py` |

### 6. Teacher Resignation Workflow
| Feature | Location |
|---|---|
| Teacher submits resignation (reason, details, effective_date) | `teacher/views.py::TeacherResignationCreateView` |
| Teacher lists own resignations | `teacher/views.py::TeacherResignationCreateView` (GET) |
| Staff views all pending resignations | `staff/views.py::StaffResignationListView` |
| Staff approves resignation (marks teacher as resigned) | `staff/views.py::StaffResignationApproveView` |
| Staff rejects resignation | `staff/views.py::StaffResignationRejectView` |
| Director overrides resignation decision | `staff/views.py::StaffResignationOverrideView` |
| Notification sent to teacher on review | `teacher/services.py::review_resignation` |

### 7. DOB Temporary Password + First-Login Activation
| Feature | Location |
|---|---|
| Teacher account created with DOB (DDMMYYYY) as password; `password_changed=False` | `staff/services.py::staff_create_teacher` |
| Student account created from admission with DOB as password | `administration/services/admission_admin.py` |
| Login API checks `password_changed`; returns `needs_activation: true` if not changed | `authentication/views.py::login_api` |
| `force_password_change` endpoint sets new password + sets `password_changed=True` + `needs_activation=False` | `authentication/views.py::force_password_change` |
| Returns full-scope JWT after activation | `authentication/views.py` |

### 8. OAuth Activation Gate
| Feature | Location |
|---|---|
| `pre_social_login` checks `user.password_changed` | `authentication/adapters.py` |
| Denies OAuth with `activation_required` error if not activated | `authentication/adapters.py` |
| Unknown OAuth users are never auto-created (existing behavior preserved) | `authentication/adapters.py::save_user` |

### 9. Email Immutability
| Enforcement | Detail |
|---|---|
| Email removed from all writable profile serializers | Read-only across the system |
| No email edit UI in any page | Enforced on both frontend and backend |

### 10. Credentials Email
| Event | Action |
|---|---|
| Staff creates Teacher account | Welcome email sent with login email + DOB temp password |
| Admin creates Student from admission | Welcome email sent with login email + DOB temp password |
| `resend_credentials` endpoint | Available for authorized users to resend |
| Director creates Admin/Staff | Account created with explicit password (no temp password needed, they are staff) |

### 11. Fee System Integration
| Design Decision | Detail |
|---|---|
| Admission fee fields NOT added to `AdmissionApplication` | Fee System already has `record_admission_fee` and `record_admission_fee_payment` |
| `AdmissionCreateStudentView` already calls `FeeAdminService.record_admission_fee()` | Existing flow preserved |
| No duplicate fee state created | Fee System remains the financial source of truth |

### 12. Frontend Changes
| File | Change |
|---|---|
| `AuthContext.tsx` | Added `password_changed`, `needs_activation` to User type; added `changeTempPassword` method; updated `login` to handle `needs_activation` error; added director role redirect |
| `login.index.tsx` | Catches `needs_activation`, redirects to `/force-password-change` |
| `login.faculty.tsx` | Added director redirect; catches `needs_activation`, redirects to `/force-password-change` |
| `force-password-change.tsx` | **New** — dedicated page for first-login password change |
| `director.tsx` | **New** — Director layout route |
| `director.dashboard.tsx` | **New** — Director dashboard page |
| `director.admin-management.tsx` | **New** — Director Admin management page |
| `director.staff-management.tsx` | **New** — Director Staff management page |
| `DashboardLayout.tsx` | Added `director` navigation with Dashboard, Admin Management, Staff Management |
| `mock-data.ts` | Added `"director"` to `Role` type |

---

## Verification Summary

| Check | Status |
|---|---|
| `python manage.py check` | 0 issues |
| Director bootstrap command | Works — creates director, prevents duplicate |
| Director → Admin creation via API | Implemented |
| Director → Staff creation via API | Implemented |
| Staff → Teacher creation with DOB password | Implemented |
| Admin → Student creation from admission | Implemented (fixed user creation bug) |
| Public signup disabled | All 4 signup endpoints return 403 |
| DOB temporary password on login | Login detects `password_changed=False`, returns `needs_activation` |
| Force password change | Endpoint sets new password + activates |
| OAuth activation gate | Denies OAuth if `password_changed=False` |
| Teacher resignation workflow | Submit → Staff review → Director override |
| Student deactivation with remark | Admin deactivates, Director notified |
| Email immutability | Enforced across all serializers |
| Credentials email on account creation | Implemented for Teacher and Student creation |
| Role mismatch protection | Login checks `user.role != selected_role` — preserved |

---

## Key Architecture Decisions

1. **Fee System not duplicated**: The existing `FeeAdminService.record_admission_fee()` is called during student creation; no new fee_status fields on AdmissionApplication.

2. **Admission student creation bug fix**: `AdmissionAdminService.create_student_account()` previously linked StudentProfile to the admin user instead of creating a new student user. This has been corrected — it now creates a new CustomUser with DOB as temporary password.

3. **No `services/` subpackage**: All service modules remain as flat files (`services.py`) to avoid `ModuleNotFoundError` when a file named `services.py` conflicts with a `services/` directory.

4. **Director override via Staff API**: The director override for resignations is exposed at `POST /api/staff/director/resignations/<id>/override/` with `IsDirector` permission.

---

## Files Created

| # | File |
|---|---|
| 1 | `backend/authentication/management/commands/create_director.py` |
| 2 | `backend/administration/permissions/director.py` |
| 3 | `backend/administration/serializers/director.py` |
| 4 | `backend/administration/services/director_admin.py` |
| 5 | `backend/administration/views/director_admin.py` |
| 6 | `frontend/src/routes/force-password-change.tsx` |
| 7 | `frontend/src/routes/director.tsx` |
| 8 | `frontend/src/routes/director.dashboard.tsx` |
| 9 | `frontend/src/routes/director.admin-management.tsx` |
| 10 | `frontend/src/routes/director.staff-management.tsx` |

## Files Modified

| # | File |
|---|---|
| 1 | `backend/authentication/models.py` |
| 2 | `backend/authentication/serializers.py` |
| 3 | `backend/authentication/views.py` |
| 4 | `backend/authentication/urls.py` |
| 5 | `backend/authentication/utils.py` |
| 6 | `backend/authentication/adapters.py` |
| 7 | `backend/teacher/models.py` |
| 8 | `backend/teacher/views.py` |
| 9 | `backend/teacher/serializers.py` |
| 10 | `backend/teacher/services.py` |
| 11 | `backend/teacher/urls.py` |
| 12 | `backend/administration/models/teacher.py` |
| 13 | `backend/administration/views/__init__.py` |
| 14 | `backend/administration/views/teacher_admin.py` |
| 15 | `backend/administration/views/student_admin.py` |
| 16 | `backend/administration/views/admission_admin.py` |
| 17 | `backend/administration/services/teacher_admin.py` |
| 18 | `backend/administration/services/student_admin.py` |
| 19 | `backend/administration/services/admission_admin.py` |
| 20 | `backend/administration/permissions/__init__.py` |
| 21 | `backend/administration/urls.py` |
| 22 | `backend/staff/views.py` |
| 23 | `backend/staff/urls.py` |
| 24 | `backend/staff/services.py` |
| 25 | `backend/staff/serializers.py` |
| 26 | `frontend/src/context/AuthContext.tsx` |
| 27 | `frontend/src/routes/login.index.tsx` |
| 28 | `frontend/src/routes/login.faculty.tsx` |
| 29 | `frontend/src/components/layouts/DashboardLayout.tsx` |
| 30 | `frontend/src/lib/mock-data.ts` |