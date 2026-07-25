import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/upload")({
  component: StaffUpload,
});

function StaffUpload() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [scriptId, setScriptId] = useState<number | null>(null);

  const { data: pendingScripts, isLoading, isError } = useQuery({
    queryKey: ["staff-pending-uploads"],
    queryFn: () => staffApi.uploadHistory("pending_upload"),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => staffApi.uploadScript(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-pending-uploads"] });
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
      setFile(null);
      setScriptId(null);
      toast.success("Script uploaded successfully");
    },
    onError: () => {
      toast.error("Upload failed. Please try again.");
    },
  });

  const handleUpload = () => {
    if (!scriptId || !file) { toast.error("Select a script and file"); return; }
    const fd = new FormData();
    fd.append("script_id", String(scriptId));
    fd.append("script_file", file);
    uploadMutation.mutate(fd);
  };

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
        <p>Failed to load pending scripts</p>
        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["staff-pending-uploads"] })}>Retry</Button>
      </div>
    );
  }

  const scripts = (pendingScripts ?? []) as Array<{
    id: number; student_name: string; student_email: string;
    exam_name: string; subject_name: string;
    section: string; roll_number: string;
  }>;

  if (scripts.length === 0 && !uploadMutation.isSuccess) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Upload Scripts</h2>
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Upload className="h-10 w-10 opacity-40" />
            <p className="font-medium">No Pending Uploads</p>
            <p className="text-sm text-center max-w-md">All scripts have been uploaded. Check the Upload Tasks page for batch processing status.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Upload Scripts</h2>

      {uploadMutation.isSuccess && (
        <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">Upload successful!</p>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Select a script to upload
        </h3>
        {scripts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No pending scripts ready for upload.</p>
        ) : (
          <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
            {scripts.map((s) => (
              <label key={s.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted transition-colors">
                <input
                  type="radio"
                  name="script"
                  value={s.id}
                  checked={scriptId === s.id}
                  onChange={() => setScriptId(s.id)}
                  className="accent-brand"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.student_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.exam_name} &middot; {s.subject_name}
                    {s.roll_number ? ` | Roll: ${s.roll_number}` : ""}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="script-file">Script File (PDF)</Label>
          <Input id="script-file" type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {file && <p className="text-xs text-muted-foreground">Selected: {file.name}</p>}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Button onClick={handleUpload} disabled={!scriptId || !file || uploadMutation.isPending} className="bg-gradient-brand border-0">
            {uploadMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />Upload Script</>
            )}
          </Button>
          {scriptId && file && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Script #{scriptId}</Badge>
              <Badge variant="outline">{file.name}</Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}