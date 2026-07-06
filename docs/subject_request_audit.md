# Subject Request Workflow Audit

## Existing Workflow (Intended)

```
Student Portal                    Admin Portal
     |                                |
     v                                |
Student Subjects Page                 |
     |                                |
     v                                |
Request Subject Button                |
     |                                |
     v                                |
API Request (student)                 |
     |                                |
     v                                |
Backend: SubjectSelectionView         |
     |                                |
     v                                |
Backend: add_student_subject_selection|
     |                                |
     v                                |
StudentSubject (status=pending)  ---> | ---> Admin Students Page
     |                                |
     |                                v
     |                     Approve / Reject Buttons
     |                                |
     |                                v
     |                     Backend: approve_student_subjects
     |                                |
     v                                v
StudentSubject (status=approved)      |
     |                                |
     v                                v
Student Dashboard, Results,          Teacher Dashboard,
Assignments, Attendance updated      Student Count updated
```

## Broken Steps

### 1. Frontend Never Connects to Backend APIs

**Root Cause:** The frontend uses **100% mock data** with no API integration.

**Student Portal (`student.subjects.tsx`):**
- Imports `subjectSelection` from `mock-data.ts` (line 9)
- `handleRequestSubject()` (line 39-43) only updates local React state
- No API call to submit the request
- No check whether subject requests are enabled from backend

**Admin Portal (`admin.students.tsx`):**
- Imports `classDetailsData`, `feeStatusData` from `mock-data.ts` (line 14)
- Pending requests are displayed as `classDetail.subjects.filter((_, i) => i < 2).length` (line 115) — a nonsensical count
- Toggle state is local `useState(true)` (line 24) — not synced with backend
- No API calls to fetch, approve, or reject requests

### 2. No Student-Facing API Service Exists

Frontend has `services/adminApi.ts` for admin APIs. There is **no `studentApi.ts`** at all. The student portal has no way to make backend calls.

### 3. Backend Missing Critical Endpoints

| Missing Feature | Details |
|---|---|
| **List All Pending Requests** | `StudentAdminService.get_subject_requests()` exists but has no view/URL |
| **Reject Subject Request** | No `reject_student_subjects()` service, no view, no URL |
| **Toggle Status for Students** | No student-facing endpoint to check if requests are enabled |
| **Notifications on Approval** | `StudentSubjectApprovalView` doesn't create notifications |
| **Notifications on Rejection** | No rejection flow exists at all |
| **Teacher Sync on Approval** | No code to update teacher's student list after approval |

### 4. Fee Report Misplaced on Landing Page

The `admin.students.tsx` has a standalone "Fee Reports" view mode (line 18, 161-187) accessible from the main Students landing page (line 233-236). Per requirements, fee reports should only be available inside a class detail view.

## Files Involved

### Frontend

| File | Role | Status |
|---|---|---|
| `frontend/src/routes/student.subjects.tsx` | Student subject selection & request | Uses mock data only |
| `frontend/src/routes/admin.students.tsx` | Admin student management | Uses mock data only |
| `frontend/src/services/adminApi.ts` | Admin API calls | Has toggle API only |
| `frontend/src/services/request.ts` | Base API client | Admin-only base URL |
| `frontend/src/lib/mock-data.ts` | Mock data source | Lines 707-719 for subject selection |
| `frontend/src/context/AuthContext.tsx` | Auth context | Sets access token format |

### Backend

| File | Role | Status |
|---|---|---|
| `backend/administration/models/subject_request.py` | SubjectRequestControl model | Has toggle only |
| `backend/administration/serializers/subject_request.py` | Toggle serializer | ✓ Exists |
| `backend/administration/views/subject_request.py` | Toggle view (GET/PATCH) | ✓ Exists |
| `backend/administration/views/student_admin.py` | Admin student views | Missing reject & list-all-requests |
| `backend/administration/services/student_admin.py` | Admin student service | Missing reject & notifications |
| `backend/administration/selectors/student_admin.py` | Admin student selectors | get_pending_subject_requests exists |
| `backend/administration/urls.py` | URL configuration | Missing reject & list-all-requests URLs |
| `backend/student/models.py` | StudentSubject model | ✓ Has pending/approved/rejected status |
| `backend/student/services.py` | Student services | Missing reject_student_subjects |
| `backend/student/views.py` | Student views | SubjectSelectionView exists |
| `backend/student/selectors.py` | Student selectors | get_pending_subject_requests exists |
| `backend/student/urls.py` | Student URL config | Has /subjects/select/ |
| `backend/teacher/models.py` | Teacher models | TeacherProfile, TeacherClassAssignment exist |

## Root Cause

The system was architected with a working backend (models, services, selectors, most views) but the frontend was built using **mock data exclusively** and **never wired to the backend APIs**. The subject request "workflow" exists only as local React state that disappears on page refresh.

The specific issues to fix:
1. Create `studentApi.ts` for student-facing backend calls
2. Add toggle-status check endpoint for students
3. Rewrite `student.subjects.tsx` to use actual APIs
4. Add missing backend endpoints (list pending requests, reject)
5. Add notifications and teacher sync on approval/rejection
6. Rewrite `admin.students.tsx` to use actual APIs
7. Remove fee report from landing page, keep only in class detail
