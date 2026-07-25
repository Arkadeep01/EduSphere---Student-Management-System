# Answer Script Processing Module — Implementation Report

## Objective
Complete the Answer Script Processing module end-to-end: staff upload/pipeline, admin batch verification/assignment, teacher blind evaluation, and all supporting frontend pages with proper loading/error/empty states.

---

## Backend Architecture

### Models

**File:** `backend/administration/models/exam.py`

| Model | Purpose |
|-------|---------|
| `AnswerScriptUpload` | Central model linking student, exam, subject, teacher. Statuses: `pending_upload` → `uploaded` → `verified` → `assigned` → `evaluation_completed`/`archived`. Tracks `draft_marks`, `marks_obtained`, `total_marks`, `remarks`, `verified_by`, `uploaded_by` |

**File:** `backend/administration/models/processing.py`

| Model | Purpose |
|-------|---------|
| `ScriptProcessing` | Per-script pipeline: page counts, metadata extraction, student matching, roll verification, duplicate detection |
| `ScriptBatchProcessing` | Batch-level pipeline tracking: total/processed/passed/failed counts |

### API Endpoints

**Staff** (`/api/staff/`):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/upload-tasks/` | Batch summaries (total/uploaded/verified/rejected) |
| GET/POST | `/upload/` | List pending scripts / upload single script |
| GET/PUT/DELETE | `/upload/{pk}/` | Get/replace/delete an upload |
| GET | `/history/` | Filterable upload history (`?status=`) |
| GET | `/rejected/` | Rejected uploads list |
| GET | `/dashboard/` | Dashboard stats |
| POST | `/processing/init/{script_id}/` | Initialize script pipeline |
| GET | `/processing/{script_id}/` | Processing details |
| POST | `/processing/{script_id}/page-count/` | Set detected page count |
| POST | `/processing/{script_id}/expected-pages/` | Set expected pages |
| POST | `/processing/{script_id}/metadata/` | Extract/attach metadata |
| POST | `/processing/{script_id}/match-student/` | Match to student |
| POST | `/processing/{script_id}/verify-roll/` | Verify roll number |
| POST | `/processing/{script_id}/duplicate-pages/` | Detect duplicate pages |
| POST | `/processing/{script_id}/finalize/` | Finalize verification |
| POST | `/processing/{script_id}/flag/` | Flag with reason |
| POST | `/processing/{script_id}/fail/` | Fail processing |
| POST | `/processing/{script_id}/pipeline/` | Run full pipeline |
| GET | `/processing/list/` | List processing records |
| GET | `/processing/stats/` | Processing statistics |
| POST | `/batch-processing/init/` | Initialize batch processing |
| GET | `/batch-processing/{id}/` | Batch processing detail |
| POST | `/batch-processing/{id}/finalize/` | Finalize all scripts in batch |
| GET | `/batch-processing/list/` | List batch processing records |

**Admin** (`/api/admin/exams/`):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/staff-batches/` | List all staff upload batches |
| POST | `/batches/{id}/verify/` | Verify a batch (audit log + notification) |
| POST | `/batches/{id}/reject/` | Reject a batch with reason |
| POST | `/assign-scripts/` | Assign verified scripts to teacher |

**Teacher** (`/api/teacher/`):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/evaluation/queue/` | List evaluation queue |
| POST | `/evaluation/{script_id}/draft/` | Save draft marks |
| POST | `/evaluation/{script_id}/submit/` | Finalize evaluation (triggers notification) |

### Services

| File | Key Functions |
|------|---------------|
| `staff/services.py` | `create_upload_batch()`, `upload_answer_script()`, `replace_uploaded_file()`, `delete_upload()` |
| `teacher/services.py` | `save_draft_marks()`, `submit_evaluation()` |
| `administration/services/exam_admin.py` | `ExamAdminService.upload_answer_script()`, `ExamAdminService.get_evaluation_tracking()` |

### Serializers

| File | Key Serializers |
|------|-----------------|
| `administration/serializers/exam.py` | `AnswerScriptUploadSerializer`, `EvaluationTrackingSerializer`, `PublishedResultSerializer` |
| `staff/serializers.py` | `StaffDashboardSerializer`, `StaffBatchSerializer`, `StaffAnswerScriptUploadSerializer`, `StaffProfileSerializer` |
| `teacher/serializers.py` | `AnswerScriptSerializer`, `AnonymousEvaluationSerializer` (SCR-XXXXX IDs, `is_locked` flag) |

---

## Frontend Changes

### New Files Created (none — all route pages existed)

### Modified Files — Staff Pages

| File | Changes |
|------|---------|
| `staff.dashboard.tsx` | Added loading/error/empty states, stat cards, progress bars |
| `staff.upload.tsx` | Pending scripts radio list, file picker, upload mutation, loading/error/empty/success states |
| `staff.upload-tasks.tsx` | Batch-level task cards with progress bar, status badges, loading/error/empty states |
| `staff.rejected.tsx` | Rejected uploads list with rejection reason, red border cards, loading/error/empty states |
| `staff.history.tsx` | Filter buttons (all/uploaded/verified/rejected/assigned/evaluation_completed), status color mapping, loading/error/empty states |

### Modified Files — Admin Exam Page

| File | Changes |
|------|---------|
| `admin.exams.tsx` | **Answer Scripts tab** fetches batch data from `/exams/staff-batches/`. Batch table: ID, Exam, Subject, Total, Uploaded, Verified, Rejected, Uploaded By. Actions: Verify (CheckCircle), Reject with reason dialog, View detail (Eye icon). Toolbar: Refresh, Assign (teacher selector), Upload (exam/subject/PDF picker). **Evaluation Tracking tab** shows teacher/subject/exam with counts. Loading/error/empty states for all sections. |

### Modified Files — Teacher Evaluation Page

| File | Changes |
|------|---------|
| `teacher.exams.evaluate.$examId.$classId.tsx` | Anonymous SCR-XXXXX script IDs, `is_locked` status with ShieldBan icon, locked scripts disabled. Evaluate dialog: marks, total marks, remarks (Textarea). Save Draft → `POST /evaluation/{id}/draft/`. Submit → `POST /evaluation/{id}/submit/`. Dual queue (pending + completed tables). Loading/error/empty states. |

### Full Workflow

```
Staff Upload PDF  →  Staff Pipeline (page count, metadata, matching, verification)
         ↓
    Admin Verifies Batch
         ↓
    Admin Assigns to Teacher
         ↓
    Teacher Evaluates (Draft → Submit)
         ↓
    Evaluation Completed (notification sent)
```

---

## Frontend Architecture

### UI Conventions
- **Component library:** shadcn/ui (Card, Badge, Button, Table, Input, Tabs, Select, Dialog, Textarea)
- **Icons:** lucide-react (CheckCircle2, XCircle, Eye, Upload, Loader2, AlertCircle, FileSearch, ShieldBan, etc.)
- **Data fetching:** TanStack Query (useQuery, useMutation, useQueryClient)
- **Routing:** TanStack Router (createFileRoute, useNavigate)
- **Notifications:** sonner toast for success/error feedback
- **Styling:** TailwindCSS with status-based badges and color mapping

### State Management
- **Loading:** Centered `Loader2` spinner
- **Error:** AlertCircle icon + message + optional retry button
- **Empty:** Icon + message + optional action button
- **Data:** Table or Card grid with appropriate actions

---

## Tests Performed

| Test | Result |
|------|--------|
| TypeScript compilation (`tsc --noEmit`) | ✅ 0 errors (our files) |
| Backend unit tests (`python manage.py test --keepdb`) | ✅ 4/4 passed |

---

## Files Summary

```
Modified (5 frontend staff pages):
  frontend/src/routes/staff.dashboard.tsx
  frontend/src/routes/staff.upload.tsx
  frontend/src/routes/staff.upload-tasks.tsx
  frontend/src/routes/staff.rejected.tsx
  frontend/src/routes/staff.history.tsx

Modified (1 admin page):
  frontend/src/routes/admin.exams.tsx    (+ Answer Scripts + Evaluation Tracking tabs)

Modified (1 teacher page):
  frontend/src/routes/teacher.exams.evaluate.$examId.$classId.tsx  (+ anonymous IDs, lock states)
```

**Total: 7 frontend files modified, 0 created.**
