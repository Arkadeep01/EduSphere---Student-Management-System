# EduSphere — Student & Teacher Page Audit Report

> Generated: 2026-06-14
> Scope: Complete audit of all existing Student and Teacher frontend pages

---

## Table of Contents

1. [Existing Pages](#1-existing-pages)
2. [Student Portal Audit](#2-student-portal-audit)
3. [Teacher Portal Audit](#3-teacher-portal-audit)
4. [Pages to Modify](#4-pages-to-modify)
5. [New Pages Required](#5-new-pages-required)
6. [UX Changes Required](#6-ux-changes-required)
7. [Backend Requirements](#7-backend-requirements)
8. [API Requirements](#8-api-requirements)
9. [Mock Data Requirements](#9-mock-data-requirements)
10. [Integration Plan](#10-integration-plan)

---

## 1. Existing Pages

### Student Portal (10 route files)

| # | Page | Route File | Status |
|---|------|-----------|--------|
| 1 | Dashboard | `frontend/src/routes/student.dashboard.tsx` | Exists — needs UX restructure |
| 2 | Subjects | `frontend/src/routes/student.subjects.tsx` | Exists — needs workflow redesign |
| 3 | Assignments | `frontend/src/routes/student.assignments.tsx` | Exists — needs workflow redesign |
| 4 | Attendance | `frontend/src/routes/student.attendance.tsx` | Exists — needs improvement |
| 5 | Results | `frontend/src/routes/student.results.tsx` | Exists — needs improvement |
| 6 | Exam Schedule | `frontend/src/routes/student.exams.tsx` | Exists — minor changes needed |
| 7 | Timetable | `frontend/src/routes/student.timetable.tsx` | Exists — minor changes needed |
| 8 | Profile | `frontend/src/routes/student.profile.tsx` | Exists — uses shared ProfileView |
| 9 | Notifications | `frontend/src/routes/` — **missing dedicated page** | **Does not exist** |
| 10 | Fees | `frontend/src/routes/student.fees.tsx` | Exists — minor changes needed |

### Teacher Portal (9 route files)

| # | Page | Route File | Status |
|---|------|-----------|--------|
| 1 | Dashboard | `frontend/src/routes/teacher.dashboard.tsx` | Exists — needs UX restructure |
| 2 | My Classes | `frontend/src/routes/teacher.classes.tsx` | Exists — needs workflow redesign |
| 3 | My Subjects | `frontend/src/routes/teacher.subjects.tsx` | Exists — needs major redesign |
| 4 | Assignments | `frontend/src/routes/teacher.assignments.tsx` | Exists — needs workflow redesign |
| 5 | Attendance | `frontend/src/routes/teacher.attendance.tsx` | Exists — needs workflow improvement |
| 6 | Exams | `frontend/src/routes/teacher.exams.tsx` | Exists — needs complete redesign |
| 7 | Timetable | `frontend/src/routes/teacher.timetable.tsx` | Exists — needs restructuring |
| 8 | Profile | `frontend/src/routes/teacher.profile.tsx` | Exists — uses shared ProfileView |
| 9 | Resources | `frontend/src/routes/` — **missing dedicated page** | **Does not exist** |

### Shared Components

| Component | Path | Usage |
|-----------|------|-------|
| `DashboardLayout.tsx` | `components/layouts/DashboardLayout.tsx` | Shared layout for all roles, defines sidebar navigation |
| `ProfileView.tsx` | `components/dashboard/ProfileView.tsx` | Shared by student.profile.tsx and teacher.profile.tsx |
| `PageHeader.tsx` | `components/dashboard/PageHeader.tsx` | Used by all pages |
| `StatCard.tsx` | `components/dashboard/StatCard.tsx` | Used by dashboard and other pages |
| `mock-data.ts` | `lib/mock-data.ts` | Centralized mock data (694 lines) |

---

## 2. Student Portal Audit

### 2.1 Dashboard (`/student/dashboard`)

**Current Functionality:**
- Greeting with student name (hardcoded "Aarav")
- ProfileView component displayed
- 6 stat cards: Attendance (94%), GPA (3.82), Assignments Due (3), Upcoming Exams (5), Unread Notes (7), Pending Fees ($2,400)
- Subject Progress bar list (6 subjects)
- Today's Classes (from timetable mock data)
- Recent Results (4 items from results array)
- Announcements & Holidays section

**Missing Functionality:**
- No Academic Growth widget (chart showing progress over time)
- No Subject Improvement widget (per-subject trend)
- No Assignment Performance widget (submission rate, grades)
- No Attendance Performance chart (monthly/weekly trends)
- No Class Ranking widget
- Hardcoded name instead of dynamic from auth context
- Uses mock data directly — no API integration layer

**Required UX Changes:**
- Replace hardcoded name with actual user data
- Add Academic Growth chart (line chart showing monthly GPA/progress)
- Add Subject Improvement radar or bar chart
- Add Assignment Performance section (completed vs pending pie/bar)
- Add Attendance Performance mini chart
- Add Class Ranking display or mini leaderboard
- Keep existing Subject Progress and Today's Classes if space permits

**Backend Entities:** StudentProfile, Subject, Attendance, Result, Assignment
**API Endpoints:** `/api/student/dashboard/`

---

### 2.2 Subjects (`/student/subjects`)

**Current Functionality:**
- Grid of 6 subject cards with gradient backgrounds, code, name, teacher, progress bar
- Subject detail panel with Tabs: Overview, Notes, Assignments, Resources
- Click on card selects it and shows detail panel
- Uses `subjects` mock data array

**Critical Issues:**
- No subject category distinction (core/specialized/enriched)
- No subject selection workflow
- No admin approval workflow
- No "pending approval" status display
- All subjects shown as already-assigned

**Subject Category Support:**
| Category | Mock Data Has | Page Shows | Selection Required |
|----------|---------------|------------|-------------------|
| Core | 6 subjects (MATH101, PHY201, ENG110, BIO150, CHM120, CS210) | All shown | Auto-assigned |
| Specialized | 5 subjects (BST301, RES320, ECO250, PGO440, ICT220) | Not differentiated | Min 2 required |
| Enrichment | 3 subjects (HIS180, GEO210, ART440) | Not differentiated | Min 1 required |

**Required Workflow Support:**

Workflow A (Student selects):
1. Student views available subjects
2. Core subjects pre-selected
3. Student selects min 2 specialized + min 1 enriched
4. Selection submitted
5. Admin reviews and approves/rejects
6. Status visible on subject page

Workflow B (Admin assigns):
1. During admission process
2. Admin assigns subjects
3. Student views assigned subjects

**Required UX Changes:**
- Separate subject categories into distinct sections (Core / Specialized / Enriched)
- Add subject selection interface (checkboxes, cards with select state)
- Add "Request Approval" or "Save Selection" button
- Add approval status badges (Pending, Approved, Rejected)
- Add confirmation dialog before submission
- Show locked/unlocked state for subjects
- Add Subject Approval Status page

**New Pages Needed:**
1. **Subject Selection Page** — for workflow A where student chooses subjects
2. **Subject Approval Status Page** — showing pending/approved/rejected status

**Backend Entities:** Subject, StudentSubject, StudentProfile
**API Endpoints:**
- `GET /api/student/subjects/` — list all available subjects
- `GET /api/student/subjects/my/` — list student's assigned subjects with status
- `POST /api/student/subjects/select/` — submit subject selection

**Mock Data:** Enhanced mock data for subject categories, selection states, approval workflow

---

### 2.3 Assignments (`/student/assignments`)

**Current Functionality:**
- Table with columns: Title, Subject, Due, Status, Action
- 6 assignment rows from mock data
- Submit button (toast only) for pending assignments
- View button for graded assignments

**Missing Functionality:**
- No **Assignment Details** page/view (clicking an assignment should show title, subject, description, due date, status, teacher remarks, marks)
- No **Upload Submission** flow (file upload, submission confirmation)
- No **Submission History** (previously submitted assignments with grades)
- No **Marks Display** (grade, percentage, feedback)
- No **Teacher Remarks** visible

**Required Fields (from backend Assignment model):**
| Field | Current | Required |
|-------|---------|----------|
| Title | ✅ Yes | ✅ Yes |
| Subject | ✅ Yes | ✅ Yes |
| Description | ❌ Not shown | ✅ Mandatory |
| Due Date | ✅ Yes | ✅ Yes |
| Status | ✅ Yes | ✅ Yes |
| Marks/Grade | ❌ Not shown | ✅ Required after evaluation |
| Teacher Remarks | ❌ Not shown | ✅ Required after evaluation |

**Required UX Changes:**
- Make assignment rows clickable → Assignment Details view
- Add submission modal/page with file upload
- Show submission status (Pending, Submitted, Late, Evaluated)
- Show marks and teacher remarks after evaluation
- Add Submission History section

**New Pages Needed:**
1. **Assignment Details** (`/student/assignments/:id`) — full details, description, submission area, marks
2. **Submission Page** — file upload, notes, confirm submission
3. **Submission History** — list of past submissions with grades

**Backend Entities:** Assignment, AssignmentSubmission, Subject
**API Endpoints:**
- `GET /api/student/assignments/` — list assignments
- `GET /api/student/assignments/:id/` — assignment detail
- `GET /api/student/submissions/` — list submissions
- `POST /api/student/submissions/` — upload submission

---

### 2.4 Attendance (`/student/attendance`)

**Current Functionality:**
- 3 StatCards: Present (27d), Absent (3d), Attendance % (90%)
- Calendar grid showing 30 days (green present, red absent)
- Hardcoded mock data (last30 array)

**Missing Functionality:**
- No daily attendance breakdown by subject/class
- No monthly attendance view (switch months)
- No attendance percentage trend (chart over time)
- No subject-wise attendance
- No date range selector

**Required UX Changes:**
- Add monthly calendar view with navigation (prev/next month)
- Add attendance percentage trend chart (line chart)
- Add subject-wise attendance breakdown (if multi-subject)
- Keep StatCards for summary
- Add legend for status colors

**Backend Entities:** Attendance, StudentProfile
**API Endpoints:**
- `GET /api/student/attendance/` — attendance records

---

### 2.5 Results (`/student/results`)

**Current Functionality:**
- PageHeader with Total, GPA, Rank (hardcoded)
- Table: Subject, Marks, Total, Grade
- Radar Chart showing subject-wise marks
- Uses `results` mock data (6 subjects)

**Missing Functionality:**
- No exam-wise filtering (midterm, final, unit test)
- No term/semester selection
- No ranking display (class rank, section rank)
- No historical comparison (previous exam results)
- No performance trend

**Required UX Changes:**
- Add exam selector dropdown (filter by exam name)
- Add term/semester tabs
- Add ranking section (class rank, section rank, overall)
- Add performance comparison with previous exams
- Add grade distribution chart
- Keep radar chart for subject profile

**Backend Entities:** Result, Subject, StudentProfile
**API Endpoints:**
- `GET /api/student/results/` — results list

---

### 2.6 Exam Schedule (`/student/exams`)

**Current Functionality:**
- Card grid of 5 exams with gradient top border
- Each card: Badge (Midterm), Name, Date, Time/Duration, Room
- Uses `exams` mock data

**Missing Functionality:**
- No exam status (upcoming, ongoing, completed)
- No countdown to next exam
- No exam details page (syllabus, instructions)
- No hall ticket/admit card display
- No exam type filter (Midterm, Final, Quiz)

**Required UX Changes:**
- Add exam status badges (Upcoming, Ongoing, Completed)
- Add countdown timer for next exam
- Add exam type filter tabs
- Expand to show syllabus or instructions on click

**Backend Entities:** None specific — likely part of admin-managed Exam model
**API Endpoints:** Not yet defined in student URLs — may need new endpoint

---

### 2.7 Timetable (`/student/timetable`)

**Current Functionality:**
- Grid layout with Time column + 5 day columns
- Shows slots: 08:00, 09:00, 10:00, 11:30
- Each slot shows Subject, Teacher, Room
- Uses `timetable` mock data

**Missing Functionality:**
- No future sync with Admin/Teacher portals (currently static mock)
- No current day highlighting
- No class type indicators (Lab, Library, Regular)
- No edit mode

**Required UX Changes:**
- Highlight current day and current time slot
- Add class type badges (Regular, Lab, Library)
- Prepare data structure for API integration
- Add loading/sync state for future dynamic data

**Backend Entities:** Timetable (student model), Subject
**API Endpoints:**
- `GET /api/student/timetable/` — weekly timetable

---

### 2.8 Profile (`/student/profile`)

**Current Functionality:**
- Uses shared `ProfileView` component
- Avatar with initials from auth context
- Name, email, role display
- 4 Tabs: Personal, Documents, Notifications, Security
- Personal: Full name, Email, Phone, Address fields
- Documents: Empty placeholder
- Notifications: Empty placeholder
- Security: Current password, New password fields

**Missing Sections:**
| Section | Current | Required |
|---------|---------|----------|
| Personal Information | Partial | ✅ Full name, email, phone, address, DOB, gender |
| Academic Information | ❌ Missing | ✅ Roll number, class, section, admission number |
| Parents Information | ❌ Missing | ✅ Father Name, Mother Name, Guardian, Contact |
| Documents | ❌ Empty | ✅ Upload/view documents (marksheets, photos, ID) |
| Profile Photo | ❌ Avatar only | ✅ Upload profile photo |
| Password Management | Partial | ✅ Change password |
| Notifications | ❌ Empty | ✅ Notification preferences (email, push) |
| Username | ❌ Missing | ✅ Display username |

**Required UX Changes:**
- Add Father Name field to Personal tab
- Add Mother Name field to Personal tab
- Add Username display field
- Add profile photo upload (click to upload)
- Create new **Academic Information** tab
- Create new **Parents Information** tab/section
- Populate Documents tab with mock documents
- Populate Notifications tab with preference toggles
- Keep Security tab with password reset
- Add "Reset Password" flow

**Backend Entities:** StudentProfile, AdmissionDocument
**API Endpoints:**
- `GET /api/student/profile/` — profile data
- `PUT /api/student/profile/` — update profile

---

### 2.9 Notifications

**Current State:**
- No dedicated `/student/notifications` page
- Only displayed in sidebar `DropdownMenu` (topbar bell icon)
- Uses `notifications` mock data array (4 items)
- Shows: title, description, time, unread indicator

**Missing Functionality:**
- No dedicated notifications page
- No notification categories (Timetable Updates, Fee Notifications, Exam Schedule Updates)
- No morning notification simulation
- No mark as read functionality
- No "View All" link from dropdown
- No notification history

**Required UX Changes:**
- Create dedicated **Notifications** page at `/student/notifications`
- Add route to sidebar navigation
- Show notifications grouped by category (Timetable, Fee, Exam, Assignment, General)
- Add morning notification simulation (mock data with timestamp showing "This morning")
- Add "Mark all as read" button
- Add notification count badge per category
- Add notification detail view (expandable)

**New Page Needed:**
1. **Student Notifications Page** (`/student/notifications`)

**Backend Entities:** Notification
**API Endpoints:**
- `GET /api/student/notifications/` — list notifications
- `PUT /api/student/notifications/:id/read/` — mark as read

---

### 2.10 Fees (`/student/fees`)

**Current Functionality:**
- 3 StatCards: Total Paid ($4,800), Pending ($2,400), Annual Fee ($7,200)
- Table: Term, Amount, Due Date, Status, Action
- 3 fee entries (Q1 paid, Q2 paid, Q3 pending)
- Pay Now button (toast)
- Receipt download button

**Missing Functionality:**
- No fee breakdown (tuition, library, lab, transport)
- No payment method/ gateway integration
- No invoice/receipt download (currently only toast)
- No fee due date reminders
- No late fee calculation

**Required UX Changes:**
- Add fee structure breakdown section
- Add payment history with receipts
- Add fee receipt download (mock PDF generation display)
- Add due date countdown for pending fees
- Keep existing structure mostly intact

**Backend Entities:** Not yet defined in backend — likely Fee model needed
**API Endpoints:** Not yet defined — requires new Fee model and endpoints

---

## 3. Teacher Portal Audit

### 3.1 Teacher Subject Architecture Violations

**Required Architecture (from AGENTS.md):**
```
One Teacher → One Subject → Multiple Classes
```

**Current Violations Found:**

| Location | Violation |
|----------|-----------|
| `frontend/src/routes/teacher.subjects.tsx:17` | Slices `subjects.slice(0, 3)` — displays 3 subjects |
| `frontend/src/routes/teacher.dashboard.tsx` | Shows generic examPerformance data — not subject-specific |
| `frontend/src/routes/teacher.classes.tsx:7-14` | Shows classes with different subjects (Mathematics, Calculus) |
| `frontend/src/lib/mock-data.ts:54-55` | teachers array has multi-subject data (multiple teachers per subject) |
| `frontend/src/routes/teacher.timetable.tsx` | Uses student timetable data — not teacher-specific schedule |

**All components assuming multi-subject must be replaced with single-subject architecture.**

---

### 3.2 Dashboard (`/teacher/dashboard`)

**Current Functionality:**
- Greeting "Good morning, Dr. Rao" (hardcoded)
- 4 StatCards: Assigned Classes (6), Total Students (192), Assignments Pending (3), Attendance Pending (2)
- Class Performance bar chart (all subjects from examPerformance)
- Today's Schedule (from timetable mock data — student schedule)
- Recent Submissions (from assignments mock data)
- Announcements

**Missing Functionality:**
- No Assigned Subject display (what subject does this teacher teach?)
- No class-wise student count
- No Pending Evaluations count (from AnswerScript)
- No Assignment Metrics (total assignments, average score)
- No subject-specific performance data
- Hardcoded teacher name — should come from auth

**Required UX Changes:**
- Show teacher's assigned subject prominently at top
- Replace generic stat cards with teacher-specific ones:
  - Assigned Subject (badge)
  - Total Classes (count of assigned classes)
  - Total Students (sum across classes)
  - Pending Evaluations (answer scripts to grade)
  - Pending Attendance (classes not yet marked)
  - Assignment Metrics (total, graded, pending)
- Replace Class Performance chart with subject-specific performance
- Replace Today's Schedule with teacher's own timetable
- Dynamic teacher name from auth context

**Backend Entities:** TeacherProfile, TeacherClassAssignment, AnswerScript, Assignment
**API Endpoints:** `GET /api/teacher/dashboard/`

---

### 3.3 My Classes (`/teacher/classes`)

**Current Functionality:**
- Grid of 6 class cards
- Each card: gradient top border, icon, student count badge, class name, subject
- Hardcoded classes array with different subjects (Mathematics, Calculus)
- No details on click

**Missing Functionality:**
- No Regular/Lab/Library session distinction
- No "Convert to Library Session" feature
- No library slot availability display
- No working hours display (9:30 AM – 5:00 PM)
- No recess indicator
- No student list on class click
- Multi-subject assumption (should be single subject)

**Required UX Changes:**
- Show all classes for the teacher's single subject only
- Add session type badges (Regular, Lab, Library)
- Add working hours banner (9:30 AM – 5:00 PM)
- Add recess period indication
- Add "Convert to Library Session" button per class slot
- Show available library slots when converting
- Add student count per class
- Make class cards clickable → student list view

**Backend Entities:** TeacherProfile, TeacherClassAssignment, TimetableEntry, LibrarySession
**API Endpoints:**
- `GET /api/teacher/classes/` — assigned classes
- `GET /api/teacher/classes/:name/students/` — student list
- `GET /api/teacher/timetable/convert-library/` — available library slots
- `POST /api/teacher/timetable/convert-library/` — convert to library

---

### 3.4 My Subjects (`/teacher/subjects`)

**Current Functionality:**
- Shows 3 subject cards (first 3 from subjects mock data)
- Tabs: Overview, Notes, Assignments, Resources, Submissions
- Overview shows generic text
- Notes: Create note button + 3 mock notes
- Assignments: New assignment button + 3 assignments
- Resources: Upload resource button + 3 resources
- Submissions: Generic text "18 of 32 students..."

**Critical Violation:**
- **Shows multiple subjects** — violates single-subject architecture
- Should show ONLY the teacher's assigned single subject

**Required UX Changes:**
- Show only ONE subject (the teacher's assigned subject)
- Add subject info header: name, code, total classes, total students
- Add **Chapters** section with progress tracking
- Add **Progress** bar for syllabus completion
- Add **Classes** list showing which classes take this subject
- Add **Resources** grid (notes, PDFs, videos, documents)
- Add **Assignments** list with class-wise filtering
- Add **Evaluation Status** summary

**Backend Entities:** TeacherProfile, Subject, Resource, Assignment, AnswerScript
**API Endpoints:**
- `GET /api/teacher/subject/` — teacher's assigned subject
- `PUT /api/teacher/subject/progress/` — update syllabus progress

---

### 3.5 Resources (New Page — `/teacher/resources`)

**Current State:**
- No dedicated resources page exists
- Resources tab exists inside `teacher.subjects.tsx` but is insufficient

**Required Functionality:**
- Dedicated page for managing teaching resources
- Support multiple resource types: Notes, PDFs, Videos, Documents
- Upload new resources (file upload)
- Categorize by class/section
- Download/view existing resources
- Edit/delete resources

**New Page Needed:**
1. **Teacher Resources Page** (`/teacher/resources`)

**Backend Entities:** Resource (already exists in teacher models)
**API Endpoints:**
- `GET /api/teacher/resources/` — list resources
- `POST /api/teacher/resources/` — upload resource
- `DELETE /api/teacher/resources/:id/` — delete resource

---

### 3.6 Assignments (`/teacher/assignments`)

**Current Functionality:**
- Table: Title, Subject, Due, Submissions (X/total), Status, Action (Review)
- "New Assignment" button in PageHeader actions
- No create assignment form/modal
- No class filtering
- No grading/submission detail view

**Missing Functionality:**
- No **Create Assignment** flow (title, description, subject, target class, due date, file attachment)
- No **Select Class** step (teacher must choose which class to assign to)
- No **Publish** workflow (draft → publish)
- No **Submission Tracking** (per-student submission status)
- No **Grading** interface (marks input, remarks)
- No **Review** workflow (view submission, add remarks, save grade)

**Required Flow:**
```
Create Assignment → Select Class → Publish → Students Receive → Teacher Tracks → Teacher Grades → Teacher Reviews
```

**Required UX Changes:**
- Add Create Assignment page/ modal with form fields: Title, Description (mandatory), Subject (auto-assigned), Target Class, Due Date, File attachment
- Add class filter to assignment list
- Add submission tracking per assignment (click → class-wise submission grid)
- Add grading modal/ page with per-student marks input and remarks
- Add assignment status workflow (Draft → Published → Closed)

**Backend Entities:** Assignment, AssignmentSubmission, Subject, TeacherProfile
**API Endpoints:**
- `GET /api/teacher/assignments/` — list assignments
- `POST /api/teacher/assignments/create/` — create assignment
- `GET /api/teacher/assignments/:id/submissions/` — list submissions
- `PUT /api/teacher/submissions/:id/grade/` — grade submission

---

### 3.7 Attendance (`/teacher/attendance`)

**Current Functionality:**
- PageHeader: "Mark Attendance — Class 10-A · Today"
- Student table with Present/Absent toggle buttons
- Save button with toast confirmation
- Summary badges at bottom (X Present, Y Absent)
- Uses first 10 students from mock data

**Missing Functionality:**
- No **Current Active Class** selector (hardcoded to 10-A)
- No date selector (hardcoded to Today)
- No class switching without page refresh
- No attendance already-marked indicator
- No bulk actions (mark all present/absent)

**Required Flow:**
```
Current Active Class → Attendance Grid → Save Attendance
```

**Required UX Changes:**
- Add class selector dropdown (only teacher's assigned classes)
- Add date picker or date navigation
- Show attendance status for selected date
- Add "Mark All Present" and "Mark All Absent" bulk buttons
- Add visual indicator for already-marked dates
- Add confirmation dialog before save
- Show attendance summary per class

**Backend Entities:** Attendance, TeacherClassAssignment
**API Endpoints:**
- `POST /api/teacher/attendance/mark/` — mark attendance
- `GET /api/teacher/attendance/:class_name/summary/` — attendance summary

---

### 3.8 Exams (`/teacher/exams`)

**Current Functionality:**
- PageHeader with "Upload marks" button
- Basic table: Exam, Date, Room, Action ("Enter marks" button)
- Uses `exams` mock data (5 exams)
- No exam-specific functionality beyond list

**Critical Issues:**
- **No Answer Script workflow** — the most critical missing feature
- No evaluation queue
- No student list per exam
- No answer script viewer
- No draft marks system
- No remarks input
- No final marks submission

**Required Flow:**
```
Class Selection → Answer Script Queue → Student List → Answer Script Viewer → Draft Marks → Remarks → Final Marks Submission
```

Where:
- **Admin uploads** answer scripts
- **Teacher evaluates** scripts

**Required UX Changes (Complete Redesign Needed):**

**New Pages Needed:**
1. **Exam Dashboard** (`/teacher/exams`) — overview of all exams, evaluation progress, pending scripts count
2. **Evaluation Queue** (`/teacher/exams/evaluate`) — list of pending answer scripts per exam/class
3. **Answer Script Viewer** (`/teacher/exams/script/:id`) — view student answer script, input draft marks, add remarks
4. **Marks Submission** (`/teacher/exams/submit/:examId`) — review all evaluated scripts and submit final marks

**Mock Data Needs:**
- AnswerScript objects with student info, exam name, status
- Script file references (mock PDFs)
- Draft marks and draft remarks

**Backend Entities:** AnswerScript, TeacherProfile, StudentProfile, Subject
**API Endpoints:**
- `GET /api/teacher/evaluation/queue/` — evaluation queue
- `GET /api/teacher/evaluation/:id/` — script detail
- `POST /api/teacher/evaluation/:id/draft/` — save draft marks
- `POST /api/teacher/evaluation/:id/submit/` — submit final marks

---

### 3.9 Timetable (`/teacher/timetable`)

**Current Functionality:**
- Same grid layout as student timetable
- Uses student `timetable` mock data — **incorrect**
- Shows all subjects, not just teacher's classes

**Missing Functionality:**
- No teacher-specific schedule
- No filtering by assigned classes only
- No session type indicators (Regular, Lab, Library)
- No library session markers

**Required UX Changes:**
- Replace with teacher-specific timetable data
- Show only teacher's assigned classes
- Add session type badges
- Show room numbers for each session
- Highlight library sessions (converted)
- Highlight current day/time

**Backend Entities:** TimetableEntry (teacher model), TeacherProfile
**API Endpoints:**
- `GET /api/teacher/timetable/` — weekly timetable

---

### 3.10 Profile (`/teacher/profile`)

**Current Functionality:**
- Uses shared `ProfileView` component (same as student)
- Avatar, name, email, role
- 4 Tabs: Personal, Documents, Notifications, Security

**Missing Sections:**
| Section | Current | Required |
|---------|---------|----------|
| Personal Information | Partial | ✅ Full name, email, phone, address |
| Subject Information | ❌ Missing | ✅ Assigned subject display |
| Classes Assigned | ❌ Missing | ✅ List of assigned classes |
| Qualifications | ❌ Missing | ✅ Degree, certifications |
| Experience | ❌ Missing | ✅ Years of experience, previous institutions |
| Documents | ❌ Empty | ✅ Appointment letter, certificates |
| Profile Image | ❌ Avatar only | ✅ Upload photo |
| Password Reset | Partial | ✅ Change password |
| Notification Settings | ❌ Empty | ✅ Email/push preferences |

**Required UX Changes:**
- Replace shared ProfileView with teacher-specific profile
- Add **Subject Information** section showing assigned subject
- Add **Classes Assigned** section listing all classes
- Add **Qualifications** section (degree, institution, year)
- Add **Experience** section (years, previous schools, positions)
- Add documents upload section for certificates
- Add profile photo upload
- Keep Security tab with password reset
- Add notification settings toggles

**Backend Entities:** TeacherProfile, TeacherClassAssignment
**API Endpoints:**
- `GET /api/teacher/profile/` — profile data
- `PUT /api/teacher/profile/` — update profile

---

## 4. Pages to Modify

### Student Pages Requiring Modification

| Page | Change Type | Effort |
|------|------------|--------|
| `student.subjects.tsx` | Workflow redesign + category support | High |
| `student.assignments.tsx` | Major redesign — needs detail, submission, history | High |
| `student.dashboard.tsx` | UX restructure — add missing widgets | Medium |
| `student.attendance.tsx` | Enhancement — monthly view, trends | Medium |
| `student.results.tsx` | Enhancement — exam filter, ranking | Medium |
| `student.profile.tsx` | Restructure — add missing sections | Medium |
| `student.timetable.tsx` | Enhancement — current day highlight | Low |
| `student.exams.tsx` | Enhancement — status, countdown | Low |
| `student.fees.tsx` | Enhancement — breakdown, receipts | Low |

### Teacher Pages Requiring Modification

| Page | Change Type | Effort |
|------|------------|--------|
| `teacher.subjects.tsx` | Major redesign — single subject architecture | High |
| `teacher.assignments.tsx` | Workflow redesign — create, grade, track | High |
| `teacher.exams.tsx` | Complete redesign — answer script workflow | High |
| `teacher.dashboard.tsx` | UX restructure — teacher-specific metrics | Medium |
| `teacher.classes.tsx` | Workflow redesign — library conversion, session types | Medium |
| `teacher.attendance.tsx` | Enhancement — class selector, bulk actions | Medium |
| `teacher.profile.tsx` | Restructure — add missing sections | Medium |
| `teacher.timetable.tsx` | Replacement — teacher-specific data | Low |

### Shared Components Requiring Modification

| Component | Change |
|-----------|--------|
| `ProfileView.tsx` | Must be made role-specific (split or extend) |
| `DashboardLayout.tsx` | Add notifications route to sidebar |
| `mock-data.ts` | Expanded significantly |

---

## 5. New Pages Required

### Student New Pages

| # | Page | Route Path | Purpose |
|---|------|-----------|---------|
| 1 | Subject Selection | `/student/subjects/select` | Student selects specialized & enriched subjects |
| 2 | Subject Approval Status | `/student/subjects/approval` | View pending/approved/rejected subject selections |
| 3 | Assignment Details | `/student/assignments/:id` | Full assignment view with description, submission, marks |
| 4 | Assignment Submission | `/student/assignments/:id/submit` | File upload and submit |
| 5 | Submission History | `/student/assignments/history` | Past submissions with grades |
| 6 | Notifications | `/student/notifications` | Full notification center with categories |

### Teacher New Pages

| # | Page | Route Path | Purpose |
|---|------|-----------|---------|
| 1 | Resources | `/teacher/resources` | Manage teaching resources (notes, PDFs, videos, docs) |
| 2 | Exam Dashboard | `/teacher/exams` | All exams overview with evaluation progress |
| 3 | Evaluation Queue | `/teacher/exams/evaluate` | Pending answer scripts to evaluate |
| 4 | Answer Script Viewer | `/teacher/exams/script/:id` | View script, input draft marks, add remarks |
| 5 | Marks Submission | `/teacher/exams/submit/:examId` | Review and submit final marks |
| 6 | Create Assignment | `/teacher/assignments/create` | Create and publish new assignment |

**Total new pages: 12**

---

## 6. UX Changes Required

### Cross-cutting UX Principles

1. **Mock data visualization** — all pages must show realistic data, no blank states
2. **Consistent design language** — maintain existing shadcn/ui patterns, gradient accents, card-based layouts
3. **Full navigation** — all sidebar links functional between pages
4. **No placeholder text** — every page demonstrates intended final workflow
5. **Loading states** — skeleton loaders where dynamic data will be fetched later

### Student UX Changes Summary

| Page | Key Changes |
|------|------------|
| Dashboard | Add Academic Growth chart, Subject Improvement widget, Attendance chart, Class Ranking |
| Subjects | Categorize as Core/Specialized/Enriched, add selection interface, approval badges |
| Assignments | Add details view, submission upload, marks display, submission history |
| Attendance | Add monthly calendar, attendance trend chart, subject-wise breakdown |
| Results | Add exam filter, ranking display, historical comparison |
| Exams | Add status badges, countdown timer, exam type filters |
| Timetable | Highlight current day/time, add class type badges |
| Profile | Add Father/Mother name, Academic Info, Parents Info, Profile Photo upload |
| Notifications | New dedicated page with categories, morning simulation |
| Fees | Add breakdown, receipt download, due countdown |

### Teacher UX Changes Summary

| Page | Key Changes |
|------|------------|
| Dashboard | Show assigned subject, pending evaluations, assignment metrics |
| Classes | Session types, library conversion, working hours, student lists |
| Subjects | Single subject view, chapters, progress, classes, resources, evaluations |
| Assignments | Create assignment form, class selection, submission grid, grading interface |
| Attendance | Class selector, date picker, bulk actions, already-marked indicators |
| Exams | Complete answer script evaluation workflow (queue, viewer, draft, submit) |
| Timetable | Teacher-specific schedule showing only assigned classes |
| Profile | Subject info, qualifications, experience, documents upload |
| Resources | New page: upload, categorize, download teaching resources |

---

## 7. Backend Requirements

### Existing Backend Entities (Adequate)

| Entity | Location | Notes |
|--------|----------|-------|
| Subject | `backend/student/models.py` | Has tier field (core/specialized/enriched) ✅ |
| StudentProfile | `backend/student/models.py` | Has father_name, mother_name ✅ |
| StudentSubject | `backend/student/models.py` | Has status (pending/approved/rejected) ✅ |
| Assignment | `backend/student/models.py` | Has description (mandatory), target_class ✅ |
| AssignmentSubmission | `backend/student/models.py` | Has grade, remarks, status ✅ |
| Attendance | `backend/student/models.py` | Has date, status, marked_by ✅ |
| Result | `backend/student/models.py` | Has marks_obtained, total_marks, grade ✅ |
| Timetable | `backend/student/models.py` | Has is_library_session field ✅ |
| Notification | `backend/student/models.py` | Has notification_type (timetable, fee, exam) ✅ |
| TeacherProfile | `backend/teacher/models.py` | Has assigned_subject FK ✅ |
| TeacherClassAssignment | `backend/teacher/models.py` | Maps teacher to classes ✅ |
| TimetableEntry | `backend/teacher/models.py` | Has session_type, is_library_converted ✅ |
| LibrarySession | `backend/teacher/models.py` | Tracks library bookings ✅ |
| Resource | `backend/teacher/models.py` | Has type, file, target_class ✅ |
| AnswerScript | `backend/teacher/models.py` | Has draft_marks, draft_remarks, evaluation_status ✅ |

### Backend Models Already Cover All Required Fields

The backend models correctly implement:
- Subject tier categorization (core/specialized/enriched)
- Student subject assignment with approval workflow
- Assignment description as mandatory field
- Assignment submission with grade and remarks
- Teacher single-subject architecture (ForeignKey to Subject)
- Teacher class assignments (separate mapping model)
- Timetable with library session support
- Library session booking and availability
- Resources with type and class targeting
- Answer script evaluation workflow (draft → final)

### Missing Backend Entities

| Entity | Needed For | Priority |
|--------|-----------|----------|
| **Fee/FeePayment model** | Student fees page | Medium (can use mock data) |
| **Exam model** (if not existing) | Student exam schedule, teacher evaluation | Medium |
| **Chapter/Syllabus model** | Teacher subject progress tracking | Low |

---

## 8. API Requirements

### Student API Endpoints

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/student/dashboard/` | GET | Aggregated dashboard data | High |
| `/api/student/profile/` | GET/PUT | Profile CRUD | High |
| `/api/student/subjects/` | GET | Available subjects | High |
| `/api/student/subjects/my/` | GET | Assigned subjects with status | High |
| `/api/student/subjects/select/` | POST | Submit subject selection | High |
| `/api/student/assignments/` | GET | Assignment list | High |
| `/api/student/assignments/:id/` | GET | Assignment detail | High |
| `/api/student/submissions/` | GET/POST | Submission list & create | High |
| `/api/student/attendance/` | GET | Attendance records | Medium |
| `/api/student/results/` | GET | Results list | Medium |
| `/api/student/timetable/` | GET | Weekly timetable | Medium |
| `/api/student/notifications/` | GET | Notification list | Medium |
| `/api/student/notifications/:id/read/` | PUT | Mark as read | Low |

### Teacher API Endpoints

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/teacher/dashboard/` | GET | Aggregated dashboard data | High |
| `/api/teacher/profile/` | GET/PUT | Profile CRUD | High |
| `/api/teacher/subject/` | GET | Assigned subject with details | High |
| `/api/teacher/subject/progress/` | PUT | Update syllabus progress | Medium |
| `/api/teacher/classes/` | GET | Assigned classes list | High |
| `/api/teacher/classes/:name/students/` | GET | Student list for class | High |
| `/api/teacher/assignments/` | GET | Assignment list | High |
| `/api/teacher/assignments/create/` | POST | Create assignment | High |
| `/api/teacher/assignments/:id/submissions/` | GET | Submission list per assignment | High |
| `/api/teacher/submissions/:id/grade/` | PUT | Grade a submission | High |
| `/api/teacher/attendance/mark/` | POST | Mark attendance | High |
| `/api/teacher/attendance/:class/summary/` | GET | Attendance summary | Medium |
| `/api/teacher/timetable/` | GET | Weekly timetable | Medium |
| `/api/teacher/timetable/convert-library/` | GET/POST | Library session conversion | Medium |
| `/api/teacher/library-bookings/` | GET | Available library slots | Medium |
| `/api/teacher/evaluation/queue/` | GET | Pending evaluations | High |
| `/api/teacher/evaluation/:id/` | GET | Script detail | High |
| `/api/teacher/evaluation/:id/draft/` | POST | Save draft marks | High |
| `/api/teacher/evaluation/:id/submit/` | POST | Submit final marks | High |
| `/api/teacher/resources/` | GET/POST | Resource CRUD | Medium |
| `/api/teacher/resources/:id/` | DELETE | Delete resource | Low |

**Note:** Backend URLs in `backend/student/urls.py` and `backend/teacher/urls.py` already define most of these endpoints with corresponding views.

---

## 9. Mock Data Requirements

### Current Mock Data (`frontend/src/lib/mock-data.ts`)

| Export | Line | Used For | Status |
|--------|------|----------|--------|
| `subjects` | 84-101 | Subject cards, progress | ✅ Exists — needs expansion |
| `assignments` | 103-110 | Assignment tables | ✅ Exists — needs expansion |
| `exams` | 112-118 | Exam schedule | ✅ Exists |
| `results` | 120-127 | Results table | ✅ Exists — needs ranking |
| `fees` | 143-147 | Fee table | ✅ Exists |
| `timetable` | 149-155 | Schedule grid | ✅ Exists — needs teacher version |
| `notifications` | 157-162 | Notification dropdown | ✅ Exists — needs categories |
| `announcements` | 164-168 | Dashboard announcements | ✅ Exists |
| `students` | 43-51 | Attendance marking | ✅ Exists |
| `teachers` | 53-82 | Teacher listing | ✅ Exists |
| `holidays` | 137-141 | Holiday list | ✅ Exists |

### New Mock Data Required

| Mock Data | Purpose | Used By |
|-----------|---------|---------|
| `subjectCategories` | Core/Specialized/Enriched categorization | Student Subjects page |
| `subjectSelection` | Student's selected subjects with approval status | Subject Selection, Approval Status |
| `assignmentDetails` | Full assignment with description, teacher notes | Assignment Details page |
| `submissions` | Student's submission history with grades | Submission History |
| `attendanceMonthly` | Monthly attendance data with subject breakdown | Attendance page |
| `resultRankings` | Class rank, section rank data | Results page |
| `teacherProfile` | Full teacher profile with qualifications, experience | Teacher Profile |
| `teacherSubject` | Single teacher subject with chapters, progress | Teacher Subjects |
| `teacherTimetable` | Teacher-specific weekly schedule | Teacher Timetable |
| `answerScripts` | Student answer scripts for evaluation | Exam Evaluation queue |
| `evaluationQueue` | Pending evaluations with status | Evaluation Queue |
| `librarySlots` | Available library time slots | Library conversion |
| `studentProfile` | Full student profile with parents info, documents | Student Profile |
| `notificationCategories` | Grouped notifications (Timetable, Fee, Exam) | Notifications page |
| `feeBreakdown` | Fee structure components | Fees page |

---

## 10. Integration Plan

### Phase 1: Mock Data Enhancement (Foundation)

**Duration:** Week 1

- Expand `mock-data.ts` with all new data structures
- Create type definitions for new data shapes
- Ensure consistency between mock data shapes and backend model shapes

### Phase 2: Student Portal Pages (Implementation)

**Duration:** Weeks 2-3

1. **Student Dashboard** — Add missing widgets, charts, dynamic name
2. **Student Subjects** — Split into categories, add selection UI, approval badges
3. **Student Assignments** — Add details view, submission flow, history page
4. **Student Attendance** — Enhance with monthly view, trends
5. **Student Results** — Add exam filter, ranking display
6. **Student Notifications** — Create dedicated page with categories
7. **Student Profile** — Add missing sections (Parents, Academic, Documents)

**New routes to create:**
- `/student/subjects/select`
- `/student/subjects/approval`
- `/student/assignments/:id`
- `/student/assignments/:id/submit`
- `/student/assignments/history`
- `/student/notifications`

### Phase 3: Teacher Portal Pages (Implementation)

**Duration:** Weeks 4-6

1. **Teacher Dashboard** — Replace with single-subject metrics
2. **Teacher Subjects** — Single subject view with chapters, progress
3. **Teacher Classes** — Add session types, library conversion
4. **Teacher Assignments** — Add create form, class filter, grading interface
5. **Teacher Attendance** — Add class selector, date picker, bulk actions
6. **Teacher Exams** — Complete evaluation workflow (4 new pages)
7. **Teacher Timetable** — Teacher-specific schedule
8. **Teacher Profile** — Add qualifications, experience, classes
9. **Teacher Resources** — New dedicated page

**New routes to create:**
- `/teacher/resources`
- `/teacher/exams/evaluate`
- `/teacher/exams/script/:id`
- `/teacher/exams/submit/:examId`
- `/teacher/assignments/create`

### Phase 4: Navigation & Layout Updates

**Duration:** End of Phase 3

- Update `DashboardLayout.tsx` sidebar navigation with new routes
- Ensure all new pages are accessible from sidebar
- Add notification page link to notification dropdown
- Update role-specific navigation items

### Phase 5: Backend API Integration

**Duration:** After all frontend mock data phases

- Connect frontend API calls to Django REST endpoints
- Replace mock data imports with TanStack Query hooks
- Add loading, error, and empty states
- Remove mock data fallbacks progressively

### Phase 6: Testing & Polish

**Duration:** Week 7

- Verify all workflows end-to-end with mock data
- Ensure all pages are fully navigable
- Test edge cases (empty states, error states)
- Verify single-subject architecture across all teacher pages
- Verify subject category rules (min 2 specialized, min 1 enriched)
- Run lint and typecheck

---

## Appendix A: File Reference

```
frontend/src/
├── routes/
│   ├── student.tsx                          # Student layout
│   ├── student.dashboard.tsx                # Dashboard — MODIFY
│   ├── student.subjects.tsx                 # Subjects — MODIFY
│   ├── student.assignments.tsx              # Assignments — MODIFY
│   ├── student.attendance.tsx               # Attendance — MODIFY
│   ├── student.results.tsx                  # Results — MODIFY
│   ├── student.exams.tsx                    # Exam Schedule — MODIFY
│   ├── student.timetable.tsx                # Timetable — MODIFY
│   ├── student.profile.tsx                  # Profile — MODIFY
│   ├── student.fees.tsx                     # Fees — MODIFY
│   ├── teacher.tsx                          # Teacher layout
│   ├── teacher.dashboard.tsx                # Dashboard — MODIFY
│   ├── teacher.classes.tsx                  # My Classes — MODIFY
│   ├── teacher.subjects.tsx                 # My Subjects — MODIFY
│   ├── teacher.assignments.tsx              # Assignments — MODIFY
│   ├── teacher.attendance.tsx               # Attendance — MODIFY
│   ├── teacher.exams.tsx                    # Exams — MODIFY
│   ├── teacher.timetable.tsx                # Timetable — MODIFY
│   └── teacher.profile.tsx                  # Profile — MODIFY
├── components/
│   ├── dashboard/
│   │   ├── ProfileView.tsx                  # Shared — MODIFY (split by role)
│   │   ├── StatCard.tsx                     # Shared — No change
│   │   └── PageHeader.tsx                   # Shared — No change
│   └── layouts/
│       └── DashboardLayout.tsx              # Shared — MODIFY (sidebar routes)
├── lib/
│   └── mock-data.ts                         # Central — EXPAND (major)
├── context/
│   └── AuthContext.tsx                      # Shared — No change needed
```

---

## Appendix B: Backend Reference

```
backend/
├── student/
│   ├── models.py           # Subject, StudentProfile, StudentSubject, Assignment,
│   │                       # AssignmentSubmission, Attendance, Result, Timetable,
│   │                       # Notification
│   ├── views.py            # StudentDashboard, StudentProfileView, SubjectListView,
│   │                       # MySubjectsView, SubjectSelectionView, AssignmentListView,
│   │                       # SubmissionView, AttendanceView, ResultView, TimetableView,
│   │                       # NotificationView, ResourceListView
│   └── urls.py             # All student API routes defined
│
└── teacher/
    ├── models.py           # TeacherProfile, TeacherClassAssignment, TimetableEntry,
    │                       # LibrarySession, Resource, AnswerScript
    ├── views.py            # TeacherDashboard, TeacherProfileView, TeacherClassView,
    │                       # ClassStudentsView, TimetableView, LibraryConversionView,
    │                       # LibraryBookingView, AttendanceMarkView,
    │                       # ClassAttendanceSummaryView, EvaluationQueueView,
    │                       # DraftMarkView, EvaluationSubmitView, ResourceView
    └── urls.py             # All teacher API routes defined
```

---

## End of Audit Report
