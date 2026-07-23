import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { LayoutDashboard, Upload, CheckCircle, XCircle, Layers } from "lucide-react";

export const Route = createFileRoute("/staff/dashboard")({
  component: StaffDashboard,
});

function StaffDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["staff-dashboard"],
    queryFn: () => staffApi.dashboard(),
  });

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading dashboard...</div>;

  const stats = [
    { label: "Pending Uploads", value: data?.pending_uploads ?? 0, icon: Upload, color: "text-amber-600" },
    { label: "Verified Scripts", value: data?.verified_scripts ?? 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Rejected Scripts", value: data?.rejected_scripts ?? 0, icon: XCircle, color: "text-red-600" },
    { label: "Total Batches", value: data?.total_batches ?? 0, icon: Layers, color: "text-blue-600" },
  ];

  const recent = (data?.recent_uploads as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Staff Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`rounded-full p-3 bg-muted ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Recent Uploads</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent uploads.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Student</th>
                <th className="pb-2 font-medium">Exam</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r: Record<string, unknown>) => (
                <tr key={r.id as string} className="border-b last:border-0">
                  <td className="py-2">{r.student_name as string}</td>
                  <td className="py-2">{r.exam_name as string} - {r.subject_name as string}</td>
                  <td className="py-2"><span className="capitalize">{r.upload_status as string}</span></td>
                  <td className="py-2">{r.uploaded_at ? new Date(r.uploaded_at as string).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
