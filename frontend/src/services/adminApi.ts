import { request, ADMIN_API_BASE, STAFF_API_BASE } from "./request";
import { isMockExportMode } from "@/lib/app-config";
import { generateMockExport } from "@/lib/mock-export";

// Dashboard
export const dashboardApi = {
  summary: () => request<Record<string, unknown>>("/dashboard/summary/"),
  studentGrowth: () => request<unknown[]>("/dashboard/student-growth/"),
  attendance: () => request<unknown[]>("/dashboard/attendance/"),
  examPerformance: () => request<unknown[]>("/dashboard/exam-performance/"),
};

// Students
export const studentAdminApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<unknown[]>(`/students/${qs}`);
  },
  detail: (id: number) => request<unknown>(`/students/${id}/`),
  approveSubjects: (id: number, subjectIds: number[]) =>
    request(`/students/${id}/approve-subjects/`, { method: "POST", body: JSON.stringify({ subject_ids: subjectIds }) }),
  assignSubjects: (id: number, subjectIds: number[]) =>
    request(`/students/${id}/assign-subjects/`, { method: "POST", body: JSON.stringify({ subject_ids: subjectIds }) }),
  notifications: (id: number) => request<unknown[]>(`/students/${id}/notifications/`),
  sendNotification: (id: number, title: string, message: string) =>
    request(`/students/${id}/notifications/`, { method: "POST", body: JSON.stringify({ title, message }) }),
  documents: (id: number) => request<unknown[]>(`/students/${id}/documents/`),
};

// Teachers
export const teacherAdminApi = {
  list: () => request<unknown[]>("/teachers/"),
  detail: (id: number) => request<unknown>(`/teachers/${id}/`),
  notify: (id: number, title: string, message: string) =>
    request(`/teachers/${id}/notify/`, { method: "POST", body: JSON.stringify({ title, message }) }),
  assignClassTeacher: (id: number, class_name: string, academic_year?: string) =>
    request(`/teachers/${id}/assign-class-teacher/`, { method: "POST", body: JSON.stringify({ class_name, academic_year }) }),
  allocateSubject: (id: number, subject_id: number, assigned_classes: string[], academic_year?: string) =>
    request(`/teachers/${id}/allocate-subject/`, { method: "POST", body: JSON.stringify({ subject_id, assigned_classes, academic_year }) }),
  allocations: () => request<unknown[]>("/teacher-allocations/"),
  classTeacherAssignments: () => request<unknown[]>("/class-teacher-assignments/"),
};

// Classes
export const classAdminApi = {
  list: () => request<unknown[]>("/classes/"),
  detail: (name: string) => request<unknown>(`/classes/${name}/`),
};

// Attendance
export const attendanceAdminApi = {
  analytics: () => request<unknown>("/attendance/analytics/"),
  faculty: () => request<unknown[]>("/attendance/faculty/"),
  markFaculty: (teacher_id: number, status: string) =>
    request("/attendance/faculty/mark/", { method: "POST", body: JSON.stringify({ teacher_id, status }) }),
};

// Exams
export const examAdminApi = {
  list: () => request<unknown[]>("/exams/"),
  create: (data: Record<string, unknown>) =>
    request("/exams/", { method: "POST", body: JSON.stringify(data) }),
  publish: (id: number) => request(`/exams/${id}/publish/`, { method: "POST" }),
  archive: (id: number) => request(`/exams/${id}/archive/`, { method: "POST" }),
  uploadScript: (data: FormData) =>
    request("/exams/answer-scripts/", { method: "POST", body: data }),
  evaluationTracking: () => request<unknown[]>("/exams/evaluation-tracking/"),
  publishResult: (data: Record<string, unknown>) =>
    request("/exams/publish-result/", { method: "POST", body: JSON.stringify(data) }),
  analytics: () => request<unknown>("/exams/analytics/"),
};

// Events
export const eventAdminApi = {
  list: () => request<unknown[]>("/events/"),
  create: (data: Record<string, unknown>) =>
    request("/events/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    request(`/events/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  publish: (id: number) => request(`/events/${id}/publish/`, { method: "POST" }),
  archive: (id: number) => request(`/events/${id}/archive/`, { method: "POST" }),
  delete: (id: number) => request(`/events/${id}/`, { method: "DELETE" }),
};

// Contacts
export const contactAdminApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<unknown[]>(`/contacts/${qs}`);
  },
  updateStatus: (id: number, status: string) =>
    request(`/contacts/${id}/`, { method: "PATCH", body: JSON.stringify({ status }) }),
  delete: (id: number) => request(`/contacts/${id}/`, { method: "DELETE" }),
};

// Admissions
export const admissionAdminApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<unknown[]>(`/admissions/${qs}`);
  },
  detail: (id: number) => request<unknown>(`/admissions/${id}/`),
  approve: (id: number) => request(`/admissions/${id}/approve/`, { method: "POST" }),
  reject: (id: number) => request(`/admissions/${id}/reject/`, { method: "POST" }),
  createStudent: (id: number) => request(`/admissions/${id}/create-student/`, { method: "POST" }),
  stats: () => request<unknown>("/admissions/stats/"),
};

// Settings / CMS
export const cmsApi = {
  about: {
    get: () => request<unknown>("/settings/about/"),
    update: (data: Record<string, unknown>) =>
      request("/settings/about/", { method: "PATCH", body: JSON.stringify(data) }),
  },
  gallery: {
    list: () => request<unknown[]>("/settings/gallery/"),
    upload: (formData: FormData) =>
      request("/settings/gallery/", { method: "POST", body: formData }),
    delete: (id: number) => request(`/settings/gallery/${id}/`, { method: "DELETE" }),
  },
  homepage: {
    list: () => request<unknown[]>("/settings/homepage/"),
    upload: (formData: FormData) =>
      request("/settings/homepage/", { method: "POST", body: formData }),
    delete: (id: number) => request(`/settings/homepage/${id}/`, { method: "DELETE" }),
  },
  admission: {
    get: () => request<unknown>("/settings/admission/"),
    update: (data: Record<string, unknown>) =>
      request("/settings/admission/", { method: "PATCH", body: JSON.stringify(data) }),
  },
};

// Fees
export const feeApi = {
  structures: {
    list: () => request<unknown[]>("/fees/structures/"),
    create: (data: Record<string, unknown>) =>
      request("/fees/structures/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) =>
      request(`/fees/structures/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/fees/structures/${id}/`, { method: "DELETE" }),
    duplicate: (fromClass: string, toClass: string) =>
      request("/fees/structures/duplicate/", { method: "POST", body: JSON.stringify({ from_class: fromClass, to_class: toClass }) }),
  },
  payments: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return request<unknown[]>(`/fees/payments/${qs}`);
    },
    verify: (id: number) => request(`/fees/payments/${id}/verify/`, { method: "POST" }),
    reject: (id: number) => request(`/fees/payments/${id}/reject/`, { method: "POST" }),
    initiateRefund: (id: number) => request(`/fees/payments/${id}/refund/initiate/`, { method: "POST" }),
    completeRefund: (id: number) => request(`/fees/payments/${id}/refund/complete/`, { method: "POST" }),
  },
  scholarships: {
    list: () => request<unknown[]>("/fees/scholarships/"),
    grant: (data: Record<string, unknown>) =>
      request("/fees/scholarships/", { method: "POST", body: JSON.stringify(data) }),
    revoke: (id: number) => request(`/fees/scholarships/${id}/revoke/`, { method: "POST" }),
  },
  analytics: () => request<unknown>("/fees/analytics/"),
  activityLog: () => request<unknown[]>("/fees/activity-log/"),
  myLedger: () => request<unknown>("/fees/my-ledger/"),
  recordOffline: (data: Record<string, unknown>) =>
    request("/fees/my-ledger/", { method: "POST", body: JSON.stringify(data) }),
};

// Letterheads
export const letterheadApi = {
  list: () => request<unknown[]>("/letterheads/"),
  create: (data: Record<string, unknown>) =>
    request("/letterheads/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    request(`/letterheads/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => request(`/letterheads/${id}/`, { method: "DELETE" }),
};

// Documents
export const documentApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<unknown[]>(`/documents/${qs}`);
  },
  upload: (formData: FormData) => {
    const token = localStorage.getItem("accessToken");
    return fetch(`${ADMIN_API_BASE}/documents/upload/`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => { if (!r.ok) throw new Error("Upload failed"); return r.json(); });
  },
  delete: (id: number) => request(`/documents/${id}/`, { method: "DELETE" }),
};

// Subject Request Control
export const subjectRequestApi = {
  get: () => request<{ enabled: boolean }>("/subject-request-control/"),
  update: (enabled: boolean) =>
    request("/subject-request-control/", { method: "PATCH", body: JSON.stringify({ enabled }) }),
  pendingRequests: (class_name?: string) => {
    const qs = class_name ? `?class_name=${class_name}` : "";
    return request<PendingSubjectRequest[]>(`/subject-requests/pending/${qs}`);
  },
  approve: (studentId: number, subjectIds: number[]) =>
    request(`/students/${studentId}/approve-subjects/`, { method: "POST", body: JSON.stringify({ subject_ids: subjectIds }) }),
  reject: (studentId: number, subjectIds: number[], reason?: string) =>
    request(`/students/${studentId}/reject-subjects/`, { method: "POST", body: JSON.stringify({ subject_ids: subjectIds, reason: reason || "" }) }),
};

export interface PendingSubjectRequest {
  id: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  class_assigned: string;
  section: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  subject_category: string;
  requested_on: string;
  status: string;
}

// Subject Management
export const subjectAdminApi = {
  list: () => request<SubjectItem[]>("/subjects/"),
  create: (data: Partial<SubjectItem>) =>
    request<SubjectItem>("/subjects/", { method: "POST", body: JSON.stringify(data) }),
  detail: (id: number) => request<SubjectItem>(`/subjects/${id}/`),
  update: (id: number, data: Partial<SubjectItem>) =>
    request<SubjectItem>(`/subjects/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => request(`/subjects/${id}/`, { method: "DELETE" }),
};

export interface SubjectItem {
  id: number;
  name: string;
  code: string;
  tier: string;
  teacher_name: string;
  description: string;
  color: string;
  progress: number;
}

// Notification Broadcasts
export interface NotificationBroadcast {
  id: number;
  title: string;
  message: string;
  recipient_type: string;
  target_class: string;
  recipient_ids: number[];
  status: string;
  sent_by: number | null;
  sent_at: string | null;
  created_at: string;
}

export const notificationBroadcastApi = {
  list: () => request<NotificationBroadcast[]>("/notifications/"),
  create: (data: Partial<NotificationBroadcast>) =>
    request<NotificationBroadcast>("/notifications/", { method: "POST", body: JSON.stringify(data) }),
  send: (id: number) =>
    request<NotificationBroadcast>(`/notifications/${id}/send/`, { method: "POST" }),
};

// Audit Logs
export const auditLogApi = {
  list: () => request<AuditLogEntry[]>("/audit-logs/"),
};

interface AuditLogEntry {
  id: number;
  user: string | null;
  action: string;
  model_name: string;
  object_id: string;
  description: string;
  ip_address: string | null;
  created_at: string;
}

// ---- Generic Download Helper ----

async function downloadModule(
  endpoint: string,
  format: string,
  fields: string[],
  filters: Record<string, unknown>,
  defaultPrefix: string,
): Promise<{ blob: Blob; filename: string }> {
  if (isMockExportMode()) {
    return generateMockExport(endpoint, format, fields, filters);
  }
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${ADMIN_API_BASE}/exports/${endpoint}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ format, fields, filters }),
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?(.+?)"?$/);
  const filename = match ? match[1] : `${defaultPrefix}_${format}.${format === "excel" ? "xlsx" : format}`;
  return { blob, filename };
}

// Exports
export const exportApi = {
  students: (format = "csv") => `${ADMIN_API_BASE}/exports/students/?format=${format}`,
  teachers: (format = "csv") => `${ADMIN_API_BASE}/exports/teachers/?format=${format}`,
  attendance: (format = "csv") => `${ADMIN_API_BASE}/exports/attendance/?format=${format}`,
  downloadStudents: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("students", format, fields, filters, "Students"),
  downloadTeachers: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("teachers", format, fields, filters, "Teachers"),
  downloadAttendance: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("attendance", format, fields, filters, "Attendance"),
  downloadClasses: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("classes", format, fields, filters, "Classes"),
  downloadExams: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("exams", format, fields, filters, "Exams"),
  downloadAdmissions: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("admissions", format, fields, filters, "Admissions"),
  downloadContacts: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("contacts", format, fields, filters, "Contacts"),
  downloadAuditLogs: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("audit-logs", format, fields, filters, "AuditLogs"),
  downloadDocuments: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("documents", format, fields, filters, "Documents"),
  downloadFees: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("fees", format, fields, filters, "Fees"),
  downloadSalary: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("salary", format, fields, filters, "Salary"),
  downloadReceipt: (format: string, fields: string[], filters: Record<string, unknown>) =>
    downloadModule("receipt", format, fields, filters, "Receipt"),
  downloadPrint: async (module: string, fields: string[], filters: Record<string, unknown>) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${ADMIN_API_BASE}/exports/print/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ module, fields, filters }),
    });
    if (!res.ok) throw new Error(`Print failed: ${res.status}`);
    return res.text();
  },
  downloadDocumentZIP: async (documentIds: number[]) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${ADMIN_API_BASE}/exports/documents/zip/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ document_ids: documentIds }),
    });
    if (!res.ok) throw new Error(`ZIP download failed: ${res.status}`);
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?(.+?)"?$/);
    const filename = match ? match[1] : "Documents.zip";
    return { blob, filename };
  },
  downloadAdmissionZIP: async (admissionIds: number[]) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${ADMIN_API_BASE}/exports/admissions/zip/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ admission_ids: admissionIds }),
    });
    if (!res.ok) throw new Error(`ZIP download failed: ${res.status}`);
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?(.+?)"?$/);
    const filename = match ? match[1] : "AdmissionDocuments.zip";
    return { blob, filename };
  },
};

// Staff API
export const staffApi = {
  dashboard: () => request<Record<string, unknown>>("/dashboard/", undefined, STAFF_API_BASE),
  uploadTasks: () => request<unknown[]>("/upload-tasks/", undefined, STAFF_API_BASE),
  uploadScript: (formData: FormData) =>
    request<Record<string, unknown>>("/upload/", { method: "POST", body: formData }, STAFF_API_BASE),
  uploadScriptDetail: (id: number) =>
    request<Record<string, unknown>>(`/upload/${id}/`, undefined, STAFF_API_BASE),
  replaceScript: (id: number, formData: FormData) =>
    request<Record<string, unknown>>(`/upload/${id}/`, { method: "PUT", body: formData }, STAFF_API_BASE),
  deleteScript: (id: number) =>
    request<Record<string, unknown>>(`/upload/${id}/`, { method: "DELETE" }, STAFF_API_BASE),
  uploadHistory: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<unknown[]>(`/history/${qs}`, undefined, STAFF_API_BASE);
  },
  pendingUploads: (examId?: number, subjectId?: number) => {
    const params = new URLSearchParams();
    if (examId) params.set("exam", String(examId));
    if (subjectId) params.set("subject", String(subjectId));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<unknown[]>(`/upload/${qs}`, undefined, STAFF_API_BASE);
  },
  profile: () => request<Record<string, unknown>>("/profile/", undefined, STAFF_API_BASE),
  updateProfile: (data: Record<string, unknown>) =>
    request<Record<string, unknown>>("/profile/", { method: "PUT", body: JSON.stringify(data) }, STAFF_API_BASE),
};
