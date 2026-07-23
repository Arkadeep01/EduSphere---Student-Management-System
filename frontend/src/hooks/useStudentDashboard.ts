import { useQuery } from "@tanstack/react-query";
import { studentDashboardApi, studentSubjectApi } from "@/services/studentApi";
import type { Subject } from "@/services/studentApi";

interface DashboardData {
  totalSubjects: number;
  pendingAssignments: number;
  subjects: Subject[];
  profile: Record<string, unknown> | null;
}

export function useStudentDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["student", "dashboard"],
    queryFn: async () => {
      const data = await studentDashboardApi.get();
      return data as unknown as DashboardData;
    },
  });
}

export function useMySubjects() {
  return useQuery({
    queryKey: ["student", "my-subjects"],
    queryFn: () => studentSubjectApi.mySubjects(),
  });
}

export function useAllSubjects() {
  return useQuery({
    queryKey: ["student", "subjects"],
    queryFn: () => studentSubjectApi.listAll(),
  });
}
