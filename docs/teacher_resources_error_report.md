# Teacher Resources Page Crash Report

## 1. Variable causing crash

`teacherSubjectData.resources` — the `resources` variable on line 23 of `frontend/src/routes/teacher.resources.tsx`.

## 2. File and line number

**File:** `frontend/src/routes/teacher.resources.tsx`  
**Line 23:** `const resources = teacherSubjectData.resources;`  
**Line 24:** `const types = ["all", ...new Set(resources.map(r => r.type))];`

## 3. Why it became undefined

`teacherSubjectData` is defined in `frontend/src/lib/mock-data.ts` (line 879). It contains an inline `chapters` array, where each chapter has its own nested `resources` array. However, the object **has no top-level `resources` property** — only `id`, `name`, `code`, `teacher`, `category`, `color`, `classes`, `totalStudents`, `chapters`, and `evaluations`.

Accessing `teacherSubjectData.resources` returns `undefined`. Calling `.map()` on `undefined` throws:

> Cannot read properties of undefined (reading 'map')

## 4. Correct fix

Replace the direct access `teacherSubjectData.resources` with an aggregation of resources from all chapters:

```tsx
// Before (crashes):
const resources = teacherSubjectData.resources;

// After (safe):
const resources = teacherSubjectData.chapters?.flatMap(ch => ch.resources ?? []) ?? [];
```

This:
- Uses optional chaining (`?.`) in case `chapters` is missing
- Uses nullish coalescing (`?? []`) on each chapter's resources
- Falls back to an empty array (`?? []`) if chapters is entirely missing
- Guarantees `resources` is always an array, so `.map()`, `.filter()`, etc. are always safe

## 5. Unsafe `.map()` calls in this page

| Line | Expression | Unsafe? | Status |
|------|-----------|---------|--------|
| 24 | `resources.map(r => r.type)` | **Yes** — crashes when `resources` is undefined | **Fixed** |
| 27 | `resources.filter(r => ...)` | **Yes** — crashes when `resources` is undefined | **Fixed** (derived from `resources`) |
| 51-53 | `resources.filter(r => r.type === "note")` | **Yes** — crashes when `resources` is undefined | **Fixed** (derived from `resources`) |
| 59 | `filtered.filter(r => r.type === tab)` | **No** — `filtered` is derived from `resources`, so if `resources` is an empty array, `filtered` is also `[]` | Safe |

All unsafe calls share the same root cause: `teacherSubjectData.resources` being `undefined`. The single fix on line 23 resolves all of them.
