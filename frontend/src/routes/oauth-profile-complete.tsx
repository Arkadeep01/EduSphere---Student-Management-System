import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_BASE = "http://localhost:8000";

export const Route = createFileRoute("/oauth-profile-complete")({
  head: () => ({ meta: [{ title: "Complete Profile — EduSphere" }] }),
  component: OAuthProfileCompletePage,
});

function OAuthProfileCompletePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<{ id: number; name: string; code: string }[]>([]);

  const isTeacher = user?.role === "teacher";
  const isStaff = user?.role === "staff";

  const [form, setForm] = useState({
    mobile: "", gender: "", date_of_birth: "", address: "",
    department: "", designation: "", qualification: "", experience: "",
    primary_subject: "", secondary_subjects: [] as number[],
    employee_type: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", search: { error: undefined, actual_role: undefined, label: undefined } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isTeacher) {
      fetch(`${API_BASE}/api/admin/subjects/`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setSubjects(data);
          else if (data.results) setSubjects(data.results);
        })
        .catch(() => {});
    }
  }, [isTeacher]);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleSecondary = (id: number) => {
    setForm((f) => ({
      ...f,
      secondary_subjects: f.secondary_subjects.includes(id)
        ? f.secondary_subjects.filter((s) => s !== id)
        : [...f.secondary_subjects, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (body.primary_subject) body.primary_subject = parseInt(body.primary_subject as string);
      if (body.experience) body.experience = parseInt(body.experience as string);

      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/api/oauth/complete-profile/?token=${accessToken}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        toast.success("Profile completed! Welcome to EduSphere.");
        const redirectMap: Record<string, string> = {
          admin: "/admin/dashboard",
          teacher: "/teacher/dashboard",
          student: "/student/dashboard",
          staff: "/staff/dashboard",
        };
        navigate({ to: redirectMap[user?.role || "student"] || "/student/dashboard" });
      } else {
        toast.error(data.message || "Failed to complete profile.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center bg-gradient-brand p-12 text-white relative">
        <div className="absolute inset-0 bg-hero-glow opacity-30" />
        <div className="relative">
          <Logo invert />
          <h2 className="text-4xl font-bold mt-12">Almost there!</h2>
          <p className="text-white/80 mt-4 max-w-md">Complete your profile to get started.</p>
          <Sparkles className="h-10 w-10 mt-6 opacity-70" />
        </div>
      </div>
      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-lg border-0 shadow-elegant">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold">Complete your profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome{user ? `, ${user.first_name || user.email}` : ""}! Please fill in the missing details.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {!isStaff && (
                <div><Label>Mobile number</Label><Input type="tel" value={form.mobile} onChange={update("mobile")} required /></div>
              )}
              {!isTeacher && !isStaff && (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label>Gender</Label>
                      <select value={form.gender} onChange={update("gender")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div><Label>Date of birth</Label><Input type="date" value={form.date_of_birth} onChange={update("date_of_birth")} /></div>
                  </div>
                  <div><Label>Address</Label>
                    <textarea value={form.address} onChange={update("address")} rows={2}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                </>
              )}

              {isTeacher && (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label>Department</Label><Input value={form.department} onChange={update("department")} /></div>
                    <div><Label>Designation</Label><Input value={form.designation} onChange={update("designation")} /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label>Qualification</Label><Input value={form.qualification} onChange={update("qualification")} /></div>
                    <div><Label>Experience (years)</Label><Input type="number" value={form.experience} onChange={update("experience")} /></div>
                  </div>
                  <div><Label>Primary subject</Label>
                    <select value={form.primary_subject} onChange={update("primary_subject")} required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select primary subject</option>
                      {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                  <div><Label>Secondary subjects (optional)</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                      {subjects.filter((s) => s.id !== parseInt(form.primary_subject)).map((s) => (
                        <label key={s.id} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={form.secondary_subjects.includes(s.id)}
                            onChange={() => toggleSecondary(s.id)} className="h-4 w-4" />
                          {s.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {isStaff && (
                <><Label>Department</Label><Input value={form.department} onChange={update("department")} /></>
              )}

              <Button type="submit" className="w-full bg-gradient-brand border-0" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Complete profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
