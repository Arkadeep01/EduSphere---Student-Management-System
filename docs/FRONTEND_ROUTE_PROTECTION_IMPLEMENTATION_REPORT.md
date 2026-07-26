# Frontend Route Protection Implementation Report

**Date:** 2026-07-26
**Status:** Implemented

---

## 1. Executive Summary

Complete frontend route protection implemented across all five EduSphere portals (`/student/*`, `/teacher/*`, `/staff/*`, `/admin/*`, `/director/*`). Three-layer defense: route-level `beforeLoad` guards (token check), component-level `useRequireRole` (role verification), and `ForbiddenPage` (403 UX). Silent wrong-role redirects replaced with explicit 403 pages. Safe `returnTo` ensures post-login redirects respect user role authorization.

| Requirement | Status |
|---|---|
| Unauthenticated → correct login page | ✅ |
| Authenticated wrong-role → 403 page (not silent redirect) | ✅ |
| 403 page: "You don't have permission to access this page." + Return to Dashboard | ✅ |
| No protected content renders before `/api/me/` resolves | ✅ |
| Safe `returnTo` — only redirect if user is authorized for target | ✅ |
| Loading spinner during auth resolution | ✅ |
| Backend remains authoritative, frontend guards are UX defense-in-depth | ✅ |
| Preserve JWT + HttpOnly cookie + AuthContext architecture | ✅ |
| No second auth-state system introduced | ✅ |

---

## 2. Changes by File

| # | File | Change | Type |
|---|------|--------|------|
| 1 | `frontend/src/context/AuthContext.tsx` | Exported `getRoleRedirect`; added `getRouteRole`, `isAuthorizedForRoute`, `getSafeRedirect`; removed `useNavigate` import + silent redirect from hooks | Modify |
| 2 | `frontend/src/components/ForbiddenPage.tsx` | New reusable 403 component | New |
| 3 | `frontend/src/components/layouts/DashboardLayout.tsx` | Replaced inline unauthorized markup with `<ForbiddenPage />` | Modify |
| 4 | `frontend/src/routes/admin.tsx` | Added `beforeLoad` token guard | Modify |
| 5 | `frontend/src/routes/teacher.tsx` | Added `beforeLoad` token guard | Modify |
| 6 | `frontend/src/routes/student.tsx` | Added `beforeLoad` token guard | Modify |
| 7 | `frontend/src/routes/staff.tsx` | Added `beforeLoad` token guard | Modify |
| 8 | `frontend/src/routes/director.tsx` | Added `beforeLoad` token guard | Modify |
| 9 | `frontend/src/routes/login.index.tsx` | Safe `returnTo` handling after student login | Modify |
| 10 | `frontend/src/routes/login.faculty.tsx` | Safe `returnTo` handling after faculty login | Modify |
| 11 | `frontend/src/routes/auth.callback.tsx` | Safe `returnTo` handling after OAuth | Modify |
| 12 | `frontend/src/routes/force-password-change.tsx` | Safe `returnTo` handling after password set | Modify |

---

## 3. Architecture: Three-Layer Defense

```
Layer 1: beforeLoad (route level)
  ├── Checks localStorage for accessToken
  ├── If missing → stores returnTo → redirects to /login
  └── Runs BEFORE component mount — no flash

Layer 2: useRequireRole (component level in DashboardLayout)
  ├── Checks /api/me/ session via AuthProvider
  ├── If loading → spinner (no content rendered)
  ├── If no user → stores returnTo → dashboard renders 403 → user sees login page
  │   (beforeLoad already caught this, this is fallback)
  ├── If wrong role → returns authorized: false
  └── If correct role → renders sidebar + <Outlet />

Layer 3: ForbiddenPage (UX boundary)
  ├── Renders 403 page with "You don't have permission" message
  ├── Shows user's current role
  ├── "Return to Dashboard" button → user's correct dashboard
  └── Reusable in any component
```

---

## 4. Key Behavioral Changes

### 4.1 Silent Redirect → 403 Page (P2-2 Resolved)

**Before:**
```
Student types /admin/dashboard
→ useRequireRole("admin") sees role="student"
→ navigate({ to: "/student/dashboard" })  // silent redirect, no 403
→ Student sees student dashboard (confusing)
```

**After:**
```
Student types /admin/dashboard
→ beforeLoad: token exists → passes
→ DashboardLayout renders, useRequireRole("admin") sees role="student"
→ authorized = false
→ ForbiddenPage renders: "You don't have permission"
  + "Signed in as student." + "Return to Dashboard"
→ Student clicks "Return to Dashboard" → /student/dashboard
```

### 4.2 Safe returnTo (Requirement)

**Before:**
```
Unauthenticated user types /admin/dashboard
→ redirect to /login
→ User logs in as student
→ navigate to /student/dashboard (hardcoded)
→ User wanted /admin/dashboard but gets student dashboard
```

**After:**
```
Unauthenticated user types /admin/dashboard
→ beforeLoad stores returnTo="/admin/dashboard" in sessionStorage
→ redirect to /login
→ User logs in as student
→ login checks sessionStorage.returnTo = "/admin/dashboard"
→ getRouteRole("/admin/dashboard") = "admin"
→ isAuthorizedForRoute(student, "/admin/dashboard") = false
→ navigate to getRoleRedirect("student") = "/student/dashboard"
→ sessionStorage.returnTo cleared
```

### 4.3 No Content Flash

All three layers prevent content rendering before auth resolves:
- `beforeLoad` runs synchronously before component mount
- `DashboardLayout` shows spinner while `useRequireRole` loads
- Child routes are never mounted when `!authorized`

---

## 5. AuthContext: New Exports

| Export | Type | Purpose |
|--------|------|---------|
| `getRoleRedirect(role)` | Function | Returns dashboard path for a role |
| `getRouteRole(pathname)` | Function | Extracts target role from a URL path |
| `isAuthorizedForRoute(user, pathname)` | Function | Checks if user's role matches route's expected role |
| `getSafeRedirect(user, returnTo)` | Function | Returns returnTo if authorized, else user's dashboard |
| `useRequireAuth()` | Hook | Returns `{user, loading, authenticated}` — stores returnTo if unauthenticated |
| `useRequireRole(role)` | Hook | Returns `{user, loading, authorized}` — stores returnTo if unauthenticated, NO silent redirect |

---

## 6. ForbiddenPage Design

```
┌─────────────────────────────────────┐
│                                     │
│          ⚠️ (ShieldAlert icon)       │
│                                     │
│              403                    │
│         Access Denied               │
│                                     │
│   You don't have permission to      │
│   access this page.                 │
│   Signed in as student.             │
│                                     │
│      [ Return to Dashboard ]        │
│                                     │
└─────────────────────────────────────┘
```

- Matches the existing 404 page styling (same layout, centered card)
- "Return to Dashboard" navigates to `getRoleRedirect(user.role)` (the user's own dashboard)
- Shows user's current role for clarity

---

## 7. Route Verification Matrix

| Portal | Route File | beforeLoad | useRequireRole | ForbiddenPage | All Children Protected |
|--------|-----------|-----------|----------------|---------------|----------------------|
| `/student/*` | `student.tsx` | ✅ token check | ✅ role="student" | ✅ | ✅ (13 child routes) |
| `/teacher/*` | `teacher.tsx` | ✅ token check | ✅ role="teacher" | ✅ | ✅ (14 child routes) |
| `/staff/*` | `staff.tsx` | ✅ token check | ✅ role="staff" | ✅ | ✅ (8 child routes) |
| `/admin/*` | `admin.tsx` | ✅ token check | ✅ role="admin" | ✅ | ✅ (31 child routes) |
| `/director/*` | `director.tsx` | ✅ token check | ✅ role="director" | ✅ | ✅ (3 child routes) |

---

## 8. Verification

| Check | Status |
|---|---|
| `npx tsc --noEmit` (frontend) | 0 errors |
| Unauthenticated → /login with returnTo | ✅ |
| Student → /admin/* → 403 with "signed in as student" + Return to Dashboard | ✅ |
| Teacher → /student/* → 403 with "signed in as teacher" | ✅ |
| Staff → /admin/* → 403 with "signed in as staff" | ✅ |
| After login: returnTo for own role → redirects to target | ✅ |
| After login: returnTo for wrong role → redirects to own dashboard | ✅ |
| After OAuth: same safe returnTo behavior | ✅ |
| After temp password change: same safe returnTo behavior | ✅ |
| No second auth-state system introduced | ✅ |
| Preserves JWT + HttpOnly cookie + AuthContext architecture | ✅ |
| Backend remains authoritative | ✅ |