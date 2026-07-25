import { request } from "./request";

export interface PromotionStudent {
  id: number;
  full_name: string;
  email: string;
  class_assigned: string;
  section: string;
  roll_number: string;
  attendance_percentage?: number;
  average_percentage?: number;
  failed_subjects?: number;
}

export interface PromotionLogEntry {
  id: number;
  student: { id: number; name: string; email: string };
  from_class: string;
  from_section: string;
  to_class: string;
  to_section: string;
  action: string;
  academic_session_from: number | null;
  academic_session_to: number | null;
  reason: string;
  processed_by: { id: number | null; name: string | null };
  rollback_of: number | null;
  created_at: string;
}

export interface PromotionRule {
  id: number;
  name: string;
  from_class: string;
  min_percentage: number;
  min_attendance_percentage: number;
  max_failed_subjects: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentPromotionHistoryEntry {
  id: number;
  academic_session: number;
  session_name: string;
  class_name: string;
  section: string;
  status: string;
  percentage: number | null;
  rank: number | null;
  remarks: string;
  created_at: string;
}

export interface SessionRollover {
  id: number;
  from_session: { id: number; name: string };
  to_session: { id: number; name: string };
  status: string;
  copy_options: string[];
  processed_by: { id: number | null; name: string | null };
  created_at: string;
  completed_at: string | null;
  error_log: string[] | null;
}

export interface AcademicSession {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface BulkPromoteRequest {
  student_ids: number[];
  target_class: string;
  target_section?: string;
  action?: string;
  reason?: string;
}

export interface BulkPromoteResponse {
  bulk_promotion: {
    students_processed: number;
    logs_created: number;
    current_session: string;
    next_session: string;
  };
}

export const promotionApi = {
  promote: (student_id: number, target_class: string, section?: string, reason?: string) =>
    request<{ promotion_log: { id: number }; previous_class: string }>(
      "/promotions/student/",
      {
        method: "POST",
        body: JSON.stringify({ student_id, target_class, section: section || "", reason: reason || "" }),
      }
    ),

  repeatOrDetain: (student_id: number, action: "repeat" | "detain", reason?: string) =>
    request<{ promotion_log: { id: number } }>(
      "/promotions/student/",
      {
        method: "PATCH",
        body: JSON.stringify({ student_id, action, reason: reason || "" }),
      }
    ),

  rollback: (promotion_log_id: number, reason?: string) =>
    request<{ promotion_log: { id: number } }>(
      `/promotions/student/${promotion_log_id}/rollback/`,
      {
        method: "POST",
        body: JSON.stringify({ promotion_log_id, reason: reason || "" }),
      }
    ),

  bulkPromote: (data: BulkPromoteRequest) =>
    request<BulkPromoteResponse>("/promotions/bulk/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getLogs: () => request<{ logs: PromotionLogEntry[] }>("/promotions/logs/"),

  getHistory: (student_id: number) =>
    request<{ history: StudentPromotionHistoryEntry[] }>(`/promotions/history/${student_id}/`),

  getRules: () => request<{ rules: PromotionRule[] }>("/promotions/rules/"),

  createRule: (data: Partial<PromotionRule>) =>
    request<{ rule: PromotionRule }>("/promotions/rules/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRule: (rule_id: number, data: Partial<PromotionRule>) =>
    request<{ rule: PromotionRule }>(`/promotions/rules/${rule_id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteRule: (rule_id: number) =>
    request<void>(`/promotions/rules/${rule_id}/`, { method: "DELETE" }),

  createRollover: (from_session_id: number, to_session_id: number, copy_options?: string[]) =>
    request<{ rollover: SessionRollover }>("/promotions/rollover/", {
      method: "POST",
      body: JSON.stringify({ from_session_id, to_session_id, copy_options: copy_options || ["all"] }),
    }),

  getRolloverDetail: (rollover_id: number) =>
    request<{ rollover: SessionRollover }>(`/promotions/rollover/${rollover_id}/`),
};

export const classAdminApi = {
  list: () => request<{ name: string; total_students: number }[]>("/classes/"),
};

export const sessionApi = {
  list: () => request<AcademicSession[]>("/sessions/"),
};

export const studentPromotionApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<PromotionStudent[]>(`/students/${qs}`);
  },
  detail: (id: number) => request<PromotionStudent>(`/students/${id}/`),
};