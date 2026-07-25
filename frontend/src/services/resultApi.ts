import { request } from "./request";

export interface GradeBoundary {
  id: number;
  name: string;
  min_percentage: number;
  max_percentage: number;
  grade_point: number;
  is_pass: boolean;
  remarks: string;
  created_at: string;
  updated_at: string;
}

export interface ResultPublication {
  id: number;
  exam: number;
  exam_name: string;
  academic_session: number | null;
  workflow_status: "draft" | "review" | "approved" | "published";
  is_locked: boolean;
  locked_at: string | null;
  locked_by: number | null;
  draft_at: string | null;
  draft_by: number | null;
  review_at: string | null;
  review_by: number | null;
  approved_at: string | null;
  approved_by: number | null;
  published_at: string | null;
  published_by: number | null;
  note: string;
  created_by: number;
  created_by_name: string;
  student_count: number;
  created_at: string;
  updated_at: string;
}

export interface StudentResult {
  id: number;
  publication: number;
  student: number;
  student_name: string;
  student_email: string;
  roll_number: string;
  class_assigned: string;
  exam_name: string;
  percentage: number;
  total_marks_obtained: number;
  total_marks_max: number;
  grade: string;
  grade_point: number;
  is_pass: boolean;
  remarks: string;
  merit_rank: number | null;
  class_rank: number | null;
  subject_counts: number;
  passed_subjects: number;
  failed_subjects: number;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubjectRanking {
  subject_id: number;
  subject_name: string;
  rankings: Array<{ student_id: number; rank: number; marks: number }>;
}

export interface ExamAnalytics {
  totalExams: number;
  publishedExams: number;
  pendingScripts: number;
  completedScripts: number;
}

export const resultApi = {
  // Grade Boundaries
  getGradeBoundaries: () => request<GradeBoundary[]>("/results/grade-boundaries/"),
  updateGradeBoundaries: (data: GradeBoundary[]) =>
    request<GradeBoundary[]>("/results/grade-boundaries/", { method: "PUT", body: JSON.stringify(data) }),

  // Publications
  createPublication: (examId: number) =>
    request<ResultPublication>("/results/publications/", { method: "POST", body: JSON.stringify({ exam: examId }) }),
  listPublications: (params?: { exam?: string; status?: string }) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}"` : "";
    return request<ResultPublication[]>(`/results/publications/list/${qs}`);
  },
  getPublication: (pubId: number) => request<ResultPublication>(`/results/publications/${pubId}/`),

  // Results
  generateResults: (pubId: number) =>
    request<StudentResult[]>(`/results/publications/${pubId}/generate/`, { method: "POST" }),
  getStudentResults: (pubId: number) => request<StudentResult[]>(`/results/publications/${pubId}/results/`),

  // Workflow
  transitionWorkflow: (pubId: number, target_status: string) =>
    request<ResultPublication>(`/results/publications/${pubId}/transition/`, { method: "POST", body: JSON.stringify({ target_status }) }),
  bulkPublish: (pubId: number) =>
    request<{ published_count: number }>(`/results/publications/${pubId}/bulk-publish/`, { method: "POST" }),

  // Ranks
  computeRanks: (pubId: number) =>
    request<{ detail: string }>(`/results/publications/${pubId}/compute-ranks/`, { method: "POST" }),
  getSubjectRanks: (pubId: number) => request<SubjectRanking[]>(`/results/publications/${pubId}/subject-ranks/`),

  // PDFs
  getReportCardPDF: (studentResultId: number) => `${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/api/admin/results/pdf/report-card/${studentResultId}/`,
  getMarksheetPDF: (pubId: number) => `${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/api/admin/results/pdf/marksheet/${pubId}/`,
  getTranscriptPDF: (studentResultId: number) => `${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/api/admin/results/pdf/transcript/${studentResultId}/`,
  getPrintablePDF: (studentResultId: number) => `${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/api/admin/results/pdf/printable/${studentResultId}/`,

  // Analytics
  getAnalytics: () => request<ExamAnalytics>("/exams/analytics/"),
};

export const examApi = {
  list: () => request<Array<{ id: number; name: string; date: string; status: string; subject_name: string | null; classes: string[] }>>("/exams/"),
};