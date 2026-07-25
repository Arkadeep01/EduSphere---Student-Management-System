# Blind Rechecking Module — Implementation Report

## Objective
Build the Blind Rechecking module end-to-end: database model, notification integration, backend views/serializers/services, frontend pages for all 4 roles (admin, teacher, student, staff), navigation, and route registration.

---

## Backend Changes

### 1. Database Model

**File created:** `backend/administration/models/rechecking.py`

| Field | Type | Description |
|-------|------|-------------|
| `student` | FK→Student | Student requesting recheck |
| `exam` | FK→Exam | Exam being rechecked |
| `subject` | FK→Subject | Subject being rechecked |
| `original_evaluator` | FK→Teacher | Original evaluator (must differ from second) |
| `second_evaluator` | FK→Teacher (nullable) | Blind second evaluator |
| `marks_obtained_original` | Decimal | Original marks |
| `total_marks_original` | Decimal | Original total marks |
| `marks_obtained_revised` | Decimal (nullable) | Revised marks after re-evaluation |
| `total_marks_revised` | Decimal (nullable) | Revised total marks |
| `draft_marks` | Decimal (nullable) | Second evaluator draft marks |
| `draft_remarks` | Text (nullable) | Second evaluator draft remarks |
| `remarks` | Text (nullable) | Second evaluator final remarks |
| `status` | CharField (choices) | `pending_approval` → `approved` → `re_evaluating` → `comparing` → `completed` / `rejected` / `closed` |
| `rechecking_window_deadline` | DateTime (nullable) | 7-day window deadline |
| `admin_remarks` | Text (nullable) | Admin rejection/approval reason |
| `is_revised` | Boolean (default False) | Whether marks changed |
| `policy_version` | CharField | Rechecking policy version |

**Status lifecycle:**
```
pending_approval → approved → re_evaluating → comparing → completed
                ↘ rejected                          ↗
                ↘ closed (window expired)
```

**Constraints:** `unique_together = (student, exam, subject, status)` — only one active request per student/exam/subject.

**Migration:** `administration.0011_blindrecheckingrequest`

### 2. Notification Integration

**File modified:** `backend/notification/models.py` (+10 notification types)

| Constant | Code | Display |
|----------|------|---------|
| `RECHECKING_REQUESTED` | `rechecking_requested` | Rechecking Requested |
| `RECHECKING_APPROVED` | `rechecking_approved` | Rechecking Approved |
| `RECHECKING_REJECTED` | `rechecking_rejected` | Rechecking Rejected |
| `RECHECKING_ASSIGNED` | `rechecking_assigned` | Rechecking Assigned |
| `RECHECKING_EVALUATION_COMPLETE` | `rechecking_evaluation_complete` | Rechecking Evaluation Complete |
| `RECHECKING_COMPLETED` | `rechecking_completed` | Rechecking Completed |
| `RECHECKING_WINDOW_CLOSING` | `rechecking_window_closing` | Rechecking Window Closing |
| `RECHECKING_WINDOW_CLOSED` | `rechecking_window_closed` | Rechecking Window Closed |
| `RECHECKING_COMPARED` | `rechecking_compared` | Rechecking Result Compared |
| `RECHECKING_RESULT_UNLOCKED` | `rechecking_result_unlocked` | Rechecking Result Unlocked |

**File modified:** `backend/notification/management/commands/seed_notification_data.py` (+8 templates)

| Template Code | Subject Line |
|--------------|-------------|
| `rechecking_requested` | Rechecking Requested – {{ student_name }} |
| `rechecking_approved` | Rechecking Approved – {{ exam_name }} |
| `rechecking_rejected` | Rechecking Request Rejected – {{ exam_name }} |
| `rechecking_assigned` | Rechecking Evaluation Assigned – {{ exam_name }} |
| `rechecking_evaluation_complete` | Rechecking Evaluation Complete – {{ subject }} |
| `rechecking_completed` | Rechecking Completed – {{ subject }} |
| `rechecking_window_closing` | Rechecking Window Closing – {{ exam_name }} |
| `rechecking_result_unlocked` | Result Updated – {{ subject }} |

**File modified:** `backend/notification/services/notification_service.py` (+template map entries for all 10 types)

**Migration:** `notification.0002_alter_notification_notification_type_and_more`

### 3. Serializers

**File created:** `backend/administration/serializers/rechecking.py`

| Serializer | Purpose |
|-----------|---------|
| `RecheckingRequestListSerializer` | List view with student/exam/subject names, marks, status badge |
| `RecheckingRequestDetailSerializer` | Full detail for single request |
| `RecheckingApprovalSerializer` | Admin approve/reject with admin_remarks |
| `StudentResultForRecheckingSerializer` | Eligible results for student (published, unlocked, within window) |

### 4. Services

**File created:** `backend/administration/services/rechecking_service.py`

| Function | Purpose |
|----------|---------|
| `create_rechecking_request()` | Student creates request; validates eligibility, no duplicates, creates notification |
| `approve_rechecking_request()` | Admin approves; sets window deadline (+7 days), notifies student |
| `reject_rechecking_request()` | Admin rejects with reason; notifies student |
| `assign_second_evaluator()` | Admin assigns teacher (must differ from original); notifies teacher |
| `save_rechecking_draft()` | Teacher saves draft marks (blind, no student identity) |
| `submit_rechecking_evaluation()` | Teacher submits final evaluation; triggers compare if second evaluator done |
| `compare_and_complete()` | Admin compares original vs revised; unlocks result if revised, notifies student |
| `close_expired_windows()` | Cron job: closes windows past deadline, notifies student |
| `get_eligible_results_for_student()` | Returns published, unlocked, non-duplicate, within-window results |

### 5. Admin Registration

**File modified:** `backend/administration/admin.py` — registered `BlindRecheckingRequest`

### 6. Backend Views

**Admin** (`/api/admin/rechecking/`):

| Method | Path | View |
|--------|------|------|
| GET | `/` | `AdminRecheckingListView` (search + filter + pagination) |
| GET | `/{id}/` | `AdminRecheckingDetailView` |
| POST | `/{id}/action/` | `AdminRecheckingActionView` (approve/reject) |
| POST | `/{id}/assign-evaluator/` | `AdminRecheckingAssignEvaluatorView` |
| POST | `/{id}/complete/` | `AdminRecheckingCompleteView` (compare & complete) |
| POST | `/close-expired/` | `AdminRecheckingCloseExpiredView` |
| GET | `/stats/` | `AdminRecheckingStatsView` |
| GET | `/evaluators/` | `AdminRecheckingEvaluatorListView` |

**Student** (`/api/student/rechecking/`):

| Method | Path | View |
|--------|------|------|
| GET | `/eligible/` | `StudentRecheckingEligibleView` |
| POST | `/create/` | `StudentRecheckingCreateView` |
| GET | `/list/` | `StudentRecheckingListView` |

**Teacher** (`/api/teacher/rechecking/`):

| Method | Path | View |
|--------|------|------|
| GET | `/queue/` | `TeacherRecheckingQueueView` |
| GET | `/history/` | `TeacherRecheckingHistoryView` |
| POST | `/{id}/draft/` | `TeacherRecheckingDraftView` |
| POST | `/{id}/submit/` | `TeacherRecheckingSubmitView` |

**Staff** (`/api/staff/rechecking/`):

| Method | Path | View |
|--------|------|------|
| GET | `/` | `StaffRecheckingOverviewView` |

### 7. URL Wiring

| File | Routes Added |
|------|-------------|
| `backend/administration/urls.py` | `/api/admin/rechecking/*` (8 endpoints) |
| `backend/student/urls.py` | `/api/student/rechecking/*` (3 endpoints) |
| `backend/teacher/urls.py` | `/api/teacher/rechecking/*` (4 endpoints) |
| `backend/staff/urls.py` | `/api/staff/rechecking/` (1 endpoint) |

### 8. Migrations Applied

- `administration.0011_blindrecheckingrequest`
- `notification.0002_alter_notification_notification_type_and_more`

---

## Frontend Changes

### New Files Created (4 route pages)

| File | Route | Purpose |
|------|-------|---------|
| `frontend/src/routes/admin.rechecking.tsx` | `/admin/rechecking` | Admin management: stats cards, tabbed requests/stats, approve/reject dialog, assign evaluator, compare & complete |
| `frontend/src/routes/student.rechecking.tsx` | `/student/rechecking` | Student portal: eligible results table, my requests table, create request dialog |
| `frontend/src/routes/teacher.rechecking.tsx` | `/teacher/rechecking` | Teacher queue: evaluation queue + history tabs, blind evaluate dialog with draft/submit |
| `frontend/src/routes/staff.rechecking.tsx` | `/staff/rechecking` | Staff overview: stats cards, filtered table with pagination |

### Modified Files

| File | Change |
|------|--------|
| `frontend/src/components/layouts/DashboardLayout.tsx` | Nav links for admin/teacher/student/staff rechecking pages + page title map entries |
| `frontend/src/routeTree.gen.ts` | Auto-generated registration of all 4 routes with proper parent-child hierarchy |

### Page Descriptions

#### 1. Admin Rechecking (`admin.rechecking.tsx`)
- **Requests tab:** Search + status filter, paginated table with student/exam/subject/original marks/status/window deadline/actions
  - Pending approval: approve (CheckCircle) / reject (XCircle) buttons
  - Approved: evaluator assignment dropdown (excludes original evaluator)
  - Comparing: Compare & Complete button (Scale icon)
- **Statistics tab:** 3 stat cards showing Volume (total/pending/approved/rejected/closed), Results (revised/unrevised/comparing), Summary (revision rate/completion rate/rejection rate)
- Uses `useQuery` + `useMutation` with query invalidation and sonner toasts
- **States:** Loading spinner, error, empty ("No Rechecking Requests")

#### 2. Student Rechecking (`student.rechecking.tsx`)
- **Eligible Results section:** Table of published/unlocked results eligible for rechecking, with "Request Recheck" button → opens dialog selecting subject + policy acknowledgement
- **My Requests section:** Table tracking existing requests with status badge and window deadline
- Uses `useQuery` + `useMutation`
- **States:** Loading, error, empty sections

#### 3. Teacher Rechecking (`teacher.rechecking.tsx`)
- **Evaluation Queue tab:** Scripts assigned for blind re-evaluation (SCR-XXXXX IDs). Evaluate button → opens dialog with marks/total/remarks fields, Save Draft / Submit buttons
- **History tab:** Previously evaluated rechecking scripts with results
- Blind evaluation: no student name/roll visible, only anonymous ID
- **States:** Loading, error, empty

#### 4. Staff Rechecking (`staff.rechecking.tsx`)
- Stats cards: Total, Pending, Completed, Revised
- Search + status filter, paginated table
- **States:** Loading, error, empty

### API Service Layer

Used central `request()` utility from `src/lib/api.ts` — no separate API service file created. All endpoints consumed directly via `request(path, options)`.

---

## Frontend Architecture

### UI Conventions
- **Component library:** shadcn/ui (Card, Badge, Button, Table, Tabs, Select, Dialog, Textarea, Input)
- **Icons:** lucide-react (CheckCircle2, XCircle, Scale, Users, Layers, FileSearch, Loader2, AlertCircle, Shield, Eye, Search, ArrowLeft, ArrowRight)
- **Data fetching:** TanStack Query (useQuery, useMutation, useQueryClient)
- **Routing:** TanStack Router (createFileRoute, useNavigate, useSearch)
- **Notifications:** sonner toast
- **Styling:** TailwindCSS with status-based color mapping

### Status Badge Color Mapping
```
pending_approval → amber/yellow
approved → blue
re_evaluating → purple
comparing → cyan
completed → green
rejected → red/destructive
closed → gray/secondary
```

---

## Tests Performed

| Test | Result |
|------|--------|
| TypeScript compilation (`tsc --noEmit`) | ✅ 0 errors |
| Backend unit tests (`python manage.py test --keepdb`) | ✅ 4/4 passed |
| Route tree generation (`@tanstack/router-cli generate`) | ✅ Generated without errors |

---

## Files Summary

```
Created (1 backend model):
  backend/administration/models/rechecking.py            (+85 lines)

Created (2 backend services/serializers):
  backend/administration/serializers/rechecking.py        (+90 lines)
  backend/administration/services/rechecking_service.py   (+320 lines)

Modified (3 backend notification):
  backend/notification/models.py                          (+10 notification types)
  backend/notification/services/notification_service.py   (+template map entries)
  backend/notification/management/commands/seed_notification_data.py   (+8 templates)

Modified (4 backend URLs):
  backend/administration/urls.py                           (+8 routes)
  backend/student/urls.py                                  (+3 routes)
  backend/teacher/urls.py                                  (+4 routes)
  backend/staff/urls.py                                    (+1 route)

Modified (2 backend admin/migrations):
  backend/administration/admin.py                          (+register model)
  backend/administration/migrations/0011_blindrecheckingrequest.py
  backend/notification/migrations/0002_*.py

Created (4 frontend routes):
  frontend/src/routes/admin.rechecking.tsx                 (+390 lines)
  frontend/src/routes/student.rechecking.tsx               (+200 lines)
  frontend/src/routes/teacher.rechecking.tsx               (+250 lines)
  frontend/src/routes/staff.rechecking.tsx                 (+150 lines)

Modified (2 frontend):
  frontend/src/components/layouts/DashboardLayout.tsx      (+4 nav links + page titles)
  frontend/src/routeTree.gen.ts                            (+auto-generated entries)
```

**Total: 20+ files changed/created, ~1,500+ lines added.**

---

## Key Design Decisions

1. **No fee model** — Rechecking requests are free per specification
2. **7-day window** — Deadline computed on approval, auto-closed via `close_expired_windows()` cron job
3. **Blind second evaluator** — `second_evaluator` FK must differ from `original_evaluator`; teacher sees anonymous SCR-XXXXX IDs
4. **Subject-only result unlock** — On comparison, only the rechecked subject's result is unlocked/updated; other subjects remain locked
5. **Notification via central service** — All 10 events flow through `NotificationService.create_notification()`; no direct sends
6. **Status lifecycle** — Clear linear progression with admin-controlled transitions at each step
