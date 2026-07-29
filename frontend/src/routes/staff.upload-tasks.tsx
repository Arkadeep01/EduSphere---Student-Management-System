import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Loader2, AlertCircle, Upload, CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/staff/upload-tasks")({
  component: StaffUploadTasks,
});

function StaffUploadTasks() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-upload-tasks"],
    queryFn: () => staffApi.uploadTasks(),
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
        <p>Failed to load upload tasks</p>
      </div>
    );
  }

  const batches = (data ?? []) as Array<{
    batch_id: string; exam_name: string; subject_name: string;
    total: number; uploaded: number; verified: number; rejected: number;
  }>;

  if (batches.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Upload Tasks</h2>
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Layers className="h-10 w-10 opacity-40" />
            <p className="font-medium">No Upload Batches</p>
            <p className="text-sm text-center max-w-md">Upload tasks will appear here once answer script batches are created by administrators.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Upload Tasks</h2>
        <Badge variant="outline">{batches.length} batch{batches.length !== 1 ? "es" : ""}</Badge>
      </div>
      <div className="grid gap-4">
        {batches.map((b) => {
          const pending = b.total - b.uploaded - b.verified - b.rejected;
          const progress = b.total > 0 ? Math.round(((b.uploaded + b.verified + b.rejected) / b.total) * 100) : 0;
          return (
            <Card key={b.batch_id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{b.exam_name} &middot; {b.subject_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">Batch: {b.batch_id}</p>
                </div>
                <Badge variant="outline">{b.total} scripts</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-brand h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex gap-4 text-sm flex-wrap">
                <span className="flex items-center gap-1"><Upload className="h-3 w-3 text-amber-600" />Uploaded: <strong>{b.uploaded}</strong></span>
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-600" />Verified: <strong>{b.verified}</strong></span>
                {b.rejected > 0 && <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-600" />Rejected: <strong>{b.rejected}</strong></span>}
                <span className="text-muted-foreground">Pending: <strong>{Math.max(pending, 0)}</strong></span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}