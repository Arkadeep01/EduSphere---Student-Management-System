import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { staffApi, subjectAdminApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/create-teacher")({
  component: StaffCreateTeacher,
});

function StaffCreateTeacher() {
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectAdminApi.list(),
  });

  const [form, setForm] = useState<Record<string, string>>({
    email: "", first_name: "", last_name: "", mobile: "",
    employee_id: "", date_of_birth: "", gender: "", phone: "",
    address: "", department: "", designation: "", personal_email: "",
    qualification: "", experience: "", primary_subject: "",
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => staffApi.createTeacher(d),
    onSuccess: (data) => {
      toast.success(`Teacher created: ${(data as Record<string, unknown>)?.email || ""}`);
      setForm({
        email: "", first_name: "", last_name: "", mobile: "",
        employee_id: "", date_of_birth: "", gender: "", phone: "",
        address: "", department: "", designation: "", personal_email: "",
        qualification: "", experience: "", primary_subject: "",
      });
    },
    onError: () => {
      toast.error("Failed to create teacher. Check the data and try again.");
    },
  });

  const handleSubmit = () => {
    if (!form.email) {
      toast.error("Email is required.");
      return;
    }
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v !== "") payload[k] = k === "primary_subject" ? Number(v) : v;
    }
    createMutation.mutate(payload);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const setSelect = (key: string) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight">Create Teacher</h2>
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={set("email")} placeholder="teacher@example.com" />
          </div>
          <div className="space-y-1">
            <Label>First Name</Label>
            <Input value={form.first_name} onChange={set("first_name")} />
          </div>
          <div className="space-y-1">
            <Label>Last Name</Label>
            <Input value={form.last_name} onChange={set("last_name")} />
          </div>
          <div className="space-y-1">
            <Label>Mobile</Label>
            <Input value={form.mobile} onChange={set("mobile")} />
          </div>
          <div className="space-y-1">
            <Label>Employee ID</Label>
            <Input value={form.employee_id} onChange={set("employee_id")} />
          </div>
          <div className="space-y-1">
            <Label>Date of Birth</Label>
            <Input type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
          </div>
          <div className="space-y-1">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={setSelect("gender")}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={set("phone")} />
          </div>
          <div className="space-y-1">
            <Label>Department</Label>
            <Select value={form.department} onValueChange={setSelect("department")}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Designation</Label>
            <Select value={form.designation} onValueChange={setSelect("designation")}>
              <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="senior_teacher">Senior Teacher</SelectItem>
                <SelectItem value="vp">Vice Principal</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Qualification</Label>
            <Input value={form.qualification} onChange={set("qualification")} />
          </div>
          <div className="space-y-1">
            <Label>Experience (years)</Label>
            <Input type="number" value={form.experience} onChange={set("experience")} />
          </div>
          <div className="space-y-1">
            <Label>Primary Subject</Label>
            <Select value={form.primary_subject} onValueChange={setSelect("primary_subject")}>
              <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {(subjects as Array<{id: number; name: string}> | undefined || []).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Input value={form.address} onChange={set("address")} />
          </div>
          <div className="space-y-1">
            <Label>Personal Email</Label>
            <Input type="email" value={form.personal_email} onChange={set("personal_email")} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-gradient-brand border-0"
          >
            {createMutation.isPending ? "Creating..." : "Create Teacher"}
          </Button>
          {createMutation.isSuccess && (
            <p className="text-green-600 text-sm self-center">
              Teacher created successfully!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
