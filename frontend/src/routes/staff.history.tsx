import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  uploaded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  pending_upload: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  assigned: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  evaluation_completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
};

export const Route = createFileRoute("/staff/history")({
  component: StaffHistory,
});

function StaffHistory() {
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["staff-history", statusFilter],
    queryFn: () => staffApi.uploadHistory(statusFilter || undefined),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-destructive gap-2">
        <AlertCircle className="h-8 w-8" />
        <p>Failed to load upload history</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

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
            {s ? s.replace(/_/g, " ") : "All"}
          </Button>
        ))}
      </div>
      {history.length === 0 ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Clock className="h-10 w-10 opacity-40" />
            <p className="font-medium">No Upload History</p>
            <p className="text-sm">Upload history matching the current filter will appear here.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {history.map((h) => (
            <Card key={h.id} className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium truncate">{h.student_name}</p>
                <p className="text-sm text-muted-foreground truncate">{h.exam_name} &middot; {h.subject_name}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {h.script_number && <span>Script: {h.script_number}</span>}
                  {h.batch_id && <span className="font-mono">Batch: {h.batch_id}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{h.uploaded_at ? new Date(h.uploaded_at).toLocaleString() : "-"}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <Badge className={statusColors[h.upload_status] || ""}>{h.upload_status.replace(/_/g, " ")}</Badge>
                {h.marks_obtained != null && <p className="text-xs mt-1">Marks: {h.marks_obtained}/{h.total_marks}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}