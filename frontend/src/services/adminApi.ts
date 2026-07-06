import { request, ADMIN_API_BASE } from "./request";

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

// Exports
export const exportApi = {
  students: (format = "csv") => `${ADMIN_API_BASE}/exports/students/?format=${format}`,
  teachers: (format = "csv") => `${ADMIN_API_BASE}/exports/teachers/?format=${format}`,
  attendance: (format = "csv") => `${ADMIN_API_BASE}/exports/attendance/?format=${format}`,
};
