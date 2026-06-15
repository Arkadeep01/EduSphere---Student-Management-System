# Authentication Role Validation Bug Report

## Root Cause

**The frontend `AuthContext.tsx` mock credential system completely bypasses both the `portal` parameter and the backend's role validation.**

When a user enters any email from `MOCK_CREDENTIALS` (admin@edusphere.edu, teacher@edusphere.edu, student@edusphere.edu), the `login()` function returns the corresponding **hardcoded user object** without ever checking whether the selected portal/role matches. The `portal` parameter is passed but **never consulted** in the mock path.

### Attack / Reproduction Steps

1. On the login page, select the **Student** role tab
2. Enter email `admin@edusphere.edu` with password `admin123`
3. Click Sign In

**What happens internally:**

- `login({ email: "admin@edusphere.edu", password: "admin123", portal: "student" })`
- `MOCK_CREDENTIALS["admin@edusphere.edu"]` — found
- Password matches — passes
- `setUser({ role: "admin", ... })` — the mock user object has role `admin`
- Login page receives `user.role = "admin"` and navigates to `/admin/dashboard`
- The `portal: "student"` value is **ignored entirely**

**The backend's `login_api` endpoint correctly validates `user.role != portal`, but it is never reached.**

---

## Files Involved

### Primary (root cause)

| File | Line(s) | Role |
|------|---------|------|
| `frontend/src/context/AuthContext.tsx` | 18–31 | Defines `MOCK_CREDENTIALS` with hardcoded user objects |
| `frontend/src/context/AuthContext.tsx` | 106–144 | `login()` function — mock path returns user **without portal check** |
| `frontend/src/context/AuthContext.tsx` | 110 | `const entry = MOCK_CREDENTIALS[params.email];` — intercepts before API |

### Secondary

| File | Line(s) | Role |
|------|---------|------|
| `frontend/src/routes/login.tsx` | 36–55 | Login form submits `portal: role` but uses return value for navigation |
| `backend/authentication/views.py` | 86–90 | Backend `login_api` validates role correctly but is never called |
| `backend/authentication/serializers.py` | 25–26 | JWT `CustomTokenObtainPairSerializer` validates role correctly but is never called |
| `frontend/src/routes/auth.callback.tsx` | 33–37 | Social auth callback navigates by `user.role` — no portal cross-check |

---

## Frontend Issues

### Issue 1 (Critical): Mock credentials skip portal validation

**File:** `frontend/src/context/AuthContext.tsx:110–119`

```typescript
const entry = MOCK_CREDENTIALS[params.email];
if (entry) {
  if (entry.password !== params.password) {
    throw new Error("Invalid email or password.");
  }
  setUser(entry.user);                                           // ← user returned as-is
  localStorage.setItem("edusphere_mock_user", JSON.stringify(entry.user));
  return entry.user;                                             // ← portal not checked
}
```

The `portal` field from `params` is sent in the JSON body to the backend, but **never validated against the mock user's role**. The API call is never made when a mock entry matches.

### Issue 2: Login page trusts the return value only

**File:** `frontend/src/routes/login.tsx:41–48`

```typescript
const user = await login({ email, password: pwd, portal: role });
// user.role is "admin" even though portal was "student"
const redirectMap: Record<string, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};
navigate({ to: redirectMap[user.role] || "/student/dashboard" });
```

The form navigates based solely on `user.role`. If `login()` returns a user with `role: "admin"`, it navigates to the admin dashboard regardless of which portal tab was active. The `portal` variable is not used after being passed to `login()`.

### Issue 3: Route guards do not re-validate

**File:** `frontend/src/context/AuthContext.tsx:232–244`

The `useRequireRole` hook redirects to `getRoleRedirect(user.role)` if the user's role doesn't match, but since the login already placed the correct-role user in state, the guard passes. It is a **reactive guard**, not an **enforcement** — it relies on the state being correct.

---

## Backend Issues

### Issue 4: Backend validation is correct but unreachable

**File:** `backend/authentication/views.py:86–90`

```python
if user.role != portal:
    return JsonResponse(
        {"success": False, "message": "Invalid portal access for this user role."},
        status=403,
    )
```

The `login_api` endpoint properly validates role vs portal and returns 403 on mismatch. The same is true for `CustomTokenObtainPairSerializer` (line 25–26). However, neither endpoint is called because the frontend mock path returns early.

### Issue 5: No backend-side mock or dedicated test endpoint

The backend has no `/api/login/mock/` or similar endpoint. But the frontend's mock system lives entirely client-side in `AuthContext.tsx`, so the backend has no control over it.

---

## Security Impact

**Severity: High**

| Impact | Description |
|--------|-------------|
| **Privilege Escalation** | A non-admin user (or even unauthenticated visitor) with knowledge of a mock email can gain admin dashboard access |
| **Portal Bypass** | Role-based portal isolation is completely broken during mock authentication |
| **Data Exposure** | Admin dashboards may expose sensitive student/teacher/financial data to unauthorized users |
| **Persistence** | The mock user is stored in `localStorage` as `edusphere_mock_user`, so refreshing the page preserves the elevated session |
| **Unintentional Lockout** | Legitimate users might believe "Student" portal is broken when it logs them into Admin panel |

---

## Exact Fix Required

### The fix must ensure: The selected portal is validated against the user's role BEFORE login completes.

For the mock path:
- After finding a matching mock entry and verifying the password, **check that `params.portal === entry.user.role`**.
- If they do not match, reject with a message such as:  
  `"This account is not a {portal} account. Please select the correct portal."`

For the API path (already correct but ensure it's reachable):
- Ensure the `portal` field is sent and validated by the backend (already correct).

For the login form navigation:
- Do **not** rely solely on the returned `user.role` for navigation (optional hardening).

---

## Recommended Implementation

### 1. Add portal validation inside the mock branch (AuthContext.tsx, after line 113)

```typescript
const entry = MOCK_CREDENTIALS[params.email];
if (entry) {
  if (entry.password !== params.password) {
    const msg = "Invalid email or password.";
    setError(msg);
    throw new Error(msg);
  }
  // ★ NEW: validate portal against the mock user's actual role
  if (params.portal && entry.user.role !== params.portal) {
    const msg = `Invalid portal access for this user role.`;
    setError(msg);
    throw new Error(msg);
  }
  setUser(entry.user);
  localStorage.setItem("edusphere_mock_user", JSON.stringify(entry.user));
  return entry.user;
}
```

### 2. Add portal validation in the API success path (optional hardening)

In the API success branch (around line 129–134), after receiving the backend response, confirm that `data.user.role` matches the `params.portal` value. While the backend already enforces this, a double-check prevents any future desync.

### 3. (Optional) Remove `MOCK_CREDENTIALS` entirely for production

Replace the mock system with a dedicated Django test endpoint that returns seeded users only when `DEBUG=True`. This moves mock authentication server-side where it can be centrally controlled.

### 4. Add a regression test

Verification checklist after fix:

| Scenario | Expected Result |
|----------|----------------|
| Student tab + student@edusphere.edu / student123 | Login **succeeds**, redirect to `/student/dashboard` |
| Student tab + admin@edusphere.edu / admin123 | Login **fails** with error message |
| Teacher tab + admin@edusphere.edu / admin123 | Login **fails** with error message |
| Admin tab + admin@edusphere.edu / admin123 | Login **succeeds**, redirect to `/admin/dashboard` |
| Teacher tab + teacher@edusphere.edu / teacher123 | Login **succeeds**, redirect to `/teacher/dashboard` |
| Non-mock real credentials (any portal) | Backend validates, same behavior enforced |
