import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper, StaggerContainer, StaggerItem, HoverLift } from "@/components/brand/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Video, Download, Search, File, Upload, Trash2, Edit, Users } from "lucide-react";
import { teacherSubjectData, teacherProfileData, type ChapterResource } from "@/lib/mock-data";
import { teacherResourceApi } from "@/services/teacherApi";
import { addSharedResource, updateSharedResource, removeSharedResource } from "@/lib/resource-store";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".mp4", ".zip"];
const MAX_SIZE_MB = 100;

const resourceIcons: Record<string, typeof FileText> = {
  note: FileText,
  video: Video,
  document: File,
  reference: FileText,
};

function formatSize(bytes: number | undefined): string {
  if (bytes === undefined || bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function TeacherResourcesComponent() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [resources, setResources] = useState<ChapterResource[]>(() =>
    teacherSubjectData.chapters?.flatMap(ch => ch.resources ?? []) ?? []
  );
  const [showUpload, setShowUpload] = useState(false);
  const [editResource, setEditResource] = useState<ChapterResource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", resourceType: "", targetClass: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const allTypes = ["note", "video", "document", "reference"];
  const types = ["all", ...allTypes];

  useEffect(() => {
    teacherResourceApi.list().then(data => {
      if (data && data.length > 0) {
        setResources(data.map((r: any) => ({
          id: r.id.toString(),
          title: r.title,
          type: r.resource_type as ChapterResource["type"],
          size: formatSize(r.file_size),
          description: r.description,
          fileSize: r.file_size,
          downloadCount: r.download_count,
          uploadedAt: r.uploaded_at,
          fileUrl: r.file,
        })));
      }
    }).catch(() => {});
  }, []);

  const filtered = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`File type "${ext}" not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      e.target.value = "";
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_SIZE_MB} MB limit.`);
      e.target.value = "";
      return;
    }
    const duplicate = resources.some(r => r.title === form.title && r.fileUrl);
    if (duplicate) {
      toast.warning(`A resource with title "${form.title}" already exists.`);
    }
    setSelectedFile(f);
  }

  async function handleUpload() {
    if (!form.title || !form.resourceType || !selectedFile) {
      toast.error("Title, type, and file are required");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("resource_type", form.resourceType);
    fd.append("target_class", form.targetClass);
    fd.append("file", selectedFile);
    const newId = String(Date.now());
    const newResource: ChapterResource = {
      id: newId,
      title: form.title,
      type: form.resourceType as ChapterResource["type"],
      size: formatSize(selectedFile.size),
      description: form.description,
      fileSize: selectedFile.size,
      downloadCount: 0,
      uploadedAt: new Date().toISOString(),
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
    };
    addSharedResource({
      ...newResource,
      assignedClasses: form.targetClass ? [form.targetClass] : [],
      uploadedBy: teacherProfileData?.personal?.fullName || teacherSubjectData.teacher,
      subject: teacherSubjectData.name,
    });
    try {
      const result = await teacherResourceApi.create(fd);
      if (result) {
        setResources(prev => [{
          id: (result as any).id.toString(),
          title: (result as any).title,
          type: (result as any).resource_type as ChapterResource["type"],
          size: formatSize((result as any).file_size),
          description: (result as any).description,
          fileSize: (result as any).file_size,
          downloadCount: (result as any).download_count,
          uploadedAt: (result as any).uploaded_at,
          fileUrl: (result as any).file,
        }, ...prev]);
        toast.success("Resource uploaded successfully");
      } else {
        setResources(prev => [newResource, ...prev]);
        toast.success("Resource uploaded (offline mode)");
      }
    } catch {
      setResources(prev => [newResource, ...prev]);
      toast.success("Resource uploaded (offline mode)");
    }
    setUploading(false);
    setShowUpload(false);
    resetForm();
  }

  async function handleUpdate() {
    if (!editResource || !form.title || !form.resourceType) {
      toast.error("Title and type are required");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("resource_type", form.resourceType);
    fd.append("target_class", form.targetClass);
    if (selectedFile) {
      const ext = "." + selectedFile.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`File type "${ext}" not allowed.`);
        setUploading(false);
        return;
      }
      if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`File exceeds ${MAX_SIZE_MB} MB limit.`);
        setUploading(false);
        return;
      }
      fd.append("file", selectedFile);
    }
    const updatedMeta: Partial<ChapterResource> = {
      title: form.title,
      description: form.description,
      type: form.resourceType as ChapterResource["type"],
    };
    if (selectedFile) {
      updatedMeta.size = formatSize(selectedFile.size);
      updatedMeta.fileSize = selectedFile.size;
      updatedMeta.fileUrl = URL.createObjectURL(selectedFile);
      updatedMeta.uploadedAt = new Date().toISOString();
    }
    updateSharedResource(editResource.id, {
      ...updatedMeta,
      assignedClasses: form.targetClass ? [form.targetClass] : undefined,
    });
    try {
      const result = await teacherResourceApi.update(editResource.id, fd);
      if (result) {
        setResources(prev => prev.map(r =>
          r.id === editResource.id ? {
            id: (result as any).id.toString(),
            title: (result as any).title,
            type: (result as any).resource_type as ChapterResource["type"],
            size: formatSize((result as any).file_size),
            description: (result as any).description,
            fileSize: (result as any).file_size,
            downloadCount: (result as any).download_count,
            uploadedAt: (result as any).uploaded_at,
            fileUrl: (result as any).file,
          } : r
        ));
        toast.success("Resource updated");
      } else {
        setResources(prev => prev.map(r =>
          r.id === editResource.id ? { ...r, ...updatedMeta } : r
        ));
        toast.success("Resource updated (offline mode)");
      }
    } catch {
      setResources(prev => prev.map(r =>
        r.id === editResource.id ? { ...r, ...updatedMeta } : r
      ));
      toast.success("Resource updated (offline mode)");
    }
    setUploading(false);
    setEditResource(null);
    resetForm();
  }

  async function handleDelete(r: ChapterResource) {
    removeSharedResource(r.id);
    try {
      await teacherResourceApi.delete(r.id);
      setResources(prev => prev.filter(x => x.id !== r.id));
      toast.success("Resource deleted");
    } catch {
      setResources(prev => prev.filter(x => x.id !== r.id));
      toast.success("Resource deleted (offline mode)");
    }
  }

  function openEdit(r: ChapterResource) {
    setEditResource(r);
    const shared = (r as any).assignedClasses;
    setForm({
      title: r.title,
      description: r.description || "",
      resourceType: r.type,
      targetClass: Array.isArray(shared) && shared.length > 0 ? shared[0] : "",
    });
    setSelectedFile(null);
  }

  function resetForm() {
    setForm({ title: "", description: "", resourceType: "", targetClass: "" });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <PageWrapper>
      <Card className="mb-4"><CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1">
            {types.map(t => (
              <Button key={t} size="sm" variant={typeFilter === t ? "default" : "outline"} onClick={() => setTypeFilter(t)} className="capitalize text-xs">{t}</Button>
            ))}
          </div>
          <Button size="sm" className="ml-auto bg-gradient-brand border-0" onClick={() => { resetForm(); setShowUpload(true); }}>
            <Upload className="h-4 w-4 mr-1" />Upload
          </Button>
        </div>
      </CardContent></Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Resources ({resources.length})</TabsTrigger>
          {allTypes.map(type => (
            <TabsTrigger key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}s ({resources.filter(r => r.type === type).length})</TabsTrigger>
          ))}
        </TabsList>

        {["all", ...allTypes].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(tab === "all" ? filtered : filtered.filter(r => r.type === tab)).map(r => {
                const Icon = resourceIcons[r.type] || FileText;
                const shared = r as any;
                return (
                  <StaggerItem key={r.id}>
                    <HoverLift>
                      <Card className="">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(r)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(r)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-semibold mt-3 text-sm">{r.title}</h3>
                          {r.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                              <Badge variant="secondary" className="capitalize text-[10px]">{r.type}</Badge>
                              <span>{r.size}</span>
                              {r.uploadedAt && <span>{formatDate(r.uploadedAt)}</span>}
                              {r.downloadCount !== undefined && <span>{r.downloadCount} downloads</span>}
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                              <a href={r.fileUrl || "#"} download={r.title} onClick={e => { if (!r.fileUrl) { e.preventDefault(); toast.success(`Downloading ${r.title}`); } }}>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-muted-foreground border-t pt-2">
                            {shared.uploadedBy && <span>By: {shared.uploadedBy}</span>}
                            {shared.assignedClasses && shared.assignedClasses.length > 0 ? (
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{shared.assignedClasses.join(", ")}</span>
                            ) : (
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" />All Classes</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </HoverLift>
                  </StaggerItem>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                  No resources found. Click "Upload" to add one.
                </div>
              )}
            </StaggerContainer>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={showUpload} onOpenChange={o => { if (!o) { setShowUpload(false); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload Resource</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Algebra Notes Chapter 1" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." className="min-h-[60px]" /></div>
            <div className="space-y-2"><Label>Type *</Label>
              <Select value={form.resourceType} onValueChange={v => setForm({ ...form, resourceType: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Target Class</Label>
              <Select value={form.targetClass} onValueChange={v => setForm({ ...form, targetClass: v })}>
                <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                <SelectContent>
                  {teacherSubjectData.classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>File * (max {MAX_SIZE_MB} MB: {ALLOWED_EXTENSIONS.join(", ")})</Label>
              <Input ref={fileInputRef} type="file" accept={ALLOWED_EXTENSIONS.join(",")} onChange={handleFileSelect} />
              {selectedFile && <p className="text-xs text-muted-foreground mt-1">{selectedFile.name} ({formatSize(selectedFile.size)})</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUpload(false); resetForm(); }}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editResource} onOpenChange={o => { if (!o) { setEditResource(null); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Resource</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="min-h-[60px]" /></div>
            <div className="space-y-2"><Label>Type *</Label>
              <Select value={form.resourceType} onValueChange={v => setForm({ ...form, resourceType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Target Class</Label>
              <Select value={form.targetClass} onValueChange={v => setForm({ ...form, targetClass: v })}>
                <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                <SelectContent>
                  {teacherSubjectData.classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Replace file (optional)</Label>
              <Input ref={fileInputRef} type="file" accept={ALLOWED_EXTENSIONS.join(",")} onChange={handleFileSelect} />
              {selectedFile && <p className="text-xs text-muted-foreground mt-1">{selectedFile.name} ({formatSize(selectedFile.size)})</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditResource(null); resetForm(); }}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleUpdate} disabled={uploading}>
              {uploading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

export const Route = createFileRoute("/teacher/resources")({
  head: () => ({ meta: [{ title: "Resources — Teacher" }] }),
  component: TeacherResourcesComponent,
});
