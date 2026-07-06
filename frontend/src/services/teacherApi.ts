import { request } from "./request";

const TEACHER_API_BASE = "http://localhost:8000/api/teacher";

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
