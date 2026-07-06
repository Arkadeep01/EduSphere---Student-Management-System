# File Upload Audit — All Frontend Pages

> Generated: 2026-07-06 | Scanned: 56 route files, 34 component files, all service files

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ **WORKING** | Full file upload flow — file picker, validation, real API call (or mock fallback), display location |
| ⚠️ **PARTIAL** | File picker works, preview renders, but no server-side persistence |
| 🟡 **PLACEHOLDER** | UI exists (button/dashed zone/etc.) but does nothing functional — no file input, no API call |
| 🔴 **MISSING** | No file picker at all, feature is entirely unimplemented |

---

## Full Audit Table

| # | Page | Feature | File Picker | Upload Status | Display Location | Validation | Overall State |
|---|------|---------|-------------|---------------|-----------------|------------|---------------|
| 1 | `/student/assignments` | **Assignment submission files** (PDF, PPT, PPTX) | ✅ Browser file picker (`<input type="file" accept=".pdf,.ppt,.pptx" multiple>`) | ✅ Working — `handleFileSelect` captures files, `handleSubmit` calls `studentSubmissionApi.submit()` with FormData | ✅ Prepared — file list with name/size before submit; submitted files shown with remove button; evaluation section | Extension check (`.pdf`,`.ppt`,`.pptx`); Size check (max 10 MB); Max 5 files | ✅ **WORKING** |
| 2 | `/teacher/resources` | **Create resource** (notes, docs, videos, references) | ✅ Browser file picker (`<input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.zip">`) | ✅ Working — `handleFileSelect` validates; `handleUpload` builds FormData with metadata + file; calls `teacherResourceApi.create()` | ✅ Prepared — resource card appears in grid with icon, title, type, size, date, download count | Extension check (10 types); Size check (max 100 MB) | ✅ **WORKING** |
| 3 | `/teacher/resources` | **Edit / Replace resource file** | ✅ Browser file picker (same as above, optional on edit) | ✅ Working — `handleUpdate` builds FormData; calls `teacherResourceApi.update()` | ✅ Prepared — updated resource shown in grid | Extension check; Size check (max 100 MB) | ✅ **WORKING** |
| 4 | `/admin/profile` / `/student/profile` / `/teacher/profile` (`ProfileView.tsx`) | **Profile photo** | ✅ Browser file picker (`<input type="file" accept="image/*">`) via Camera icon | ⚠️ Partial — captures file, creates data URL preview, saves to local `profileImage` state | ✅ Prepared — Avatar component shows preview inline; Save/Change buttons appear | `accept="image/*"` only; no file size check | ⚠️ **PARTIAL** — preview works but no API call to persist photo on server |
| 5 | `/admissionForms` | **Passport photo** (admission form) | ✅ Browser file picker (`<input type="file" accept="image/*">`) via dashed photo box | ⚠️ Partial — creates blob URL preview via `URL.createObjectURL` | ✅ Prepared — preview shows inside photo upload box | `accept="image/*"` only | ⚠️ **PARTIAL** — preview works but never submitted with form |
| 6 | `/admissionForms` | **Admission documents** (marksheets, ID, transfer cert, etc.) | ✅ Browser file pickers exist (`<input type="file" accept=".pdf,.jpg,.jpeg,.png">`) per document row | 🟡 Placeholder — inputs have **no onChange handler** and **no ref**; file selection does nothing | ❌ None | `accept=".pdf,.jpg,.jpeg,.png"` (browser level only) | 🟡 **PLACEHOLDER** — inputs disconnected from state/logic |
| 7 | `/admin/exams` | **Upload answer scripts** | ❌ None — dashed-zone div with Upload icon and "Drag & drop files or click to browse" is a styled `<div>`, not an `<input>`; no hidden file input exists | 🟡 Placeholder — "Upload" button fires `toast.success("Scripts uploaded")` with no file handling; `examAdminApi.uploadScript()` exists but is **never called** | ❌ None | None | 🟡 **PLACEHOLDER** — UI mock only |
| 8 | `/teacher/subjects` | **Upload syllabus** (per class/chapter) | ❌ None — `handleUploadSyllabus` is called directly with no file picker | 🟡 Placeholder — creates a mock `{ fileName: "Syllabus_X.pdf", uploadedAt: "..." }` object in local state | ✅ Prepared — syllabus filename shown in chapter expansion with Download/Replace buttons | None | 🟡 **PLACEHOLDER** — no file picking, no real upload |
| 9 | `/teacher/subjects` | **Add class resource** (per class/chapter) | ❌ None — `handleUploadResource` is called directly with no file picker | 🟡 Placeholder — creates a mock resource object with random title and size in local state | ✅ Prepared — resource appears in chapter expansion section | None | 🟡 **PLACEHOLDER** — no file picking, no real upload |
| 10 | `/admin/settings` (Gallery tab) | **Gallery image upload** (CMS) | ❌ None — "Upload Images" button has **no onClick handler** | 🟡 Placeholder — `cmsApi.gallery.upload()` exists in API service but is **never called** | ❌ None | None | 🟡 **PLACEHOLDER** — dead button |
| 11 | `/admin/settings` (Home tab) | **Homepage featured image upload** (CMS) | ❌ None — "Add Image" button has **no onClick handler** | 🟡 Placeholder — `cmsApi.homepage.upload()` exists in API service but is **never called** | ❌ None | None | 🟡 **PLACEHOLDER** — dead button |
| 12 | `ProfileView.tsx` (Documents tab) | **Upload document** (student/teacher profile) | ❌ None — "Upload document" button has **no onClick handler** and **no file input** connected | 🟡 Placeholder — button does nothing | ❌ None | None | 🟡 **PLACEHOLDER** — dead button |
| 13 | `/teacher/assignments` | **Upload marks** (numeric, not a file) | N/A | ✅ Working — calls `teacherAssignmentApi.submitMarks()` | ✅ Prepared — marks shown in table | Numeric input validation | ✅ **WORKING** (data-only) |
| 14 | `/teacher/exams/evaluate/$examId/$classId` | **Upload evaluated marks** (numeric, not a file) | N/A | ✅ Working — updates local state | ✅ Prepared — marks shown in evaluation table | None | ✅ **WORKING** (data-only) |

---

## Summary Counts

| Status | Count | Features |
|--------|-------|----------|
| ✅ **WORKING** (file upload) | 2 | Assignment submission, Resource create & edit |
| ✅ **WORKING** (data-only) | 2 | Teacher marks upload (2 pages) |
| ⚠️ **PARTIAL** (preview, no server) | 2 | Profile photo, Passport photo |
| 🟡 **PLACEHOLDER** (UI only, no function) | 6 | Admission documents, Answer scripts, Syllabus upload, Class resource upload, Gallery upload, Homepage upload, Profile document upload |
| **Total upload touchpoints** | **14** | |

---

## Pages With Zero File Upload (56 checked)

`about.tsx`, `admissions.tsx`, `admin.attendance.tsx`, `admin.classes.tsx`, `admin.contacts.tsx`, `admin.dashboard.tsx`, `admin.events.tsx`, `admin.fees.tsx`, `admin.reports.tsx`, `admin.students.tsx`, `admin.teachers.tsx`, `auth.callback.tsx`, `contact.tsx`, `courses.tsx`, `events.tsx`, `facilities.tsx`, `faq.tsx`, `forgot-password.tsx`, `gallery.tsx`, `guidelines.tsx`, `index.tsx`, `login.tsx`, `register.tsx`, `reset-password.tsx`, `student.attendance.tsx`, `student.dashboard.tsx`, `student.exams.tsx`, `student.fees.tsx`, `student.notifications.tsx`, `student.results.tsx`, `student.subjects.tsx`, `student.timetable.tsx`, `teacher.attendance.tsx`, `teacher.classes.tsx`, `teacher.dashboard.tsx`, `teacher.exams.tsx`, `teacher.timetable.tsx`, `teachers.tsx`, `__root.tsx`

---

## Key Gaps (Priority Order)

1. **Answer Scripts** (`admin/exams`) — UI has a decorative dashed zone that says "click to browse" but is a plain `<div>` with no hidden `<input type="file">`. `examAdminApi.uploadScript()` exists in the API service and accepts `FormData` but is never wired to any event.

2. **CMS Gallery / Homepage** (`admin/settings`) — `cmsApi.gallery.upload()` and `cmsApi.homepage.upload()` both exist in `adminApi.ts` and correctly handle `FormData`, but the "Upload Images" and "Add Image" buttons have no `onClick` handlers.

3. **Admission Documents** (`admissionForms`) — All document `<input type="file">` elements exist with correct `accept` attributes but lack `onChange` handlers or refs. No state is updated when a file is selected.

4. **Profile Documents** (`ProfileView.tsx` Documents tab) — The "Upload document" button has no handler whatsoever. No file input is present.

5. **Syllabus & Class Resources** (`teacher/subjects`) — Both create mock-only local state objects. No file picker, no real file handling, no API call.
