import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/staff/rejected")({
  component: StaffRejected,
});

function StaffRejected() {
  const { data, isLoading } = useQuery({
    queryKey: ["staff-rejected"],
    queryFn: () => staffApi.uploadHistory("rejected"),
  });

  const rejected = (data ?? []) as Array<{
    id: number; student_name: string; exam_name: string; subject_name: string;
    verification_notes: string; updated_at: string; batch_id: string;
    script_number: string; uploaded_at: string;
  }>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Rejected Uploads</h2>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : rejected.length === 0 ? (
        <p className="text-muted-foreground">No rejected uploads. All scripts are good!</p>
      ) : (
        <div className="grid gap-3">
          {rejected.map((r) => (
            <Card key={r.id} className="p-4 border-l-4 border-l-red-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{r.student_name}</p>
                  <p className="text-sm text-muted-foreground">{r.exam_name} - {r.subject_name}</p>
                  {r.script_number && <p className="text-xs text-muted-foreground">Script #: {r.script_number}</p>}
                  {r.batch_id && <p className="text-xs text-muted-foreground">Batch: {r.batch_id}</p>}
                </div>
                <Badge variant="destructive">Rejected</Badge>
              </div>
              {r.verification_notes && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <p className="font-medium text-xs text-muted-foreground">Rejection Reason:</p>
                  <p>{r.verification_notes}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Uploaded: {r.uploaded_at ? new Date(r.uploaded_at).toLocaleString() : "-"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
