import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

const API_BASE = "http://localhost:8000";

export const Route = createFileRoute("/director/staff-management")({
  head: () => ({ meta: [{ title: "Staff Management — Director" }] }),
  component: DirectorStaffManagement,
});

function DirectorStaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");

  const token = () => localStorage.getItem("accessToken");
  const headers = () => ({
    "Content-Type": "application/json",
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
  });

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/director/staff/`, { headers: headers() });
      const data = await res.json();
      setStaff(data);
    } catch {
      toast.error("Failed to load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/director/staff/create/`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email, first_name: firstName, department, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Staff created: ${data.email}`);
        setShowForm(false);
        setEmail(""); setFirstName(""); setDepartment(""); setPassword("");
        fetchStaff();
      } else {
        toast.error(data.email?.[0] || data.error || "Creation failed.");
      }
    } catch {
      toast.error("Failed to create staff.");
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/director/users/${userId}/toggle-active/`, {
        method: "POST",
        headers: headers(),
      });
      if (res.ok) {
        toast.success("Staff status toggled.");
        fetchStaff();
      }
    } catch {
      toast.error("Failed to toggle status.");
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Create and manage Staff accounts.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />New Staff
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-4 max-w-md">
              <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div><Label>First Name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
              <div><Label>Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></div>
              <Button type="submit">Create Staff</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Staff Members ({staff.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {staff.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{s.first_name || s.email}</p>
                  <p className="text-sm text-muted-foreground">{s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleToggleActive(s.id)}>
                    {s.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
            {staff.length === 0 && <p className="text-sm text-muted-foreground">No staff found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}