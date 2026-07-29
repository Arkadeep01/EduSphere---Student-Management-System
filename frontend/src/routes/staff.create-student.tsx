import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { staffApi } from "@/services/adminApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/create-student")({
  component: StaffCreateStudent,
});

function StaffCreateStudent() {
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["staff-classes"],
    queryFn: () => staffApi.classList(),
  });

  const [form, setForm] = useState<Record<string, string>>({
    email: "",
    first_name: "",
    last_name: "",
    mobile: "",
    father_name: "",
    mother_name: "",
    date_of_birth: "",
    class_assigned: "",
    section: "",
    address: "",
    gender: "",
    blood_group: "",
    roll_number: "",
    admission_number: "",
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => staffApi.createStudent(d),
    onSuccess: (data) => {
      toast.success(`Student created: ${(data as Record<string, unknown>)?.email || ""}`);
      setForm({
        email: "", first_name: "", last_name: "", mobile: "",
        father_name: "", mother_name: "", date_of_birth: "",
        class_assigned: "", section: "", address: "", gender: "",
        blood_group: "", roll_number: "", admission_number: "",
      });
    },
    onError: () => {
      toast.error("Failed to create student. Check the data and try again.");
    },
  });

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v !== "") payload[k] = v;
    }
    if (!payload.email) {
      toast.error("Email is required.");
      return;
    }
    createMutation.mutate(payload);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const setSelect = (key: string) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const classOptions = classes
    ? [...new Set(classes.map((c) => c.name))]
    : [];

  const sectionOptions = classes && form.class_assigned
    ? classes.filter((c) => c.name === form.class_assigned).map((c) => c.section).filter(Boolean)
    : [];

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight">Create Student</h2>
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={set("email")} placeholder="student@example.com" />
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
            <Label>Class</Label>
            <Select value={form.class_assigned} onValueChange={setSelect("class_assigned")}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {classesLoading ? (
                  <SelectItem value="__loading" disabled>Loading...</SelectItem>
                ) : (
                  classOptions.map((cn) => (
                    <SelectItem key={cn} value={cn}>{cn}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Section</Label>
            <Select value={form.section} onValueChange={setSelect("section")}>
              <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
              <SelectContent>
                {sectionOptions.length > 0 ? (
                  sectionOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))
                ) : (
                  ["A", "B", "C"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
            <Label>Date of Birth</Label>
            <Input type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
          </div>
          <div className="space-y-1">
            <Label>Father's Name</Label>
            <Input value={form.father_name} onChange={set("father_name")} />
          </div>
          <div className="space-y-1">
            <Label>Mother's Name</Label>
            <Input value={form.mother_name} onChange={set("mother_name")} />
          </div>
          <div className="space-y-1">
            <Label>Roll Number</Label>
            <Input value={form.roll_number} onChange={set("roll_number")} />
          </div>
          <div className="space-y-1">
            <Label>Admission Number</Label>
            <Input value={form.admission_number} onChange={set("admission_number")} />
          </div>
          <div className="space-y-1">
            <Label>Blood Group</Label>
            <Select value={form.blood_group} onValueChange={setSelect("blood_group")}>
              <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
              <SelectContent>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Input value={form.address} onChange={set("address")} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-gradient-brand border-0"
          >
            {createMutation.isPending ? "Creating..." : "Create Student"}
          </Button>
          {createMutation.isSuccess && (
            <p className="text-green-600 text-sm self-center">
              Student created successfully!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
