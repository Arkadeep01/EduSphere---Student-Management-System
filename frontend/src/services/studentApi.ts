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

export interface SubmissionFileData {
  id: number;
  file: string;
  original_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface SubmissionData {
  id: number;
  assignment: number;
  assignment_title: string;
  student: number;
  student_name: string;
  file: string | null;
  files: SubmissionFileData[];
  status: string;
  grade: string | null;
  remarks: string;
  submitted_at: string;
  evaluated_at: string | null;
}

export const studentSubmissionApi = {
  submit: (assignmentId: string, files: File[]) => {
    const formData = new FormData();
    formData.append("assignment", assignmentId);
    files.forEach(f => formData.append("files", f));
    return request<SubmissionData>(
      "/submissions/",
      { method: "POST", body: formData },
      STUDENT_API_BASE,
    );
  },
  getForAssignment: (assignmentId: string) =>
    request<SubmissionData | { submission: null }>(
      `/submissions/?assignment=${assignmentId}`,
      undefined,
      STUDENT_API_BASE,
    ),
  list: () =>
    request<SubmissionData[]>("/submissions/", undefined, STUDENT_API_BASE),
  removeFile: (fileId: number) =>
    request<void>(
      `/submissions/files/${fileId}/`,
      { method: "DELETE" },
      STUDENT_API_BASE,
    ),
};
