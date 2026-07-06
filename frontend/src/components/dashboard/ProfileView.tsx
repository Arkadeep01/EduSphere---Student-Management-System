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
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { studentProfileData, teacherProfileData, teacherSubjectData } from "@/lib/mock-data";
import { generateMockUploadResponse } from "@/lib/upload";
import type { UploadedFileInfo } from "@/lib/upload";
import { Camera, Download, BookOpen, GraduationCap, Briefcase, FileText, Crop, Check, X } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

interface ProfileViewProps {
  role?: "student" | "teacher";
}

function displayValue(val: string | undefined | null): string {
  if (val === undefined || val === null || val.trim() === "" || val === "N/A") return "NULL";
  return val;
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
  const [profileUploadInfo, setProfileUploadInfo] = useState<UploadedFileInfo | null>(null);
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    push: true,
    sms: false,
    timetable: true,
    fee: true,
    exam: true,
  });

  const personal = isStudent ? studentProfileData.personal : teacherProfileData.personal;
  const initials = personal.fullName ? personal.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const academic = isStudent ? studentProfileData.academic : null;
  const parents = isStudent ? studentProfileData.parents : null;

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
      const mock = generateMockUploadResponse(selectedFile, "current_user");
      setProfileUploadInfo(mock);
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
            {isTeacher && <Badge variant="secondary" className="text-xs">{teacherSubjectData.name} · {teacherSubjectData.code}</Badge>}
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
          <div className="space-y-2"><Label>Date of Birth</Label><Input defaultValue={displayValue(personal.dateOfBirth)} /></div>
          <div className="space-y-2"><Label>Gender</Label><Input defaultValue={displayValue(personal.gender)} /></div>
          <div className="space-y-2"><Label>Address</Label><Input defaultValue={displayValue(personal.address)} /></div>
          {isStudent && <div className="space-y-2"><Label>Username</Label><Input defaultValue={displayValue(studentProfileData.personal.username)} /></div>}
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
        {isStudent && <TabsContent value="parents"><Card><CardContent className="p-6 grid sm:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2"><Label>Father's Name</Label><Input defaultValue={displayValue(parents?.fatherName)} /></div>
          <div className="space-y-2"><Label>Father's Occupation</Label><Input defaultValue={displayValue(parents?.fatherOccupation)} /></div>
          <div className="space-y-2"><Label>Father's Phone</Label><Input defaultValue={displayValue(parents?.fatherPhone)} /></div>
          <div className="sm:col-span-2" />
          <div className="space-y-2"><Label>Mother's Name</Label><Input defaultValue={displayValue(parents?.motherName)} /></div>
          <div className="space-y-2"><Label>Mother's Occupation</Label><Input defaultValue={displayValue(parents?.motherOccupation)} /></div>
          <div className="space-y-2"><Label>Mother's Phone</Label><Input defaultValue={displayValue(parents?.motherPhone)} /></div>
          <div className="sm:col-span-2" />
          <div className="space-y-2"><Label>Guardian Name</Label><Input defaultValue={displayValue(parents?.guardianName)} /></div>
          <div className="space-y-2"><Label>Guardian Relation</Label><Input defaultValue={displayValue(parents?.guardianRelation)} /></div>
          <div className="space-y-2"><Label>Guardian Phone</Label><Input defaultValue={displayValue(parents?.guardianPhone)} /></div>
          <div className="sm:col-span-2"><Button onClick={() => toast.success("Parent info updated")} className="bg-gradient-brand border-0">Save</Button></div>
        </CardContent></Card></TabsContent>}

        {/* Qualifications Tab - teacher only */}
        {isTeacher && <TabsContent value="qualifications"><Card><CardContent className="p-6 max-w-2xl space-y-4">
          {teacherProfileData.qualifications.map((q, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">{q.degree}</p>
                <p className="text-sm text-muted-foreground">{q.institution} · {q.year}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" className="mt-2">Add Qualification</Button>
        </CardContent></Card></TabsContent>}

        {/* Experience Tab - teacher only */}
        {isTeacher && <TabsContent value="experience"><Card><CardContent className="p-6 max-w-2xl space-y-4">
          {teacherProfileData.experience.map((e, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <Briefcase className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">{e.position}</p>
                <p className="text-sm text-muted-foreground">{e.institution} · {e.from} – {e.to}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" className="mt-2">Add Experience</Button>
        </CardContent></Card></TabsContent>}

        {/* Classes Tab - teacher only */}
        {isTeacher && <TabsContent value="classes"><Card><CardContent className="p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{teacherSubjectData.name} ({teacherSubjectData.code})</p>
              <p className="text-sm text-muted-foreground">{teacherSubjectData.totalStudents} students across {teacherSubjectData.classes.length} classes</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {teacherSubjectData.classes.map(cls => (
              <div key={cls} className="p-3 border rounded-lg text-center">
                <p className="font-semibold">{cls}</p>
                <p className="text-xs text-muted-foreground">{teacherSubjectData.name}</p>
              </div>
            ))}
          </div>
        </CardContent></Card></TabsContent>}

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card><CardContent className="p-6 max-w-2xl space-y-4">
            {isTeacher ? (
              teacherProfileData.documents.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{d.name}</span></div>
                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{d.uploaded}</span><Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button></div>
                </div>
              ))
            ) : (
              <>
                {studentProfileData.documents.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{d.name}</span></div>
                    <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{d.uploaded}</span><Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button></div>
                  </div>
                ))}
              </>
            )}
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
        <TabsContent value="security"><Card><CardContent className="p-6 space-y-4 max-w-2xl">
          <div className="space-y-2"><Label>Current password</Label><Input type="password" /></div>
          <div className="space-y-2"><Label>New password</Label><Input type="password" /></div>
          <div className="space-y-2"><Label>Confirm new password</Label><Input type="password" /></div>
          <Button onClick={() => toast.success("Password changed")} className="bg-gradient-brand border-0">Change password</Button>
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
