import { useQuery } from "@tanstack/react-query";
import { request, API_BASE } from "@/services/request";

export function useAdminDashboardSummary() {
  return useQuery({
    queryKey: ["admin", "dashboard", "summary"],
    queryFn: () =>
      request<Record<string, unknown>>(
        "/dashboard/summary/",
        undefined,
        `${API_BASE}/api/admin`,
      ),
  });
}

export function useAdminDashboardStudentGrowth() {
  return useQuery({
    queryKey: ["admin", "dashboard", "student-growth"],
    queryFn: () =>
      request<unknown[]>(
        "/dashboard/student-growth/",
        undefined,
        `${API_BASE}/api/admin`,
      ),
  });
}

export function useAdminDashboardAttendance() {
  return useQuery({
    queryKey: ["admin", "dashboard", "attendance"],
    queryFn: () =>
      request<Record<string, unknown>>(
        "/dashboard/attendance/",
        undefined,
        `${API_BASE}/api/admin`,
      ),
  });
}

export function useAdminDashboardExamPerformance() {
  return useQuery({
    queryKey: ["admin", "dashboard", "exam-performance"],
    queryFn: () =>
      request<Record<string, unknown>>(
        "/dashboard/exam-performance/",
        undefined,
        `${API_BASE}/api/admin`,
      ),
  });
}
