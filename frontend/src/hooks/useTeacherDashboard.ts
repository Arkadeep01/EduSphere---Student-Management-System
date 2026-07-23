import { useQuery } from "@tanstack/react-query";
import { request, API_BASE } from "@/services/request";

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ["teacher", "dashboard"],
    queryFn: () =>
      request<Record<string, unknown>>(
        "/dashboard/",
        undefined,
        `${API_BASE}/api/teacher`,
      ),
  });
}

export function useTeacherProfile() {
  return useQuery({
    queryKey: ["teacher", "profile"],
    queryFn: () =>
      request<Record<string, unknown>>(
        "/profile/",
        undefined,
        `${API_BASE}/api/teacher`,
      ),
  });
}

export function useTeacherClasses() {
  return useQuery({
    queryKey: ["teacher", "classes"],
    queryFn: () =>
      request<unknown[]>(
        "/classes/",
        undefined,
        `${API_BASE}/api/teacher`,
      ),
  });
}
