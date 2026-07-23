import { request } from "./request";

const TEACHER_API_BASE = "http://localhost:8000/api/teacher";

export interface AssignmentData {
  id: string;
  title: string;
  description: string;
  subject: number;
  subject_name: string;
  target_class: string;
  due_date: string;
  created_by: number;
  created_at: string;
}

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

export const teacherAssignmentApi = {
  list: () =>
    request<AssignmentData[]>(
      "/assignments/",
      undefined,
      TEACHER_API_BASE,
    ),
  create: (data: { title: string; description: string; subject: number; target_class: string; due_date: string }) =>
    request<AssignmentData>(
      "/assignments/",
      { method: "POST", body: JSON.stringify(data) },
      TEACHER_API_BASE,
    ),
  get: (id: string) =>
    request<AssignmentData>(
      `/assignments/${id}/`,
      undefined,
      TEACHER_API_BASE,
    ),
  update: (id: string, data: Partial<{ title: string; description: string; target_class: string; due_date: string; status: string }>) =>
    request<AssignmentData>(
      `/assignments/${id}/`,
      { method: "PATCH", body: JSON.stringify(data) },
      TEACHER_API_BASE,
    ),
  delete: (id: string) =>
    request<void>(
      `/assignments/${id}/`,
      { method: "DELETE" },
      TEACHER_API_BASE,
    ),
  listSubmissions: (assignmentId: string) =>
    request<SubmissionData[]>(
      `/assignments/${assignmentId}/submissions/`,
      undefined,
      TEACHER_API_BASE,
    ),
  submitMarks: (submissionId: number, grade: number, remarks: string) =>
    request<SubmissionData>(
      `/submissions/${submissionId}/marks/`,
      {
        method: "POST",
        body: JSON.stringify({ grade, remarks }),
      },
      TEACHER_API_BASE,
    ),
};

export const teacherChapterApi = {
  list: () => request<unknown[]>("/chapters/", undefined, TEACHER_API_BASE),
  create: (data: Record<string, unknown>) =>
    request("/chapters/", { method: "POST", body: JSON.stringify(data) }, TEACHER_API_BASE),
  update: (id: number, data: Record<string, unknown>) =>
    request(`/chapters/${id}/`, { method: "PATCH", body: JSON.stringify(data) }, TEACHER_API_BASE),
  delete: (id: number) =>
    request(`/chapters/${id}/`, { method: "DELETE" }, TEACHER_API_BASE),
  addTopic: (chapterId: number, data: Record<string, unknown>) =>
    request(`/chapters/${chapterId}/topics/`, { method: "POST", body: JSON.stringify(data) }, TEACHER_API_BASE),
  updateTopic: (chapterId: number, topicId: number, data: Record<string, unknown>) =>
    request(`/chapters/${chapterId}/topics/${topicId}/`, { method: "PATCH", body: JSON.stringify(data) }, TEACHER_API_BASE),
  deleteTopic: (chapterId: number, topicId: number) =>
    request(`/chapters/${chapterId}/topics/${topicId}/`, { method: "DELETE" }, TEACHER_API_BASE),
};

export const teacherClassProgressApi = {
  list: () => request<unknown[]>("/class-progress/", undefined, TEACHER_API_BASE),
  update: (data: Record<string, unknown>) =>
    request("/class-progress/", { method: "POST", body: JSON.stringify(data) }, TEACHER_API_BASE),
};

export const teacherExamApi = {
  list: () => request<unknown[]>("/exams/", undefined, TEACHER_API_BASE),
};

export const teacherResourceApi = {
  list: () =>
    request<any[]>(
      "/resources/",
      undefined,
      TEACHER_API_BASE,
    ).catch(() => null),
  create: (formData: FormData) =>
    request<any>(
      "/resources/",
      { method: "POST", body: formData },
      TEACHER_API_BASE,
    ).catch(() => null),
  update: (id: string, formData: FormData) =>
    request<any>(
      `/resources/${id}/`,
      { method: "PUT", body: formData },
      TEACHER_API_BASE,
    ).catch(() => null),
  delete: (id: string) =>
    request<void>(
      `/resources/${id}/`,
      { method: "DELETE" },
      TEACHER_API_BASE,
    ).catch(() => null),
};
