import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/staff/upload-tasks")({
  component: StaffUploadTasks,
});

function StaffUploadTasks() {
  const { data, isLoading } = useQuery({
    queryKey: ["staff-upload-tasks"],
    queryFn: () => staffApi.uploadTasks(),
  });

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading upload tasks...</div>;

  const batches = (data ?? []) as Array<{
    batch_id: string; exam_name: string; subject_name: string;
    total: number; uploaded: number; verified: number; rejected: number;
  }>;

  if (batches.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Upload Tasks</h2>
        <p className="text-muted-foreground">No upload batches assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Upload Tasks</h2>
      <div className="grid gap-4">
        {batches.map((b) => (
          <Card key={b.batch_id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">{b.exam_name} - {b.subject_name}</p>
                <p className="text-xs text-muted-foreground">Batch: {b.batch_id}</p>
              </div>
              <Badge variant="outline">{b.total} scripts</Badge>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">Uploaded: <strong>{b.uploaded}</strong></span>
              <span className="text-green-600">Verified: <strong>{b.verified}</strong></span>
              <span className="text-red-600">Rejected: <strong>{b.rejected}</strong></span>
              <span className="text-muted-foreground">Pending: <strong>{b.total - b.uploaded - b.verified - b.rejected}</strong></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
