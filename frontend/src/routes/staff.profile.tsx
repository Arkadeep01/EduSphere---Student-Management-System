import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/staff/profile")({
  component: StaffProfile,
});

function StaffProfile() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff-profile"],
    queryFn: () => staffApi.profile(),
  });

  const [form, setForm] = useState<Record<string, string>>({});

  const updateMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => staffApi.updateProfile(d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-profile"] }),
  });

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading profile...</div>;

  const profile = data as Record<string, unknown> | undefined;
  if (!form.employee_id && profile) {
    setForm({
      employee_id: (profile.employee_id as string) || "",
      department: (profile.department as string) || "",
      phone: (profile.phone as string) || "",
    });
  }

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-2xl font-bold tracking-tight">Staff Profile</h2>
      <Card className="p-4 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{(profile?.email as string) || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Full Name</p>
          <p className="font-medium">{(profile?.full_name as string) || "-"}</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="employee_id">Employee ID</Label>
          <Input id="employee_id" value={form.employee_id || ""} onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="department">Department</Label>
          <Input id="department" value={form.department || ""} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Profile"}
        </Button>
        {updateMutation.isSuccess && <p className="text-green-600 text-sm">Profile updated!</p>}
      </Card>
    </div>
  );
}
