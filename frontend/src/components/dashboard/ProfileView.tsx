import { PageWrapper } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Crop } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useState, useRef, useCallback, useEffect } from "react";

interface ProfileViewProps {
  role?: "student" | "teacher";
}

function displayValue(val: string | undefined | null): string {
  if (val === undefined || val === null || val.trim() === "" || val === "N/A") return "Not Assigned";
  return val;
}

const API_BASE = "http://localhost:8000";

function GitHubSection() {
  const token = localStorage.getItem("accessToken");
  const [status, setStatus] = useState<{ bound: boolean; github_username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/github/status/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const data = await r.json();
        setStatus(data);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleConnect = async () => {
    try {
      const r = await fetch(`${API_BASE}/api/github/connect/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { toast.error("Failed to initiate GitHub connection"); return; }
      const data = await r.json();
      window.location.href = `${API_BASE}${data.redirect_url}`;
    } catch {
      toast.error("Failed to connect GitHub account");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect your GitHub account?")) return;
    try {
      const r = await fetch(`${API_BASE}/api/github/disconnect/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { toast.error("Failed to disconnect"); return; }
      toast.success("GitHub account disconnected");
      setStatus({ bound: false, github_username: "" });
    } catch {
      toast.error("Failed to disconnect GitHub account");
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading GitHub status…</p>;
  }

  if (status?.bound) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <FaGithub className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Connected as {status.github_username}</p>
            <p className="text-xs text-muted-foreground">GitHub identity is linked to your account</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleConnect}>
            Change
          </Button>
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <FaGithub className="h-5 w-5" />
        <div>
          <p className="text-sm font-medium">Not connected</p>
          <p className="text-xs text-muted-foreground">Link your GitHub account for single sign-on</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleConnect}>
        Connect
      </Button>
    </div>
  );
}

export function ProfileView({ role }: ProfileViewProps) {
  const { user } = useAuth();
  const isStudent = role === "student";
  const isTeacher = role === "teacher";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropModal, setCropModal] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const cropImageRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [notifSettings, setNotifSettings] = useState({
    email: true,
    push: true,
    sms: false,
    timetable: true,
    fee: true,
    exam: true,
  });

  const token = localStorage.getItem("accessToken");
  const profileEndpoint = isStudent ? `${API_BASE}/api/student/profile/` : `${API_BASE}/api/teacher/profile/`;
  const { data: realProfile } = useQuery({
    queryKey: [role, "profile"],
    queryFn: async () => {
      const r = await fetch(profileEndpoint, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Failed to fetch profile");
      return r.json();
    },
    enabled: !!token,
  });

  const fullName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email ?? "User";

  const personal = {
    fullName,
    email: user?.email ?? "Not Assigned",
    phone: (realProfile?.phone as string) ?? "Not Assigned",
    dob: (realProfile?.date_of_birth as string) ?? "Not Assigned",
    gender: (realProfile?.gender as string) ?? "Not Assigned",
    bloodGroup: (realProfile?.blood_group as string) ?? "Not Assigned",
    address: (realProfile?.address as string) ?? "Not Assigned",
  };
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const academic = isStudent ? {
    class: (realProfile?.class_assigned as string) ?? "Not Assigned",
    section: (realProfile?.section as string) ?? "Not Assigned",
    rollNumber: (realProfile?.roll_number as string) ?? "Not Assigned",
    admissionNumber: (realProfile?.admission_number as string) ?? "Not Assigned",
    academicYear: (realProfile?.academic_year as string) ?? "Not Assigned",
    previousSchool: (realProfile?.previous_school as string) ?? "Not Assigned",
  } : null;

  const tabs = isTeacher
    ? ["personal", "qualifications", "experience", "classes", "documents", "security"]
    : ["personal", "academic", "parents", "documents", "notifications", "security"];

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5 MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImagePreview(dataUrl);
        setCropZoom(1);
        setCropX(0);
        setCropY(0);
        setCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropX, y: e.clientY - cropY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropX(e.clientX - dragStart.x);
    setCropY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveImage = () => {
    if (imagePreview && selectedFile) {
      setProfileImage(imagePreview);
      setCropModal(false);
      setImagePreview(null);
      setSelectedFile(null);
      toast.success("Profile image saved");
    }
  };

  const handleChangeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setCropModal(false);
    fileInputRef.current?.click();
  };

  return (
    <PageWrapper>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      <Card className="mb-4"><CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative group">
          <Avatar className="h-20 w-20">
            {profileImage ? (
              <AvatarImage src={profileImage} alt="Profile" />
            ) : imagePreview ? (
              <AvatarImage src={imagePreview} alt="Preview" />
            ) : null}
            <AvatarFallback className="bg-gradient-brand text-white text-2xl">{initials}</AvatarFallback>
          </Avatar>
          {!imagePreview ? (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors" onClick={handleImageClick}>
              <Camera className="h-3 w-3 text-white" />
            </div>
          ) : null}
          {imagePreview && !cropModal && (
            <div className="absolute -bottom-8 left-0 flex gap-1">
              <Button size="sm" variant="default" className="h-6 text-[10px] px-2" onClick={handleSaveImage}>Save</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={handleChangeImage}>Change</Button>
            </div>
          )}
        </div>
        <div className={imagePreview ? "pb-8" : ""}>
          <h2 className="text-2xl font-bold">{personal.fullName}</h2>
          <p className="text-muted-foreground">{personal.email}</p>
          <div className="flex gap-2 mt-1">
            <p className="text-sm text-primary capitalize">{user?.role}</p>
            {isTeacher && <Badge variant="secondary" className="text-xs">{personal.fullName}</Badge>}
            {isStudent && <Badge variant="secondary" className="text-xs">{academic?.class} · Roll {academic?.rollNumber}</Badge>}
          </div>
        </div>
      </CardContent></Card>
      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap gap-2">
          {tabs.map(t => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}
        </TabsList>

        {/* Personal Tab - shared */}
        <TabsContent value="personal"><Card><CardContent className="p-6 grid sm:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2"><Label>Full name</Label><Input defaultValue={displayValue(personal.fullName)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input defaultValue={displayValue(personal.email)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input defaultValue={displayValue(personal.phone)} /></div>
          <div className="space-y-2"><Label>Date of Birth</Label><Input defaultValue={displayValue(personal.dob)} /></div>
          <div className="space-y-2"><Label>Gender</Label><Input defaultValue={displayValue(personal.gender)} /></div>
          <div className="space-y-2"><Label>Address</Label><Input defaultValue={displayValue(personal.address)} /></div>
          {isStudent && <div className="space-y-2"><Label>Username</Label><Input defaultValue={displayValue(user?.email)} /></div>}
          <div className="sm:col-span-2"><Button onClick={() => toast.success("Profile updated")} className="bg-gradient-brand border-0">Save</Button></div>
        </CardContent></Card></TabsContent>

        {/* Academic Tab - student only */}
        {isStudent && <TabsContent value="academic"><Card><CardContent className="p-6 grid sm:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2"><Label>Roll Number</Label><Input defaultValue={displayValue(academic?.rollNumber)} readOnly className="bg-muted/50" /></div>
          <div className="space-y-2"><Label>Admission Number</Label><Input defaultValue={displayValue(academic?.admissionNumber)} readOnly className="bg-muted/50" /></div>
          <div className="space-y-2"><Label>Class</Label><Input defaultValue={displayValue(academic?.class)} readOnly className="bg-muted/50" /></div>
          <div className="space-y-2"><Label>Section</Label><Input defaultValue={displayValue(academic?.section)} readOnly className="bg-muted/50" /></div>
          <div className="space-y-2"><Label>Academic Year</Label><Input defaultValue={displayValue(academic?.academicYear)} readOnly className="bg-muted/50" /></div>
          <div className="space-y-2"><Label>Previous School</Label><Input defaultValue={displayValue(academic?.previousSchool)} readOnly className="bg-muted/50" /></div>
        </CardContent></Card></TabsContent>}

        {/* Parents Tab - student only */}
        {isStudent && <TabsContent value="parents"><Card><CardContent className="p-6 max-w-2xl">
          <p className="text-sm text-muted-foreground text-center py-8">No parent information available.</p>
        </CardContent></Card></TabsContent>}

        {/* Qualifications Tab - teacher only */}
        {isTeacher && <TabsContent value="qualifications"><Card><CardContent className="p-6 max-w-2xl space-y-4">
          <p className="text-sm text-muted-foreground text-center py-8">No qualifications added yet.</p>
          <Button variant="outline" className="mt-2">Add Qualification</Button>
        </CardContent></Card></TabsContent>}

        {/* Experience Tab - teacher only */}
        {isTeacher && <TabsContent value="experience"><Card><CardContent className="p-6 max-w-2xl space-y-4">
          <p className="text-sm text-muted-foreground text-center py-8">No experience added yet.</p>
          <Button variant="outline" className="mt-2">Add Experience</Button>
        </CardContent></Card></TabsContent>}

        {/* Classes Tab - teacher only */}
        {isTeacher && <TabsContent value="classes"><Card><CardContent className="p-6 max-w-2xl">
          <p className="text-sm text-muted-foreground text-center py-8">No class assignments yet.</p>
        </CardContent></Card></TabsContent>}

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card><CardContent className="p-6 max-w-2xl space-y-4">
            <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet.</p>
            <Button variant="outline">Upload document</Button>
          </CardContent></Card>
        </TabsContent>

        {/* Notifications Tab - student only */}
        {isStudent && <TabsContent value="notifications"><Card><CardContent className="p-6 max-w-2xl space-y-4">
          {[
            { key: "timetable" as const, label: "Timetable Notifications", desc: "Receive updates on timetable changes" },
            { key: "fee" as const, label: "Fee Notifications", desc: "Receive alerts for fee payments and reminders" },
            { key: "exam" as const, label: "Exam Notifications", desc: "Receive exam schedule and result updates" },
            { key: "email" as const, label: "Email Notifications", desc: "Receive email alerts for assignments and exams" },
            { key: "push" as const, label: "Push Notifications", desc: "Receive push notifications for fee reminders" },
            { key: "sms" as const, label: "SMS Alerts", desc: "Receive SMS for urgent updates" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch
                checked={notifSettings[item.key]}
                onCheckedChange={(checked) => setNotifSettings(prev => ({ ...prev, [item.key]: checked }))}
              />
            </div>
          ))}
        </CardContent></Card></TabsContent>}

        {/* Security Tab */}
        <TabsContent value="security"><Card><CardContent className="p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-sm font-semibold mb-3">Change Password</h3>
            <div className="space-y-3">
              <div className="space-y-2"><Label>Current password</Label><Input type="password" /></div>
              <div className="space-y-2"><Label>New password</Label><Input type="password" /></div>
              <div className="space-y-2"><Label>Confirm new password</Label><Input type="password" /></div>
              <Button onClick={() => toast.success("Password changed")} className="bg-gradient-brand border-0">Change password</Button>
            </div>
          </div>
          <hr />
          <div>
            <h3 className="text-sm font-semibold mb-3">GitHub Identity</h3>
            <GitHubSection />
          </div>
        </CardContent></Card></TabsContent>
      </Tabs>

      <Dialog open={cropModal} onOpenChange={o => { if (!o) { setCropModal(false); setImagePreview(null); setSelectedFile(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Crop Profile Photo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div
              ref={cropImageRef}
              className="relative w-48 h-48 mx-auto rounded-full overflow-hidden cursor-move bg-muted"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  className="absolute pointer-events-none"
                  style={{
                    width: `${cropZoom * 100}%`,
                    height: `${cropZoom * 100}%`,
                    maxWidth: "none",
                    left: `${cropX}px`,
                    top: `${cropY}px`,
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
            <div className="flex items-center gap-3 px-2">
              <span className="text-xs text-muted-foreground">Zoom</span>
              <input
                type="range"
                min="1"
                max="2"
                step="0.05"
                value={cropZoom}
                onChange={e => setCropZoom(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">{Math.round(cropZoom * 100)}%</span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setCropModal(false); setImagePreview(null); setSelectedFile(null); }}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleSaveImage}>
              <Crop className="h-4 w-4 mr-2" />Crop & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
