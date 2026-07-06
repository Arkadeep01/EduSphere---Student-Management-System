# Subject Request Workflow Regression

## Root Cause

The previous implementation **replaced working mock-data-based components with API-dependent rewrites** without fallback. When the backend API is unreachable (Django not running), all subject request functionality breaks.

## Regressions Found

### 1. student.subjects.tsx — Complete page blank
- **File**: `frontend/src/routes/student.subjects.tsx`
- **Issue**: Entire component was rewritten to use `studentSubjectApi` API calls (lines 27-31). On failure, `loading` stays `true`, rendering a blank page with "Loading subjects..." text.
- **Breaking change**: Removed import of `coreSubjects`, `specializedSubjects`, `enrichedSubjects`, `subjectSelection` from `mock-data.ts`. All subject cards disappeared.
- **Imports removed**: `{ coreSubjects, specializedSubjects, enrichedSubjects, subjectSelection }` from `@/lib/mock-data`

### 2. admin.students.tsx — Pending requests empty
- **File**: `frontend/src/routes/admin.students.tsx`
- **Issue**: Rewritten to fetch pending requests from API (`subjectRequestApi.pendingRequests()`). When API is down, the requests list stays empty. The toggle also calls API without fallback.
- **Breaking change**: Removed original mock-data-based pending count display. The `classCards` still show pending from mock data but the Subject Request Control panel now relies on API.

### 3. request.ts — Breaking rename
- **File**: `frontend/src/services/request.ts`
- **Issue**: `API_BASE` was renamed to `ADMIN_API_BASE`. The `adminApi.ts` import was updated but any other file importing `API_BASE` would break.

### 4. adminApi.ts — API-dependent additions
- **File**: `frontend/src/services/adminApi.ts`
- **Issue**: Added `pendingRequests()`, `approve()`, `reject()` methods that require backend to be running. These are fine as additions but the admin page should handle API failure gracefully.

## Files Changed (breaking)

| File | Change | Impact |
|---|---|---|
| `frontend/src/routes/student.subjects.tsx` | Full rewrite | Blank page when API down |
| `frontend/src/routes/admin.students.tsx` | Full rewrite | Empty requests, broken toggle |
| `frontend/src/services/request.ts` | Renamed export | Potential import breaks |
| `frontend/src/services/adminApi.ts` | Added methods | Fine but pages depend on them |

## Fix Strategy

1. **Restore `student.subjects.tsx`** to use mock data for subject display (restore original `subjectSelection` import). Add toggle check with API call + fallback. Show warning banner when requests are disabled.

2. **Restore `admin.students.tsx`** to use mock data for pending requests. Keep API toggle but handle failure gracefully. Add pending requests table driven by mock data. Remove fee report block from landing page.

3. **Keep backend additions** (new views, services) as they enhance the API layer without breaking anything.
