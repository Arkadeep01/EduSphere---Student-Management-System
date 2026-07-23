import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  uploaded: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  pending_upload: "bg-amber-100 text-amber-800",
  assigned: "bg-purple-100 text-purple-800",
  evaluation_completed: "bg-gray-100 text-gray-800",
};

export const Route = createFileRoute("/staff/history")({
  component: StaffHistory,
});

function StaffHistory() {
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["staff-history", statusFilter],
    queryFn: () => staffApi.uploadHistory(statusFilter || undefined),
  });

  const history = (data ?? []) as Array<{
    id: number; student_name: string; exam_name: string; subject_name: string;
    upload_status: string; evaluation_status: string; uploaded_at: string;
    marks_obtained: number | null; total_marks: number | null;
    script_number: string; batch_id: string;
  }>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Upload History</h2>
      <div className="flex gap-2 flex-wrap">
        {["", "uploaded", "verified", "rejected", "assigned", "evaluation_completed"].map((s) => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
            {s ? s.replace("_", " ") : "All"}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-muted-foreground">No upload history found.</p>
      ) : (
        <div className="grid gap-3">
          {history.map((h) => (
            <Card key={h.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{h.student_name}</p>
                <p className="text-sm text-muted-foreground">{h.exam_name} - {h.subject_name}</p>
                {h.script_number && <p className="text-xs text-muted-foreground">Script: {h.script_number}</p>}
                <p className="text-xs text-muted-foreground">{h.uploaded_at ? new Date(h.uploaded_at).toLocaleString() : "-"}</p>
              </div>
              <div className="text-right">
                <Badge className={statusColors[h.upload_status] || ""}>{h.upload_status.replace("_", " ")}</Badge>
                {h.marks_obtained != null && <p className="text-xs mt-1">Marks: {h.marks_obtained}/{h.total_marks}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
