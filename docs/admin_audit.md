# EduSphere Admin Module — Audit & Implementation Plan

## 1. Project Overview

| Dimension | Detail |
|-----------|--------|
| Backend | Django 5.x + DRF + SQLite3 (dev) |
| Frontend | React 19 + TypeScript + TanStack Router + TailwindCSS v4 |
| Auth | JWT (simplejwt) + django-allauth (Google, GitHub) |
| Mock Data | Centralized in `frontend/src/lib/mock-data.ts` (975 lines) |
| Admin Routes | 13 routes under `/admin/*` |
| Admin Backend | No dedicated admin app — `IsAdmin` permission defined but unused |

---

## 2. Existing Admin Frontend Pages — Current State

| Route | File | Current State | Needs Work? |
|-------|------|---------------|-------------|
| `/admin` | `admin.tsx` | Just renders `DashboardLayout role="admin"` | OK |
| `/admin/dashboard` | `admin.dashboard.tsx` | Stats cards + charts + notifications + events | OK — minor enhancements |
| `/admin/students` | `admin.students.tsx` | Flat table with search/filter | **REWRITE** — needs class card workflow |
| `/admin/teachers` | `admin.teachers.tsx` | Card grid with message button | **REWRITE** — needs allocation, add, notifications |
| `/admin/classes` | `admin.classes.tsx` | Hardcoded class cards | **REWRITE** — needs detail pages, teacher allocation |
| `/admin/attendance` | `admin.attendance.tsx` | Single stats + bar chart | **REWRITE** — needs analytics + faculty attendance |
| `/admin/exams` | `admin.exams.tsx` | Simple table of exam data | **EXPAND** — needs create, publish, answer scripts |
| `/admin/fees` | `admin.fees.tsx` | Revenue dashboard only | **ADD** — report block (paid/unpaid per class) |
| `/admin/events` | `admin.events.tsx` | Event cards with edit/delete | **EXPAND** — needs create event modal |
| `/admin/contacts` | `admin.contacts.tsx` | Table with filter + actions | **EXPAND** — needs send email, call, resolve actions |
| `/admin/admissions` | `admin.admissions.tsx` | Table + detail panel | **EXPAND** — needs dashboard stats, docs viewer, verify |
| `/admin/reports` | `admin.reports.tsx` | Tabs with charts | OK |
| `/admin/settings` | `admin.settings.tsx` | Tabs with basic fields | **REWRITE** — needs about, gallery, home, admission pages |
| `/admin/profile` | `admin.profile.tsx` | Uses ProfileView component | OK |

---

## 3. Missing Backend — Admin App

**No admin app exists.** Must create:

```
backend/admin_app/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── permissions.py
├── services.py
├── selectors.py
├── urls.py
└── views.py
```

---

## 4. Detailed Requirements Mapping

### 4.1 Students Page Rewrite

**Current:** Flat table listing all students.

**Desired:**
1. **Landing:** Class cards showing class name, total strength, boys, girls, pending subject requests
2. **Subject Request Control:** Enable/disable global toggle
3. **Class View:** Click card → sections, student count, attendance summary, subject allocations
4. **Fees Reporting Block:** Select class → paid/unpaid filters
5. **Add Student** button + modal/form
6. **Export:** Select scope (entire school / class / section) → export
7. **Student Details:** Personal info, academic info, subjects, attendance, assignments, documents, notifications

**Implementation:**
- Create new mock data for class stats, sections, fee status per class
- Replace single table with multi-state workflow (cards → class detail → student detail)
- Add modal for Add Student
- Add export dropdown with scope selection

### 4.2 Teachers Page Rewrite

**Current:** Card grid with message button.

**Desired:**
1. **Teacher Cards** — keep but enhance with more info
2. **Send Notification Modal** — message icon opens modal, notification appears in teacher portal
3. **Class Teacher Assignment** — assign teacher → class teacher → class
4. **Subject Teacher Allocation** — academic year allocation system (teacher + subject + classes + session)
5. **Add Teacher** — form with personal info, contact, qualification, experience, subject, class, section

**Implementation:**
- Add notification modal component
- Add class teacher assignment UI
- Add academic year allocation system in mock data
- Add Add Teacher modal/form

### 4.3 Classes Page Rewrite

**Current:** Hardcoded class cards.

**Desired:**
1. **Class Cards** — display classes only (not class+section)
2. **Class Detail Page** — sections, subjects, teachers, student count, timetable
3. **Missing Teacher Allocation** — show "No Teacher Assigned" + Assign button → redirect to teacher allocation
4. **Add Class** — create class, sections, set capacity, set academic year

**Implementation:**
- Move class data to mock-data.ts with full structure
- Create class detail view (sub-route or inline)
- Add teacher assignment workflow
- Add class creation modal

### 4.4 Attendance Page Rewrite

**Current:** Single stats + bar chart.

**Desired:**
1. **Analytics Section** — student attendance trends, class attendance, school attendance
2. **Faculty Attendance Section** — mark present/absent/leave/half-day for teachers

**Implementation:**
- Split page into two sections (tabs or vertical split)
- Add teacher attendance mock data
- Add faculty attendance marking UI

### 4.5 Exams Page Expansion

**Current:** Simple table.

**Desired:**
1. **Create Exam** — modal with name, classes, sections, subjects, dates
2. **Publish/Unpublish/Archive** — status management
3. **Answer Script Management** — upload scripts mapped by class/section/subject/student
4. **Evaluation Monitoring** — track teacher assigned, evaluation status, marks
5. **Result Publication** — publish final results

**Implementation:**
- Add exam creation modal
- Add status badges (scheduled/published/archived)
- Add answer script upload section
- Add evaluation tracking table
- Add result publication toggle

### 4.6 Fees — Reporting Block

**Current:** Revenue-only dashboard.

**Desired:**
- Add reporting block: select class → paid/unpaid students with filters
- DO NOT modify existing fees module

**Implementation:**
- Add a new card/section below existing charts
- Class selector + student table with fee status

### 4.7 Events Page Expansion

**Current:** Event cards with edit/delete.

**Desired:**
- Create Event modal (title, description, date, venue, banner image)
- Edit Event
- Publish/Unpublish/Archive events

**Implementation:**
- Add Create Event modal
- Add publish/unpublish/archive actions
- Add banner image upload placeholder

### 4.8 Contact Submissions Page Expansion

**Current:** Table with mark-read + delete.

**Desired:**
- Send Email action
- Call Contact action
- Mark Resolved / Mark Pending
- Delete

**Implementation:**
- Add more dropdown actions
- Add status workflow (unread → read → resolved)
- Add email/call action buttons

### 4.9 Admission Forms Page Expansion

**Current:** Table + detail panel with approve/reject.

**Desired:**
1. **Dashboard Statistics** — total applicants, entrance test appeared, passed, failed, pending verification, selected, rejected
2. **Applicant List** (exists — enhance)
3. **Applicant Details** — full form, parent details, academic info, uploaded docs, certificates, photos
4. **Document Viewer** — grid layout, click to expand
5. **Verification Workflow** — approve, reject, request more information
6. **Student Registration** — when approved, create student account, generate credentials

**Implementation:**
- Add stats cards at top
- Add document viewer with grid layout
- Add "Request More Info" action
- Add "Create Student Account" action on approval

### 4.10 Settings Page Rewrite

**Current:** General, Branding, Notifications, Security tabs.

**Desired (tabs):**
1. **About Page Controls** — video, video title, featured students, top students, about content
2. **Gallery Controls** — upload, delete, reorder images
3. **Home Page Featured Images** — star images, control display queue, manage ordering
4. **Admission Page Controls** — admission dates, fees, intake capacity, banner info, notices

**Implementation:**
- Replace existing 4 tabs with 4 new content management tabs
- Add mock data for site content

---

## 5. Backend Implementation Plan

Create new Django app `admin_app`:

### 5.1 Models

| Model | Fields | Purpose |
|-------|--------|---------|
| `SubjectRequestControl` | `enabled` (BooleanField), `updated_by`, `updated_at` | Global toggle |
| `FacultyAttendance` | `teacher`, `date`, `status` (present/absent/leave/half_day), `marked_by` | Teacher attendance |
| `Exam` | `name`, `classes`, `sections`, `subjects`, `start_date`, `end_date`, `status` (draft/published/archived) | Exam management |
| `ExamResult` | `exam`, `student`, `subject`, `marks_obtained`, `total_marks`, `grade`, `published` | Results |
| `Event` | `title`, `description`, `date`, `venue`, `banner_image`, `status` | Event management |
| `ContactSubmission` | `name`, `email`, `phone`, `subject`, `message`, `status`, `created_at` | Contact form |
| `AdmissionApplication` | `name`, `father_name`, `mother_name`, `phone`, `address`, `stream`, `board`, `previous_school`, `marks`, `documents`, `status` | Admissions |
| `ClassTeacherAssignment` | `teacher`, `class_name`, `academic_year` | Class teacher |
| `SubjectAllocation` | `teacher`, `subject`, `classes`, `academic_year` | Subject allocation |
| `SiteContent` | `page`, `content`, `images`, `videos` | Settings content |

### 5.2 Serializers
- All model serializers
- Nested serializers for applications with marks/documents
- Admin action serializers

### 5.3 Permissions
- `IsAdmin` (already defined in `student/permissions.py` — reuse)

### 5.4 Services
- Create/update/delete for all models
- Approval workflow for admissions
- Result publication logic
- Export logic

### 5.5 Selectors
- Dashboard statistics
- Filtered queries for all models
- Attendance analytics
- Fee reporting

### 5.6 API Endpoints
```
/api/admin/dashboard/                          — Dashboard stats
/api/admin/students/                           — Student management
/api/admin/students/classes/                   — Class cards data
/api/admin/students/export/                    — Export students
/api/admin/students/subject-request-toggle/    — Enable/disable subject requests
/api/admin/teachers/                           — Teacher management
/api/admin/teachers/notifications/             — Send notification
/api/admin/teachers/class-assignment/          — Class teacher assignment
/api/admin/teachers/subject-allocation/        — Subject allocation
/api/admin/classes/                            — Class management
/api/admin/classes/<id>/                       — Class detail
/api/admin/attendance/analytics/               — Attendance analytics
/api/admin/attendance/faculty/                 — Faculty attendance
/api/admin/exams/                              — Exam CRUD
/api/admin/exams/<id>/publish/                 — Publish exam
/api/admin/exams/<id>/results/                 — Publish results
/api/admin/exams/answer-scripts/               — Answer script management
/api/admin/events/                             — Event CRUD
/api/admin/events/<id>/publish/                — Publish event
/api/admin/contacts/                           — Contact submissions
/api/admin/contacts/<id>/resolve/              — Mark resolved
/api/admin/admissions/                         — Admission applications
/api/admin/admissions/<id>/verify/             — Verify application
/api/admin/admissions/<id>/register/           — Create student account
/api/admin/settings/about/                     — About page settings
/api/admin/settings/gallery/                   — Gallery settings
/api/admin/settings/home/                      — Home page settings
/api/admin/settings/admission/                 — Admission page settings
```

---

## 6. Mock Data Expansion

Add to `mock-data.ts`:

| Data | Purpose |
|------|---------|
| `classCards` | Class name, total, boys, girls, pending requests |
| `classDetails` | Sections per class, subjects, teachers |
| `feeStatusByClass` | Paid/unpaid students per class |
| `facultyAttendance` | Teacher attendance records |
| `examsFull` | Exams with status, subjects, classes |
| `answerScriptsFull` | Answer scripts mapped to students |
| `evaluationTracking` | Teacher evaluation status |
| `eventsFull` | Events with publish status, banner |
| `contactSubmissionsFull` | With phone, resolved status |
| `admissionStats` | Dashboard statistics |
| `applicantsFull` | Full application data with docs |
| `siteContent` | About, gallery, home, admission settings |
| `classTeacherAssignments` | Teacher → class mapping |
| `subjectAllocations` | Teacher → subject → classes → session |

---

## 7. Route Changes Summary

### New Route Files to Create:
- `frontend/src/routes/admin.students.class.tsx` — Class detail view
- `frontend/src/routes/admin.students.detail.tsx` — Student detail view

### Route Files to Rewrite:
- `admin.students.tsx` — Class cards + management workflow
- `admin.teachers.tsx` — Enhanced cards + allocation
- `admin.classes.tsx` — Classes + detail view
- `admin.attendance.tsx` — Analytics + faculty attendance
- `admin.exams.tsx` — Full exam management
- `admin.fees.tsx` — Add reporting block
- `admin.events.tsx` — Full event management
- `admin.contacts.tsx` — Enhanced actions + statuses
- `admin.admissions.tsx` — Stats + doc viewer + verification
- `admin.settings.tsx` — Content management tabs

### Route Files to Keep (minor tweaks only):
- `admin.dashboard.tsx` — Already comprehensive
- `admin.reports.tsx` — Already comprehensive
- `admin.profile.tsx` — Uses shared component

---

## 8. Implementation Order

1. Create backend admin app with all models, serializers, permissions, services, selectors, URLs, views
2. Expand mock data with all new data structures
3. Rewrite `admin.students.tsx` — class card workflow
4. Rewrite `admin.teachers.tsx` — enhanced management
5. Rewrite `admin.classes.tsx` — detail views + allocation
6. Rewrite `admin.attendance.tsx` — analytics + faculty
7. Expand `admin.exams.tsx` — full lifecycle
8. Enhance `admin.fees.tsx` — reporting block
9. Expand `admin.events.tsx` — full management
10. Expand `admin.contacts.tsx` — enhanced actions
11. Expand `admin.admissions.tsx` — full workflow
12. Rewrite `admin.settings.tsx` — content management
13. Verify all portals work correctly
14. Run regression tests

---

## 9. Preservation Rules

- DO NOT modify: `admin.dashboard.tsx`, `admin.reports.tsx`, `admin.profile.tsx`
- DO NOT modify Fees & Finance module (add reporting block only)
- DO NOT modify existing Student/Teacher portal pages
- DO NOT modify authentication flow
- REUSE existing components: StatCard, Card, Badge, Table, Button, Input, Select, Dialog, Modal, DropdownMenu, Tabs, Avatar, etc.
- REUSE existing layout patterns (DashboardLayout, Outlet)
- REUSE existing mock data structure patterns
- MAINTAIN dark mode compatibility
- MAINTAIN responsive design

---

## 10. Verification Checklist

- [ ] Existing Student Portal works (dashboard, subjects, assignments, attendance, exams, results, fees, timetable, notifications, profile)
- [ ] Existing Teacher Portal works (dashboard, classes, subjects, assignments, attendance, exams, timetable, resources, profile)
- [ ] Existing Admin Dashboard works
- [ ] Authentication works (login, register, logout, role-based redirect)
- [ ] All existing routes resolve without 404
- [ ] Existing layouts render correctly
- [ ] Existing mock data still loads correctly
- [ ] No broken navigation links
- [ ] No broken forms
- [ ] Dark mode toggle works on all pages
- [ ] Mobile responsive sidebar works
