# PORTAL UI AUDIT

## A. Executive Summary

Audit of all four EduSphere portals (Student, Teacher, Staff, Admin) after mock-data removal. 
- **Total pages examined:** 52
- **Pages still importing mock data:** 12
- **Pages with "coming soon" placeholders:** 8
- **Dead/orphaned files:** 3
- **Historical regressions detected:** 5+ (current versions are WORSE than v1.0.0)
- **Conflicting/duplicate routes:** 3 notification routes in admin

---

## B. Scope & Methodology

- **Baseline commits:** `99f5a0b` (v1.0.0 — mock era), `fcaa53f` (v1.0.1 — current HEAD)
- **Intermediate commits:** `51b73f7` (Student/Teacher Panel), `638bb2e` (Admin Panel)
- **Comparison:** Current page vs historical version vs backend API reality
- **Classification:** Fully Migrated, Mock-Dependent, Placeholder, Dead, Conflicting

---

## C. Mock Data Usage — Student Portal

| Page | Status | Mock Import | Details |
|------|--------|-------------|---------|
| dashboard | ✅ Fully Migrated | None | Real hooks via `useStudentDashboard`, `useMySubjects` |
| subjects | ✅ Fully Migrated | None | Real APIs via `studentSubjectApi`, `studentChapterApi`, `subjectRequestApi` |
| assignments | ✅ Fully Migrated | None | Real hooks via `useStudentAssignments`, `useAssignmentSubmissions` |
| attendance | ✅ Fully Migrated | None | Real hooks via `useStudentAttendance` |
| exams | ✅ Fully Migrated | None | Real data from `studentApi` |
| **results** | ❌ **Mock Fallback** | `results, rankings, exams, studentProfileData` | API call first, falls back to mock data; mock imported at top |
| fees | ✅ Fully Migrated | None | Uses `feeApi.myLedger()`, `feeApi.structures.list()` |
| timetable | ✅ Fully Migrated | None | Uses `API_BASE` fetch |
| rechecking | ✅ Fully Migrated | None | Uses `API_BASE` fetch with pagination |
| profile | ❌ **Mock Fallback** | `studentProfileData` | API call first, falls back to mock data; mock imported at top |

**Student Portal: 8/10 migrated, 2 still mock-dependent.**

---

## D. Mock Data Usage — Teacher Portal

| Page | Status | Mock Import | Details |
|------|--------|-------------|---------|
| dashboard | ✅ Fully Migrated | None | Real hooks via `useTeacherDashboard`, `useTeacherClasses` |
| classes | ✅ Fully Migrated | None | Real hooks via `useTeacherClasses`, `useTeacherStudents` |
| subjects | ❌ **Mock-Dependent** | `subjects` | Imports mock subjects; API call as alternative but mock is primary |
| assignments | ✅ Fully Migrated | None | Real hooks |
| attendance | ✅ Fully Migrated | None | Real hooks |
| exams | ✅ Fully Migrated | None | Real hooks |
| timetable | ✅ Fully Migrated | None | Real hooks |
| resources | ✅ Fully Migrated | None | Real hooks |
| rechecking | ✅ Fully Migrated | None | Real fetch with pagination |
| notification-center | ✅ Fully Migrated | None | Real data |
| profile | ✅ Fully Migrated | None | Real hooks |

**Teacher Portal: 10/11 migrated, 1 still mock-dependent.**

---

## E. Mock Data Usage — Staff Portal

| Page | Status | Mock Import | Details |
|------|--------|-------------|---------|
| dashboard | ✅ Fully Migrated | None | Real `staffApi.dashboard()`, batch fetches |
| upload | ✅ Fully Migrated | None | Real `staffApi.uploadHistory()`, `staffApi.uploadScript()` |
| history | ✅ Fully Migrated | None | Real `staffApi.uploadHistory()` with status filter |
| rejected | ✅ Fully Migrated | None | Real `staffApi.uploadHistory("rejected")` |
| rechecking | ✅ Fully Migrated | None | Real `API_BASE` fetch with search/pagination |
| upload-tasks | ✅ Fully Migrated | None | Real `staffApi.uploadTasks()` |
| profile | ✅ Fully Migrated | None | Real `staffApi.profile()`, `staffApi.updateProfile()` |

**Staff Portal: 7/7 fully migrated. Cleanest portal.**

---

## F. Mock Data Usage — Admin Portal

| Page | Status | Mock Import | Details |
|------|--------|-------------|---------|
| dashboard | ✅ Fully Migrated | None | Real `useAdminDashboardSummary` |
| **students** | ❌ **Mock-Dependent** | `students, classes` | Mock as initial `useState`; historical v1.0.0 had full API impl |
| **teachers** | ❌ **Mock-Dependent** | `teachers` | Mock data for table display |
| classes | ⚠️ Placeholder | None | Minimal content; no real data wiring |
| **exams** | ❌ **Mock-Dependent** | `exams, subjects, classes` | Mock data used in UI rendering |
| **results** | ❌ **Mock-Dependent** | `results, exams, students` | Mock data for tables and charts |
| **fees** | ❌ **Mock-Dependent** | `fees` | Mock data for fee ledger tables |
| **admissions** | ❌ **Mock-Dependent** | `admissions` | Mock data with no real backend connection |
| **promotions** | ❌ **Mock-Dependent** | `students, classes` | Mock data for promotion workflows |
| **subjects** | ❌ **Mock-Dependent** | `subjects, teachers` | Mock data for subject management |
| **settings** | ❌ **Mock-Dependent** | `settings` | Mock data for settings form defaults |
| attendance | ⚠️ Likely Placeholder | Not verified | Not in sidebar but route may exist |
| notifications | ⚠️ Not Verified | — | Needs check |
| notification | ⚠️ Not Verified | — | Notification management |
| notification-center | ⚠️ Not Verified | — | Notification center |
| events | ⚠️ Not Verified | — | Needs check |
| audit-logs | ✅ Fully Migrated | None | Real data |
| contacts | ✅ Fully Migrated | None | Real data |
| documents | ⚠️ Placeholder | None | ON HOLD per domain rules |
| reports | ❌ **Mock-Dependent** | Not verified | Needs check |
| rechecking | ✅ Fully Migrated | None | Real paginated fetch |
| profile | ✅ Fully Migrated | None | Real hooks |

**Admin Portal: ~7/22 fully migrated, ~10 mock-dependent, ~5 unknown/placeholder.**

---

## G. Placeholder / "Coming Soon" Blocks

All blocks that display "coming soon", "—", or empty placeholder text instead of real content:

| Page | Block | Content |
|------|-------|---------|
| student/dashboard | Academic Growth card | "Academic growth data coming soon." |
| student/dashboard | Assignment Performance card | "Assignment data coming soon." |
| student/dashboard | Subject Profile card | "Results data coming soon." |
| teacher/dashboard | Syllabus Progress card | "Syllabus progress tracking coming soon." |
| admin/dashboard | Attendance stat card | Value shows `"--"` |
| admin/dashboard | Upcoming Exams stat card | Value shows `"--"` |
| admin/dashboard | Upcoming Events stat card | Value shows `"--"` |
| admin/dashboard | Overview card | "Real-time charts and analytics coming soon." |
| admin/classes | Full page | Minimal content; no real data wiring |

---

## H. Dead / Orphaned Code

### 1. `frontend/src/lib/mock-data.ts` (1656 lines)
- Still present, actively imported by 12 pages
- Cannot be deleted until those 12 pages are migrated

### 2. `frontend/src/lib/admission-store.ts`
- Client-side Zustand store for admission forms
- **No backend API connection** — data saved to localStorage only
- Admission form (`admissionForms.tsx`) saves to this store only
- **Missing fields:** email, DOB (per domain rules for admission)

### 3. `frontend/src/routes/register.tsx`
- Public signup route still exists
- **Conflicts with domain rule:** "No public signup — accounts are created by Admin import (CSV) or admission pipeline"
- Should be removed or restricted to token-based invite flow

---

## I. Duplicate / Conflicting Routes

### Notification Pages (Admin)
Three separate routes for notifications, causing user confusion:

| Route | Sidebar Label | Purpose |
|-------|---------------|---------|
| `/admin/notifications` | "Notifications" | Likely notification broadcast |
| `/admin/notification` | "Notification Mgmt" | Duplicate of above |
| `/admin/notification-center` | "Notification Center" | View received notifications |

**Recommendation:** Consolidate to one route, or clearly differentiate (broadcast vs inbox).

### `admin.tsx` vs `DashboardLayout.tsx`
- `admin.tsx` provides its own `AdminLayout` component with a separate sidebar
- `DashboardLayout.tsx` provides `navByRole["admin"]` with 23 nav items
- These are **two separate sidebar implementations** — the active one depends on route structure
- Admin layout nav items differ from DashboardLayout nav items (duplicates, missing entries)

---

## J. Missing Routes

| Missing Route | Portal | Reason |
|---------------|--------|--------|
| `/student/notification-center` | Student | Sidebar shows "Profile" as last item; notification center not in student nav |
| `/admin/class-management` (structured) | Admin | Classes page exists but is minimal |

---

## K. Navigation / Sidebar Issues

### Admin Sidebar (DashboardLayout.tsx)
- 23 nav items — too many, needs grouping/collapsible sections
- 3 notification routes visible simultaneously
- `Documents` link points to `/admin/documents` (ON HOLD page)

### Teacher Sidebar
- `/teacher/subjects` — "My Subject" label is misleading; teachers only teach one subject
- OK overall

### Student Sidebar
- Missing notification center link
- Otherwise clean

### Staff Sidebar
- Clean, 7 items

---

## L. Layout Conflicts

### `admin.tsx` — Separate AdminLayout
- `admin.tsx` at `/admin` renders `AdminLayout` which has its OWN sidebar
- `DashboardLayout.tsx` is NOT used for admin routes
- This means admin has a completely separate sidebar component from other roles
- The AdminLayout sidebar may have different items than `navByRole["admin"]`
- **Risk:** Route pages assume `DashboardLayout` context (NotificationProvider, theme, auth), but AdminLayout may not provide all of these

---

## M. Missing Required Fields

Based on domain rules and backend models:

| Form/Page | Missing Fields |
|-----------|----------------|
| Admission form (`admissionForms.tsx`) | Email, DOB |
| Teacher Profile (backend `TeacherProfile`) | DOB, gender, phone, address, department, designation |
| Staff profile page (`staff.profile.tsx`) | Limited to employee_id, department, phone |
| Student profile (`student.profile.tsx`) | Possibly missing fields compared to backend |

---

## N. Historical Regression Analysis

Several current pages are **worse** than their v1.0.0 counterparts:

| Page | v1.0.0 (99f5a0b) | Current (fcaa53f) | Regression |
|------|-------------------|--------------------|------------|
| admin/students | Full TanStack Query + real API calls + dialogs | Mock data as initial `useState` | YES — REWRITTEN WITH MOCK |
| admin/teachers | Real API calls (partial) | Mock data | YES |
| admin/exams | Real `examAdminApi` calls | Mock data | YES |
| admin/results | Full implementation | Mock data | YES |
| admin/fees | Full implementation | Mock data | YES |

**Root Cause:** The migration from v1.0.0 → v1.0.1 introduced mock data into pages that previously worked with real APIs. This appears to be a development shortcut when backend APIs were not ready or were in flux.

---

## O. Priority Classification

### P0 — Critical (blocking deployment)
1. **admin/students** — rewrite to restore real API calls (historical exists as reference)
2. **admin/exams** — replace mock data with `examAdminApi`
3. **admin/results** — replace mock data with real API calls
4. **admin/fees** — replace mock data with `feeAdminApi`
5. **register.tsx** — disable/remove public signup route

### P1 — High (user-facing gaps)
6. **student/results** — remove mock fallback, rely on API only
7. **student/profile** — remove mock fallback, rely on API only
8. **teacher/subjects** — remove mock data dependency
9. **admin/teachers** — replace mock with API calls
10. **admin/admissions** — replace mock with API; connect to real backend
11. **admin/promotions** — replace mock with API calls
12. **admin/subjects** — replace mock with API calls
13. **admin/settings** — replace mock with API calls
14. **admin/classes** — flesh out with real data
15. **admission-store.ts** — connect to backend API or remove
16. **admissionForms.tsx** — add email+DOB fields; connect to backend

### P2 — Medium (polish)
17. Consolidate duplicate notification routes (3→1 or clearly split)
18. Add `/student/notification-center` to student nav
19. Fix `admin.tsx` layout vs `DashboardLayout.tsx` duplication
20. Add collapsible sections to admin sidebar (23 items)
21. Remove unused imports from migrated pages

### P3 — Low (nice to have)
22. Fill "coming soon" placeholder blocks with real data
23. Add missing TeacherProfile fields to profile page

---

## P. Consolidated Action List

| # | Action | Portal | Current State | Target State | Effort |
|---|--------|--------|---------------|--------------|--------|
| 1 | Rewrite admin/students with real API | Admin | Mock-dependent | Real TanStack Query | 3 days |
| 2 | Rewrite admin/exams with real API | Admin | Mock-dependent | Real TanStack Query | 2 days |
| 3 | Rewrite admin/results with real API | Admin | Mock-dependent | Real TanStack Query | 2 days |
| 4 | Rewrite admin/fees with real API | Admin | Mock-dependent | Real TanStack Query | 2 days |
| 5 | Disable/remove register.tsx | Public | Open signup | Removed | 0.5 day |
| 6 | Remove mock fallback from student/results | Student | Mock fallback | API-only | 1 day |
| 7 | Remove mock fallback from student/profile | Student | Mock fallback | API-only | 0.5 day |
| 8 | Remove mock from teacher/subjects | Teacher | Mock-dependent | API-only | 1 day |
| 9 | Rewrite admin/teachers with real API | Admin | Mock-dependent | Real API | 2 days |
| 10 | Rewrite admin/admissions with real API | Admin | Mock-dependent | Real API | 2 days |
| 11 | Rewrite admin/promotions with real API | Admin | Mock-dependent | Real API | 2 days |
| 12 | Rewrite admin/subjects with real API | Admin | Mock-dependent | Real API | 2 days |
| 13 | Rewrite admin/settings with real API | Admin | Mock-dependent | Real API | 1 day |
| 14 | Flesh out admin/classes | Admin | Placeholder | Real data | 1 day |
| 15 | Connect admission-store to backend | Both | Client-only | Backend API | 2 days |
| 16 | Add email+DOB to admission form | Public | Missing fields | Complete | 0.5 day |
| 17 | Consolidate notification routes | Admin | 3 duplicate | 1-2 routes | 1 day |
| 18 | Add notif center to student nav | Student | Missing | Added | 0.5 day |
| 19 | Resolve admin layout conflict | Admin | Dual layout | Single layout | 1 day |
| 20 | Add collapsible sidebar sections | Admin | 23 flat items | Grouped | 1 day |
| 21 | Remove unused imports | All | Mixed | Clean | 0.5 day |
| 22 | Fill "coming soon" blocks | All | Placeholder | Real data | 3 days |
| 23 | Add missing TeacherProfile fields | Teacher | Partial | Complete | 1 day |

**Total estimated effort: ~28 days**

---

## Q. On-Hold Items (Explicitly Excluded)

Per domain rules and project scope, the following are **ON HOLD** and excluded from audit action:

| Item | Reason |
|------|--------|
| Document Repository (`admin/documents`) | Export/Letterhead enhancement on hold |
| Export functionality | Letterhead/export enhancement on hold |
| Full TeacherProfile model migration | Blocks on role-account architecture plan |

---

## R. References

- Git commits analyzed: `99f5a0b` (v1.0.0), `fcaa53f` (v1.0.1), `51b73f7` (Student/Teacher), `638bb2e` (Admin)
- `frontend/src/lib/mock-data.ts` — 1656 lines, unchanged between v1.0.0 and current
- `docs/role-account-architecture-implementation-plan.md` — Part 1 plan (pending approval)
