import { request, STUDENT_API_BASE } from "./request";

export interface Subject {
  id: number;
  name: string;
  code: string;
  tier: string;
  teacher_name: string;
  description: string;
  color: string;
  progress: number;
}

export interface StudentSubject {
  id: number;
  subject: number;
  subject_name?: string;
  subject_code?: string;
  subject_tier?: string;
  status: string;
  created_at: string;
}

export interface MySubjectsResponse {
  assigned: Subject[];
  pending: StudentSubject[];
}

export const studentSubjectApi = {
  listAll: () => request<Subject[]>("/subjects/", undefined, STUDENT_API_BASE),
  mySubjects: () => request<MySubjectsResponse>("/subjects/my/", undefined, STUDENT_API_BASE),
  select: (subjectIds: number[]) =>
    request("/subjects/select/", { method: "POST", body: JSON.stringify({ subject_ids: subjectIds }) }, STUDENT_API_BASE),
  requestStatus: () => request<{ enabled: boolean }>("/subject-request-status/", undefined, STUDENT_API_BASE),
};

export const studentDashboardApi = {
  get: () => request<Record<string, unknown>>("/dashboard/", undefined, STUDENT_API_BASE),
};

export const studentNotificationApi = {
  list: (unreadOnly = false) =>
    request<unknown[]>(`/notifications/${unreadOnly ? "?unread_only=true" : ""}`, undefined, STUDENT_API_BASE),
};
