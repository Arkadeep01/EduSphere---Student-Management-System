import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/staff/rejected")({
  component: StaffRejected,
});

function StaffRejected() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-rejected"],
    queryFn: () => staffApi.uploadHistory("rejected"),
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
        <p>Failed to load rejected uploads</p>
      </div>
    );
  }

  const rejected = (data ?? []) as Array<{
    id: number; student_name: string; exam_name: string; subject_name: string;
    verification_notes: string; updated_at: string; batch_id: string;
    script_number: string; uploaded_at: string;
  }>;

  if (rejected.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Rejected Uploads</h2>
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <CheckIcon className="h-10 w-10 text-green-500 opacity-60" />
            <p className="font-medium">No Rejected Uploads</p>
            <p className="text-sm">All scripts are verified and good.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Rejected Uploads</h2>
        <Badge variant="destructive">{rejected.length} rejected</Badge>
      </div>
      <div className="grid gap-3">
        {rejected.map((r) => (
          <Card key={r.id} className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="font-medium truncate">{r.student_name}</p>
                <p className="text-sm text-muted-foreground truncate">{r.exam_name} &middot; {r.subject_name}</p>
                {r.script_number && <p className="text-xs text-muted-foreground">Script: {r.script_number}</p>}
                {r.batch_id && <p className="text-xs text-muted-foreground font-mono">Batch: {r.batch_id}</p>}
              </div>
              <Badge variant="destructive" className="shrink-0"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
            </div>
            {r.verification_notes && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <p className="font-medium text-xs text-muted-foreground mb-1">Rejection Reason:</p>
                <p>{r.verification_notes}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Uploaded: {r.uploaded_at ? new Date(r.uploaded_at).toLocaleString() : "-"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}