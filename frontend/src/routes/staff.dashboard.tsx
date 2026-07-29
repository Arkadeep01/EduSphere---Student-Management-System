import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { request } from "@/services/request";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Upload, CheckCircle, XCircle, Layers, Loader2, AlertCircle } from "lucide-react";

interface BatchSummary {
  batch_id: string;
  exam_name: string;
  subject_name: string;
  total: number;
  uploaded: number;
  verified: number;
  rejected: number;
  created_at: string;
}

export const Route = createFileRoute("/staff/dashboard")({
  component: StaffDashboard,
});

function StaffDashboard() {
  const { data: dashData, isLoading: dashLoading, isError: dashError } = useQuery({
    queryKey: ["staff-dashboard"],
    queryFn: () => staffApi.dashboard(),
  });

  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ["staff-batches"],
    queryFn: () => request<BatchSummary[]>("/exams/staff-batches/"),
  });

  if (dashLoading || batchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-destructive gap-2">
        <AlertCircle className="h-8 w-8" />
        <p>Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = [
    { label: "Pending Uploads", value: (dashData as any)?.pending_uploads ?? 0, icon: Upload, color: "text-amber-600" },
    { label: "Verified Scripts", value: (dashData as any)?.verified_scripts ?? 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Rejected Scripts", value: (dashData as any)?.rejected_scripts ?? 0, icon: XCircle, color: "text-red-600" },
    { label: "Total Batches", value: (dashData as any)?.total_batches ?? (batches ?? []).length, icon: Layers, color: "text-blue-600" },
  ];

  const recent = ((dashData as any)?.recent_uploads as Array<Record<string, unknown>>) ?? [];
  const batchList = batches ?? [];

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
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <Upload className="h-8 w-8 opacity-40" />
            <p className="text-sm">No recent uploads</p>
          </div>
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
                  <td className="py-2"><Badge variant="outline" className="capitalize">{(r.upload_status as string)?.replace("_", " ")}</Badge></td>
                  <td className="py-2">{r.uploaded_at ? new Date(r.uploaded_at as string).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Layers className="h-4 w-4" /> Active Batches</h3>
        {batchList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <Layers className="h-8 w-8 opacity-40" />
            <p className="text-sm">No active batches</p>
            <p className="text-xs">Upload answer scripts to create processing batches.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {batchList.slice(0, 5).map((b) => (
              <div key={b.batch_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{b.exam_name} &middot; {b.subject_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{b.batch_id}</p>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <span className="flex items-center gap-1"><Upload className="h-3 w-3 text-amber-600" />{b.uploaded}</span>
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-600" />{b.verified}</span>
                  {b.rejected > 0 && <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-600" />{b.rejected}</span>}
                </div>
              </div>
            ))}
            {batchList.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">+{batchList.length - 5} more batches</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}