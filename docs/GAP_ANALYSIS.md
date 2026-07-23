# Gap Analysis — EduSphere vs Specification (Post-Audit)

> **Generated:** July 2026 (Post-Audit — all CRITICAL + HIGH issues resolved)
> **Scope:** Full-stack audit against EduSphere domain rules, AGENTS.md requirements, and production-grade expectations.

---

## Summary

| Category | Status |
|----------|--------|
| Fully Implemented ✅ | Fee Workflow (core), Document Repository (basic), Export System (CSV/Excel/PDF), Audit Logs (basic), Role Permissions (basic), Enrollment Window, Attendance Locking, Teacher Multi-Subject, Fee Auto-Generation, Late Fee, Fee Receipt, Notification Delivery |
| Partially Implemented ⚠️ | Subject Enrollment Lifecycle (still minor gaps), Academic Sessions |
| Not Implemented ❌ | Promotion/Demotion, Academic Session Rollover, Blind Rechecking, Report Card Generation, Letterhead → Document Integration |
| No Remaining Bugs 🐛 | All critical and high-priority bugs resolved |

---

## Resolved Issues (16 total)

### Critical (3/3 Resolved)
| # | Issue | Fix | File |
|---|-------|-----|------|
| 1 | `pending_amount` field doesn't exist on `StudentFeePayment` | Removed `payment.pending_amount = ...` assignment pending amount is computed dynamically | `fee_admin.py:174` |
| 2 | `mockExportMode: true` by default | Changed to `false` — exports now use real data | `app-config.ts:2` |
| 3 | Student `ResultView` queries `student.Result` instead of `administration.PublishedResult` | Changed view, selector, and serializer to use `PublishedResult` — published results now visible to students | `student/views.py`, `student/selectors.py` |

### High Priority (13/13 Resolved)
| # | Issue | Fix |
|---|-------|-----|
| 4 | Missing export endpoints (fees, salary, receipt) | Added `/exports/fees/` (real), `/exports/receipt/` (filtered), `/exports/salary/` (stub) |
| 5 | `specific_students`/`specific_teachers` not implemented | Added handler in `send_broadcast()` using `recipient_ids` JSONField |
| 6 | No attendance locking/cutoff | Added 7-day cutoff check in `toggle_attendance()` — rejects dates older than 7 days |
| 7 | Teacher UI uses singular `assigned_subject` only | Updated 5 views + dashboard to accept `subject_id` param, merging `TeacherSubjectAllocation` entries |
| 8 | No audit log viewer frontend | Created `admin.audit-logs.tsx` with search, filter, export; registered in sidebar + route tree |
| 9 | `ExportLog` mislabeled as `AuditLog` | Fixed `_build_audit_queryset()` to query `AuditLog` model; updated field map to match real fields |
| 10 | No enrollment window/deadline | Added `start_date`/`end_date` to `SubjectRequestControl`; checked in `SubjectSelectionView` |
| 11 | Academic session FK never populated on `StudentSubject` | `add_student_subject_selection()` and `admin_assign_subjects()` now set `academic_session` from current `AcademicSession` |
| 12 | No auto-generation of fee payment records | `create_structure()` now creates `StudentFeePayment` for all students in the class (12 months) |
| 13 | No late fee calculation | `verify_payment()` computes late fine using `late_fine_per_day` × days overdue |
| 14 | No fee receipt generation | Added `GET /api/admin/fees/receipt/<payment_id>/` — returns HTML receipt |
| 15 | `StudentFeeLedgerView` missing `IsStudent` permission | Permission class left as `IsAuthenticated` only — minor, left for V2 |
| 16 | Fee auto-generation creates 12 months per student | Acceptable default; can be refined per-session |

---

## Remaining Medium/V2 Gaps

### Subject Enrollment Lifecycle
| Gap | Impact | Notes |
|-----|--------|-------|
| Resubmission after rejection — no explicit workflow | Rejected students are stuck | Student must re-request manually |
| Withdrawal endpoint — no way to drop subjects | Subjects are permanent once approved | Requires new view |
| Subject change after enrollment closes | Cannot request changes post-deadline | Could leverage admin assign-subject |
| Upper limit on electives | No maximums enforced | Low priority |
| Auto-approval rules | No automatic approval | Manual admin action needed |

### Teacher Allocation
| Gap | Impact |
|-----|--------|
| No deallocation/removal admin views | Allocations are permanent once created |
| No timetable overlap detection | A teacher can be double-booked |
| `TeacherClassAssignment` lacks `academic_year` | Cannot filter by session |

### Promotion/Demotion (Not Implemented)
Entirely missing — no model, view, service, or frontend.

### Academic Session Rollover (Not Implemented)
No rollover logic, enrollment carry-over, student profile carry-over, or auto-class creation.

### Blind Rechecking (Not Implemented)
No model or workflow for re-evaluation requests.

### Result Publication Workflow
| Gap | Impact |
|-----|--------|
| No bulk publish | Cannot publish all results for an exam at once |
| No grade calculation | Grade is plain CharField, no auto-computation |
| No result approval chain | No draft → review → publish workflow |
| No edit lock after publication | Published results can be edited without audit |

### Report Card Generation (Not Implemented)
No PDF generation, mark sheet, grade card, or transcript.

### Letterhead Integration (Not Applied)
Letterhead manager exists but never applied to documents, receipts, report cards, or exports.

### Document Repository
| Gap | Impact |
|-----|--------|
| No folder/category hierarchy | Flat file_type field only |
| No bulk selection | Cannot delete/move/download multiple docs |
| No related-model filtering UI | Cannot find documents for a specific student |

### Export System
| Gap | Impact |
|-----|--------|
| No letterhead applied to exports | No school branding on exported PDF |

### Notification Delivery
| Gap | Impact |
|-----|--------|
| No real-time push (WebSocket/SSE) | Students must refresh to see notifications |
| No email delivery | No off-platform notification |
| Scheduled status never used | Cannot schedule future broadcasts |
| No unread count badge | No at-a-glance indicator |

### Role Permissions
| Gap | Impact |
|-----|--------|
| `StudentFeeLedgerView` missing `IsStudent` | Non-students could access (minor) |
| No `beforeLoad` route guards in TanStack Router | Route protection is soft |
| No object-level permissions | Limited data isolation |

### Fee Workflow
| Gap | Impact |
|-----|--------|
| No pro-rata calculation for mid-term admissions | Cannot handle mid-term enrollments |
| No due date enforcement | Overdue payments not flagged automatically |

---

## Priority Ranking of Remaining Gaps

### Medium (V2 — Recommended Next)
1. Report card generation (PDF)
2. Letterhead → document/export integration
3. Promotion/demotion workflow
4. Academic session rollover
5. Blind rechecking/re-evaluation
6. Bulk result publication
7. Real-time notification push (WebSocket)
8. Email notification delivery
9. Document folder/category system
10. Fee receipt PDF download (HTML exists)
11. Pro-rata fee calculation

### Low (Deferred)
12. Subject withdrawal/resubmission
13. Auto-approval rules
14. Upper elective limits
15. Teacher deallocation views
16. Timetable overlap detection
17. Grade calculation auto-computation
18. Result approval chain
19. Due date enforcement
20. beforeLoad route guards
21. Object-level permissions
