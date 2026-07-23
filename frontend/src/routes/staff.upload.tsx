import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/staff/upload")({
  component: StaffUpload,
});

function StaffUpload() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [scriptId, setScriptId] = useState<number | null>(null);

  const { data: pendingScripts, isLoading } = useQuery({
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
    },
  });

  const handleUpload = () => {
    if (!scriptId || !file) return;
    const fd = new FormData();
    fd.append("script_id", String(scriptId));
    fd.append("script_file", file);
    uploadMutation.mutate(fd);
  };

  const scripts = (pendingScripts ?? []) as Array<{
    id: number; student_name: string; student_email: string;
    exam_name: string; subject_name: string;
    section: string; roll_number: string;
  }>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Upload Scripts</h2>
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Select a script to upload</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : scripts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending scripts ready for upload.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {scripts.map((s) => (
              <label key={s.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  name="script"
                  value={s.id}
                  onChange={() => setScriptId(s.id)}
                  className="accent-brand"
                />
                <div>
                  <p className="text-sm font-medium">{s.student_name} ({s.student_email})</p>
                  <p className="text-xs text-muted-foreground">{s.exam_name} - {s.subject_name} {s.roll_number ? `| Roll: ${s.roll_number}` : ""}</p>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="script-file">Script File</Label>
          <Input id="script-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <Button className="mt-4" onClick={handleUpload} disabled={!scriptId || !file || uploadMutation.isPending}>
          {uploadMutation.isPending ? "Uploading..." : "Upload Script"}
        </Button>
        {uploadMutation.isSuccess && <p className="text-green-600 text-sm mt-2">Upload successful!</p>}
        {uploadMutation.isError && <p className="text-red-600 text-sm mt-2">Upload failed. Please try again.</p>}
      </Card>
    </div>
  );
}
