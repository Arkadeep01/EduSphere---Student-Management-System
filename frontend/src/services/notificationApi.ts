import { request, API_BASE } from "./request";

export interface NotificationItem {
  recipient_id: number;
  id: number;
  type: string;
  type_display: string;
  title: string;
  message: string;
  priority: string;
  priority_display: string;
  read_status: string;
  read_at: string | null;
  delivery_status: string;
  sender: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface NotificationListResponse {
  results: NotificationItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface NotificationAnalytics {
  total_notifications: number;
  active: number;
  expired: number;
  delivery_stats: {
    delivered: number;
    failed: number;
    pending: number;
    retry: number;
  };
  priority_distribution: { priority: string; count: number }[];
  type_statistics: { notification__notification_type: string; total: number; read: number; unread: number }[];
  recent_failures: { id: number; notification: string; channel: string; error: string; created_at: string }[];
}

export interface InstitutionSettings {
  id: number;
  institution_name: string;
  logo: string | null;
  address: string;
  phone: string;
  email: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  principal_name: string;
  principal_signature: string | null;
  email_footer: string;
  brand_color_primary: string;
  brand_color_secondary: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSchedule {
  id: number;
  notification_type: string;
  reminder_interval_hours: number;
  is_active: boolean;
  priority: string;
  target_audience: string;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryLog {
  id: number;
  notification: number;
  notification_title: string;
  recipient: number;
  recipient_email: string;
  channel: string;
  status: string;
  error_message: string;
  retry_count: number;
  created_at: string;
}

export interface NotificationAuditLog {
  id: number;
  notification: number;
  notification_title: string;
  action: string;
  performed_by: number | null;
  performed_by_name: string | null;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const NOTIFICATION_BASE = `${API_BASE}/api/notifications`;

export const notificationApi = {
  // Notifications
  list: (params?: {
    notification_type?: string;
    read_status?: string;
    priority?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return request<NotificationListResponse>(`/notifications/${qs}`, {}, NOTIFICATION_BASE);
  },
  create: (data: Record<string, unknown>) =>
    request<NotificationItem>("/notifications/", { method: "POST", body: JSON.stringify(data) }, NOTIFICATION_BASE),
  detail: (id: number) =>
    request<NotificationItem>(`/notifications/${id}/`, {}, NOTIFICATION_BASE),
  delete: (id: number) =>
    request(`/notifications/${id}/`, { method: "DELETE" }, NOTIFICATION_BASE),
  markRead: (id: number) =>
    request(`/notifications/${id}/read/`, { method: "POST" }, NOTIFICATION_BASE),
  markAllRead: () =>
    request<{ count: number }>("/notifications/mark-all-read/", { method: "POST" }, NOTIFICATION_BASE),
  bulkRead: (ids: number[]) =>
    request<{ count: number }>("/notifications/bulk-read/", { method: "POST", body: JSON.stringify({ notification_ids: ids }) }, NOTIFICATION_BASE),
  unreadCount: () =>
    request<{ count: number }>("/notifications/unread-count/", {}, NOTIFICATION_BASE),
  deleteRead: () =>
    request<{ deleted: number }>("/notifications/delete-read/", { method: "POST" }, NOTIFICATION_BASE),

  // Analytics
  analytics: () =>
    request<NotificationAnalytics>("/analytics/", {}, NOTIFICATION_BASE),

  // Priority
  overridePriority: (notificationId: number, newPriority: string) =>
    request("/priorities/override/", {
      method: "POST",
      body: JSON.stringify({ notification_id: notificationId, new_priority: newPriority }),
    }, NOTIFICATION_BASE),

  // Institution Settings
  institutionSettings: {
    get: () => request<InstitutionSettings>("/institution-settings/", {}, NOTIFICATION_BASE),
    update: (data: Partial<InstitutionSettings>) =>
      request<InstitutionSettings>("/institution-settings/", { method: "PATCH", body: JSON.stringify(data) }, NOTIFICATION_BASE),
  },

  // Email Templates
  emailTemplates: {
    list: () => request<EmailTemplate[]>("/email-templates/", {}, NOTIFICATION_BASE),
    get: (id: number) => request<EmailTemplate>(`/email-templates/${id}/`, {}, NOTIFICATION_BASE),
    create: (data: Partial<EmailTemplate>) =>
      request<EmailTemplate>("/email-templates/", { method: "POST", body: JSON.stringify(data) }, NOTIFICATION_BASE),
    update: (id: number, data: Partial<EmailTemplate>) =>
      request<EmailTemplate>(`/email-templates/${id}/`, { method: "PATCH", body: JSON.stringify(data) }, NOTIFICATION_BASE),
    delete: (id: number) =>
      request(`/email-templates/${id}/`, { method: "DELETE" }, NOTIFICATION_BASE),
    preview: (templateId: number, context?: Record<string, unknown>) =>
      request<{ id: number; name: string; subject: string; html: string; text: string }>(
        "/email-templates/preview/",
        { method: "POST", body: JSON.stringify({ template_id: templateId, context: context || {} }) },
        NOTIFICATION_BASE
      ),
  },

  // Schedules
  schedules: {
    list: () => request<NotificationSchedule[]>("/schedules/", {}, NOTIFICATION_BASE),
    create: (data: Partial<NotificationSchedule>) =>
      request<NotificationSchedule>("/schedules/", { method: "POST", body: JSON.stringify(data) }, NOTIFICATION_BASE),
    update: (id: number, data: Partial<NotificationSchedule>) =>
      request<NotificationSchedule>(`/schedules/${id}/`, { method: "PATCH", body: JSON.stringify(data) }, NOTIFICATION_BASE),
    delete: (id: number) =>
      request(`/schedules/${id}/`, { method: "DELETE" }, NOTIFICATION_BASE),
  },

  // Delivery Logs
  deliveryLogs: () =>
    request<DeliveryLog[]>("/delivery-logs/", {}, NOTIFICATION_BASE),

  // Audit Logs
  auditLogs: () =>
    request<NotificationAuditLog[]>("/audit-logs/", {}, NOTIFICATION_BASE),

  // Retry
  retry: (recipientId: number) =>
    request<{ success: boolean }>(`/retry/${recipientId}/`, { method: "POST" }, NOTIFICATION_BASE),
};