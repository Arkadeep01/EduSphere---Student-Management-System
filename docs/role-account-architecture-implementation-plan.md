# Role/Account Architecture Implementation Plan

**Date:** 2026-07-26
**Status:** Awaiting Approval

---

## Current Flow

```
[Public] → register_api → CustomUser(is_active=False) → OTP verify → is_active=True → login
[Public] → admissionForms.tsx → admission-store.ts (client only, lost on refresh)
[Admin]   → creates Student + Teacher accounts directly
[Admin]   → AdmissionApplication CRUD (pending/approved/rejected, no fee flow)
[Staff]   → answer script uploads only, no teacher management
[None]    → Director, resignation, deactivation, first-login activation, DOB passwords
```

## Target Flow

```
[Director Mgmt Command] → Director account
[Director]              → creates Admin/Staff (employeeID@edusphere.edu.in)
[Admin]                 → processes admissions (pending→approved→fee_pending→fee_paid→account_created)
[Admin]                 → creates Student accounts from approved+paid admissions
[Admin]                 → manages Student academic/subject + Teacher academic deployment
[Staff]                 → creates Teacher accounts, manages personnel, processes resignation
[Teacher/Student]       → receives credentials email, logs in with DOB password, forced change, activated
[Teacher/Student]       → OAuth only after activation, only when email matches
```

## Role Hierarchy

```
DIRECTOR (exactly one, bootstrap via management command)
├── creates/manages Admin
├── creates/manages Staff
├── role changes Admin ↔ Staff
└── supervisory overrides

ADMIN
├── processes admissions (approve/reject/fee/account creation)
├── creates Student accounts
├── manages Student academic/subject
├── manages Teacher academic deployment (subject allocation, class teacher)
└── deactivates Students (with remark → Director notified)

STAFF
├── creates Teacher accounts
├── edits Teacher permitted fields (name, phone, qualification, address, experience)
├── processes Teacher resignation
└── manages Teacher personnel records

TEACHER
└── requests resignation

STUDENT
└── receives account, first-login activation
```

---

## Gaps Found

| ID | Area | Problem |
|---|---|---|
| G1 | Role model | No `director` in `CustomUser.ROLE_CHOICES` |
| G2 | Public signup | `register_api`, `student_signup_api`, `teacher_signup_api`, `staff_signup_api` allow self-registration |
| G3 | Admin creates Teachers | `TeacherListView.post()` violates Staff-only rule |
| G4 | Staff scope | Staff has no Teacher management, only answer scripts |
| G5 | TeacherProfile | Missing DOB, gender, phone, address, department, designation |
| G6 | Teacher subject | `TeacherProfile.assigned_subject` vs `TeacherSubjectAllocation` conflict — resolved: `TeacherSubjectAllocation` is source of truth |
| G7 | Resignation | No model/workflow exists |
| G8 | Admission fee status | Only pending/approved/rejected; no fee_pending, fee_paid, account_created, overdue |
| G9 | Admission form | Client-side only (`admission-store.ts`), no backend persistence |
| G10 | DOB password | No DOB-based temp password generation |
| G11 | First-login activation | No force-password-change mechanism |
| G12 | OAuth activation gate | No check if user has completed first-login activation |
| G13 | Email immutability | No enforcement anywhere |
| G14 | Student deactivation | No workflow/remark/notification to Director |
| G15 | Staff/Admin credentials | Currently personal email; need `employeeID@edusphere.edu.in` |
| G16 | Credentials email | No account-creation email sent |
| G17 | Mock data | `mock-data.ts` (1771 lines) and `admission-store.ts` provide fake data mixed with real API calls |
| G18 | Director module | Entirely absent — no views, permissions, pages |
| G19 | Admission form fields | Missing email and DOB (both required); uses mock uploads |

---

## Files to Modify / Create

### Backend — Models/Schema

| File | Change | Migration Required |
|---|---|---|
| `authentication/models.py` | Add `'director'` to `ROLE_CHOICES`; add `password_changed` BooleanField (default=False); add `needs_activation` BooleanField | YES |
| `teacher/models.py` | Add: `date_of_birth` (DateField), `gender` (CharField), `phone` (CharField), `address` (TextField), `department` (CharField with choices: Science/Arts/Commerce), `designation` (CharField with choices: Teacher/Senior Teacher/VP/Principal), `personal_email` (EmailField), `status` (CharField: active/resigned/inactive) | YES |
| `administration/models/admission.py` | Add `fee_status` (CharField choices: pending/paid/overdue/waived), `account_created` (BooleanField), `payment_deadline` (DateField), `payment_window_extended` (BooleanField) | YES |
| `administration/models/teacher.py` | Add `is_primary` BooleanField to `TeacherSubjectAllocation` | YES |
| **NEW** `teacher/models.py` (add model) | `TeacherResignation`: teacher FK, reason, details, requested_at, effective_date, status (pending/approved/rejected/overridden), reviewed_by FK, reviewed_at, override_by FK, override_at, override_reason, admin_notified (bool) | YES |
| `student/models.py` | No changes currently needed | — |

### Backend — New Files

| File | Purpose |
|---|---|
| `authentication/management/commands/create_director.py` | Bootstrap command: `python manage.py create_director --email=director@edusphere.edu.in` |
| `administration/permissions/director.py` | `IsDirector` permission class |
| `administration/views/director_admin.py` | Director views: list/create Admin, list/create Staff, manage accounts, role changes, overrides |
| `administration/services/director_admin.py` | Director business logic |
| `administration/serializers/director.py` | Director serializers |
| `administration/urls/director.py` | Director URL routes (prefixed with `director/`) |
| `staff/views/teacher_staff.py` | Staff teacher management: create, list, edit personnel fields, process resignation |
| `staff/services/teacher_staff.py` | Staff teacher business logic |
| `staff/serializers/teacher_staff.py` | Staff teacher serializers |
| `teacher/views/resignation.py` | Teacher resignation request submission |
| `teacher/services/resignation.py` | Teacher resignation service |

### Backend — Modified Files

| File | Change |
|---|---|
| `authentication/views.py` | Remove/modify `register_api`, `student_signup_api`, `teacher_signup_api`, `staff_signup_api` to require authorized creator (Director/Admin/Staff). Add DOB-temp-password generation on account creation. Add first-login activation validation on login. Add `resend_credentials` endpoint. |
| `authentication/serializers.py` | Add force-password-change validation serializer. Remove self-registration serializers. |
| `authentication/adapters.py` | Add activation gate: reject OAuth if `user.password_changed == False` |
| `authentication/urls.py` | Remove public signup routes; add `resend-credentials/` route |
| `administration/views/teacher_admin.py` | Remove `TeacherListView.post()` (teacher creation). Keep academic allocation views. Change permissions to `IsAdmin \| IsStaff` where appropriate. |
| `administration/services/teacher_admin.py` | Remove `create_teacher` method. Keep academic allocation functions. |
| `administration/views/admission_admin.py` | Add fee status views: mark-fee-paid, extend-window, check-overdue. Add account-created marking. |
| `administration/services/admission_admin.py` | Add fee-flow business logic with 3-day window enforcement and extension support. |
| `administration/views/student_admin.py` | Add `StudentDeactivateView` with mandatory remark. Remove personal data write fields. |
| `administration/services/student_admin.py` | Add deactivation logic with Director notification. |
| `administration/urls.py` | Add director/ routes; add admission fee routes; add student deactivation route. |
| `staff/views.py` | Add teacher management views. |
| `staff/urls.py` | Add teacher management and resignation processing routes. |
| `staff/services.py` | Add teacher management services. |
| `teacher/urls.py` | Add resignation request route. |
| `notification/services/notification_service.py` | Add notification types for deactivation, resignation, personnel-edit, override events. |

### Frontend — New Files

| File | Purpose |
|---|---|
| `frontend/src/routes/director.tsx` | Director layout route with sidebar navigation |
| `frontend/src/routes/director.dashboard.tsx` | Director dashboard (institution-wide stats) |
| `frontend/src/routes/director.admin-management.tsx` | Admin account list, create, deactivate/reactivate, role-change |
| `frontend/src/routes/director.staff-management.tsx` | Staff account list, create, deactivate/reactivate, role-change |
| `frontend/src/services/directorApi.ts` | Director API service (Admin/Staff management) |
| `frontend/src/services/staffTeacherApi.ts` | Staff teacher management API |

### Frontend — Modified Files

| File | Change |
|---|---|
| `frontend/src/routes/admin.admissions.tsx` | Add fee status column, payment marking button, 3-day window display, extension button, account-created status badge |
| `frontend/src/routes/admin.students.tsx` | Add deactivate button with remark dialog; remove personal data inline editing |
| `frontend/src/routes/admin.teachers.tsx` | Remove "Add Teacher" button; keep only tabs for Subject Allocations and Class Teachers |
| `frontend/src/routes/admissionForms.tsx` | Add email field (required), DOB field (required), proper validation; on submit → generate CSV download (no backend post) |
| `frontend/src/routes/login.index.tsx` | On mount, check if `needs_activation`; redirect to force-password-change page |
| `frontend/src/routes/login.faculty.tsx` | Same activation check for faculty login |
| **NEW** `frontend/src/routes/force-password-change.tsx` | Page for first-login password change |
| `frontend/src/context/AuthContext.tsx` | Add `password_changed` to User type; add `changeTempPassword` method |
| `frontend/src/services/adminApi.ts` | Add admission fee endpoints, student deactivation endpoint |
| `frontend/src/components/layouts/DashboardLayout.tsx` | Add director role navigation; update role-based route mapping |
| `frontend/src/lib/admission-store.ts` | Remove file entirely |
| `frontend/src/lib/mock-data.ts` | Remove file entirely (or gut to types/interfaces only) |
| `frontend/src/routes/register.tsx` | Remove route and component |
| `frontend/src/routes/oauth-profile-complete.tsx` | Add activation gate check before allowing profile completion |

---

## Data Impact

| Data | Impact |
|---|---|
| Existing `CustomUser` records | No change. New `password_changed` defaults `False`. Existing users continue working. |
| Existing `StudentProfile` records | No data loss. No changes to existing fields. |
| Existing `TeacherProfile` records | New fields nullable — existing records get blank values. `assigned_subject` preserved but deprecated. |
| Existing `AdmissionApplication` records | No data loss. New status fields added with safe defaults. |
| Existing notifications/audit logs | No change. |
| Mock/admission-store data | `admission-store.ts` is in-memory only (lost on page refresh) — no persistent data loss. |

---

## Permission Changes

| Current | Target |
|---|---|
| Admin can create Teacher accounts | Admin creates ONLY Student accounts; Admin handles Teacher academic deployment only |
| Staff only handles answer scripts | Staff handles Teacher creation, personnel edits, resignation processing |
| No Director permissions | `IsDirector` permission class added; Director-only views for Admin/Staff management |
| Public signup allowed | All signup endpoints removed; only Director/Admin/Staff can provision accounts |
| No object-level deactivation enforcement | Deactivation requires mandatory remark string; checks authorizer role matches scope |

---

## Notification Changes

| Event | Trigger | Recipient | Channel |
|---|---|---|---|
| Student deactivated | Admin deactivates with remark | Director | Existing notification infrastructure |
| Staff edits Teacher | Staff saves Teacher personnel changes | Teacher (affected) | Website notification |
| Teacher resignation approved | Staff approves resignation request | Admin | Website notification (for academic reallocation) |
| Teacher resignation effective | System processes effective date | Admin | Website notification (for academic reallocation) |
| Director override | Director overrides decision | Affected operational role | Website notification |
| Account created | Admin/Staff creates Student/Teacher account | Student/Teacher | Email (credentials) + website notification |

---

## Authentication Impact

| Component | Change |
|---|---|
| Login flow | After credential validation, check `password_changed`. If False, redirect to force-password-change. Issue JWT with restricted scope. |
| DOB temp password | On account creation, generate `DDMMYYYY` from DOB, set as user password hash. |
| Force password change | On first login with temp password, require new password. Set `password_changed=True`. Issue full-scope JWT. |
| OAuth | In `pre_social_login`, add check: if `user.password_changed == False`, deny OAuth with activation-required error. |
| Email login | No change to existing email+password authentication. |
| JWT/cookies | No change to existing token infrastructure. |
| Password recovery | Existing OTP-based reset works; after reset, `password_changed` remains True. |

---

## Risks

| Risk | Mitigation |
|---|---|
| Removing public signup breaks existing test workflows | Signup APIs are gated, not deleted; existing accounts remain functional |
| Adding required fields to TeacherProfile may break teacher serializers | All new fields are nullable/blank; existing TeacherProfile records unaffected |
| Director bootstrap command may be run multiple times | Command checks for existing Director; errors if already exists |
| Mock data removal breaks existing frontend pages that depend on it | Each page must be verified against real API data before mock removal |
| Admission store removal loses in-progress applications | In-progress applications are client-side only; requirement explicitly allows this |
| Existing admin users lose teacher creation ability | Must communicate scope change; existing teachers remain untouched |
| Staff gains new powers (teacher management) | Staff role is authenticated and permission-gated; no security concern |

---

## Implementation Order

```
1.  Role/account model compatibility       — Add director, password_changed, needs_activation
                                            — Add TeacherProfile missing fields
                                            — Add AdmissionApplication fee fields
                                            — Create TeacherResignation model
                                            — (Migration)

2.  Director bootstrap + permissions        — create_director management command
                                            — IsDirector permission class
                                            — Director views/services for Admin/Staff CRUD

3.  Remove public signup                    — Gate/remove register_api and enhanced signup APIs
                                            — Remove register.tsx frontend route

4.  Staff/Admin credentials format          — Implement employeeID@edusphere.edu.in format

5.  Staff → Teacher management              — Staff views: create Teacher, list, edit permitted fields
                                            — Staff serializers/URLs

6.  Admin scope correction                  — Remove Teacher creation from Admin
                                            — Add admission fee flow (3-day window, payment, extension)
                                            — Add Student deactivation with remark

7.  Teacher resignation                     — TeacherResignation model + workflow
                                            — Teacher submit → Staff review → approve/reject
                                            — Director override capability
                                            — Admin notified for academic reallocation

8.  DOB temporary password                  — DDMMYYYY generation on account creation
                                            — Hash and store as user password

9.  First-login activation                  — Force password change on first login
                                            — Block portal access until changed
                                            — Restricted JWT scope before activation

10. Credentials email                       — Send via EmailService on account creation
                                                — resend-credentials endpoint for authorized creators

11. OAuth activation gate                   — Check password_changed in pre_social_login
                                            — Deny with appropriate error if not activated

12. Admission form → CSV                    — Connect frontend form to CSV export
                                            — Build Staff/Admin CSV import → AdmissionApplication

13. Teacher subject resolution              — Deprecate TeacherProfile.assigned_subject
                                            — TeacherSubjectAllocation as single source of truth
                                            — Add is_primary flag support

14. Email immutability                      — Remove email from writable serializer fields
                                            — Remove frontend email edit UI

15. Frontend remapping                      — Director pages (dashboard, admin mgmt, staff mgmt)
                                            — Staff teacher pages (list, create, edit)
                                            — Teacher resignation page
                                            — Remove mock data
                                            — Remove Admin Add Teacher
                                            — Add admission fee UI
                                            — Add deactivation UI

16. Notification integration                — Wire deactivation→Director notification
                                            — Wire Staff edit→Teacher notification
                                            — Wire resignation→Admin notification
                                            — Wire Director override notifications

17. Cross-module verification               — Test complete lifecycle end-to-end
                                            — Verify all permission boundaries
                                            — Verify no data loss
```

---

## Decisions Made

| Question | Decision |
|---|---|
| Director representation | Add `'director'` to `CustomUser.ROLE_CHOICES` |
| Staff/Admin email format | `employeeID@edusphere.edu.in` |
| Admission form pipeline | CSV export from frontend → import into backend `AdmissionApplication` staging |
| Teacher subject authority | `TeacherSubjectAllocation` is source of truth; deprecate `TeacherProfile.assigned_subject` |
