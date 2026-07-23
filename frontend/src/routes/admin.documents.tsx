import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Download, RefreshCw, Trash2, Plus, Search, Eye } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { documentApi } from "@/services/adminApi";
import { ADMIN_API_BASE } from "@/services/request";
import { toast } from "sonner";
import { ExportDialog } from "@/components/export";
import { documentExportConfig } from "@/components/export/moduleConfigs";
import { LetterheadList } from "@/components/documents/LetterheadList";
import { LetterheadEditor } from "@/components/documents/LetterheadEditor";
import {
  getLetterheads, addLetterhead, updateLetterhead, setDefaultLetterhead,
  archiveLetterhead, restoreLetterhead, deleteLetterhead, restoreVersion, duplicateLetterhead,
} from "@/lib/letterhead-store";
import type { Letterhead, LetterheadFormData } from "@/types/letterhead";

interface DocItem {
  id: number;
  file: string;
  file_type: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_by: number | null;
  uploaded_at: string;
  related_model: string;
  related_id: number | null;
}

const fileTypeLabels: Record<string, string> = {
  student: "Student Document",
  teacher: "Teacher Document",
  admission: "Admission Document",
  answer_script: "Answer Script",
  resource: "Resource File",
  gallery: "Gallery Image",
  profile: "Profile Image",
  other: "Other",
};

const fileTypeBadge: Record<string, { variant: "default" | "secondary" | "outline"; className: string }> = {
  student: { variant: "default", className: "bg-info" },
  teacher: { variant: "secondary", className: "" },
  admission: { variant: "default", className: "bg-success" },
  answer_script: { variant: "default", className: "bg-warning" },
  resource: { variant: "outline", className: "" },
  gallery: { variant: "default", className: "" },
  profile: { variant: "secondary", className: "" },
  other: { variant: "outline", className: "" },
};

const ALLOWED_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function DocumentPreview({ doc }: { doc: DocItem }) {
  const ext = doc.original_filename?.split(".").pop()?.toLowerCase() || "";
  const url = `${ADMIN_API_BASE}${doc.file}`;
  const isPDF = ext === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  const isOffice = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext);

  if (isPDF) {
    return <iframe src={url} className="w-full flex-1 rounded border" title={doc.original_filename} />;
  }
  if (isImage) {
    return <div className="flex flex-1 items-center justify-center overflow-auto"><img src={url} alt={doc.original_filename} className="max-w-full max-h-full object-contain" /></div>;
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <FileText className="h-16 w-16 text-muted-foreground/40" />
      <div><p className="text-sm font-medium">{doc.original_filename}</p><p className="text-xs text-muted-foreground mt-1">{formatSize(doc.file_size)} · {isOffice ? "Office Document" : "Unknown Format"}</p></div>
      <p className="text-xs text-muted-foreground">Preview not available for this file type.</p>
      <Button size="sm" variant="outline" onClick={() => window.open(url, "_blank")}><Download className="mr-2 h-4 w-4" />Download to View</Button>
    </div>
  );
}

function AdminDocumentsComponent() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);
  const [letterheads, setLetterheads] = useState(getLetterheads);
  const [showLetterheadEditor, setShowLetterheadEditor] = useState(false);
  const [editingLetterhead, setEditingLetterhead] = useState<Letterhead | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileType, setUploadFileType] = useState("other");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const data = await documentApi.list();
      setDocs(data as DocItem[]);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useState(() => { fetchDocs(); });

  const filtered = docs.filter(d =>
    (d.original_filename?.toLowerCase().includes(q.toLowerCase()) || (fileTypeLabels[d.file_type] || d.file_type).toLowerCase().includes(q.toLowerCase()))
    && (typeFilter === "all" || d.file_type === typeFilter)
  );

  function resetUpload() {
    setUploadTitle("");
    setUploadFileType("other");
    setUploadFile(null);
    setShowUpload(false);
  }

  async function handleUpload() {
    if (!uploadFile) { toast.error("Please select a file"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("file_type", uploadFileType);
      await documentApi.upload(fd);
      toast.success("Document uploaded");
      resetUpload();
      fetchDocs();
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleDelete(id: number) {
    try { await documentApi.delete(id); toast.success("Document deleted"); fetchDocs(); } catch { toast.error("Delete failed"); }
  }

  function handleDuplicateLetterhead(id: string) {
    duplicateLetterhead(id);
    setLetterheads(getLetterheads());
  }

  const documentConnectionStatus: { label: string; status: "ready" | "pending" | "connected" }[] = [
    { label: "Student Reports", status: "ready" },
    { label: "Teacher Reports", status: "ready" },
    { label: "Attendance", status: "ready" },
    { label: "Result Sheet", status: "ready" },
    { label: "Merit List", status: "ready" },
    { label: "Fee Receipt", status: "ready" },
    { label: "Salary Slip", status: "ready" },
    { label: "Admissions", status: "ready" },
    { label: "Contact Forms", status: "ready" },
    { label: "Audit Logs", status: "ready" },
  ];

  const activeLetterheads = letterheads.filter(l => l.status === "active");
  const archivedLetterheads = letterheads.filter(l => l.status === "archived");

  function handleAddLetterhead() { setEditingLetterhead(null); setShowLetterheadEditor(true); }
  function handleEditLetterhead(lh: Letterhead) { setEditingLetterhead(lh); setShowLetterheadEditor(true); }
  function handleSaveLetterhead(data: LetterheadFormData) {
    if (editingLetterhead) { updateLetterhead(editingLetterhead.id, data, "Admin"); }
    else { addLetterhead(data, "Admin"); }
    setLetterheads(getLetterheads());
    toast.success(editingLetterhead ? "Letterhead updated" : "Letterhead created");
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading documents...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div><h3 className="text-lg font-semibold">Official Document Repository</h3></div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" />Export</Button>
                <Button size="sm" className="bg-gradient-brand border-0" onClick={() => setShowUpload(true)}>
                  <Plus className="mr-2 h-4 w-4" />Upload Document
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search documents..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44"><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.entries(fileTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card><CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No documents have been uploaded yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Related</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">{d.original_filename}</TableCell>
                        <TableCell>
                          <Badge variant={fileTypeBadge[d.file_type]?.variant || "outline"} className={fileTypeBadge[d.file_type]?.className || ""}>
                            {fileTypeLabels[d.file_type] || d.file_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatSize(d.file_size)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{d.related_model ? `${d.related_model}#${d.related_id}` : "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(d.uploaded_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPreviewDoc(d)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(`${ADMIN_API_BASE}${d.file}`, "_blank")}>
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(d.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent></Card>

            <Dialog open={showUpload} onOpenChange={o => { if (!o) resetUpload(); }}>
              <DialogContent><DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2"><Label>Document Type</Label>
                    <Select value={uploadFileType} onValueChange={setUploadFileType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(fileTypeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>File</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-6 w-6 mx-auto mb-2" />
                      {uploadFile ? (
                        <p className="text-xs">{uploadFile.name} ({formatSize(uploadFile.size)})</p>
                      ) : (
                        <p>Click to browse (PDF, DOCX, PPT, PPTX, Images)</p>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES} className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setUploadFile(file);
                    }} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetUpload}>Cancel</Button>
                  <Button className="bg-gradient-brand border-0" disabled={uploading || !uploadFile} onClick={handleUpload}>
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <ExportDialog open={showExport} onOpenChange={setShowExport} config={documentExportConfig} />

            <Sheet open={!!previewDoc} onOpenChange={o => { if (!o) setPreviewDoc(null); }}>
              <SheetContent side="right" className="sm:max-w-2xl w-full flex flex-col">
                <SheetHeader>
                  <SheetTitle>{previewDoc?.original_filename || "Document Preview"}</SheetTitle>
                  <SheetDescription>
                    {previewDoc && (
                      <span>{fileTypeLabels[previewDoc.file_type] || previewDoc.file_type} · {formatSize(previewDoc.file_size)}</span>
                    )}
                  </SheetDescription>
                </SheetHeader>
                {previewDoc && <DocumentPreview doc={previewDoc} />}
              </SheetContent>
            </Sheet>
          </div>

          <LetterheadList
            letterheads={letterheads}
            onEdit={handleEditLetterhead}
            onSetDefault={(id) => { setDefaultLetterhead(id); setLetterheads(getLetterheads()); }}
            onArchive={(id) => { archiveLetterhead(id); setLetterheads(getLetterheads()); }}
            onRestore={(id) => { restoreLetterhead(id); setLetterheads(getLetterheads()); }}
            onDelete={(id) => { deleteLetterhead(id); setLetterheads(getLetterheads()); }}
            onAdd={handleAddLetterhead}
            onRestoreVersion={(lhId, verId) => { restoreVersion(lhId, verId); setLetterheads(getLetterheads()); }}
            onDuplicate={handleDuplicateLetterhead}
            onReplaceLogo={() => toast.success("Logo replacement will update on next edit")}
            onReplaceLetterhead={() => toast.success("Letterhead banner replacement will update on next edit")}
            onDownload={() => toast.success("Download will be connected in Export pipeline")}
          />

          <LetterheadEditor
            open={showLetterheadEditor}
            onOpenChange={setShowLetterheadEditor}
            letterhead={editingLetterhead || undefined}
            onSave={handleSaveLetterhead}
          />
        </div>

        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-3">Document Connection Status</h4>
              <div className="space-y-2">
                {documentConnectionStatus.map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === "ready" ? "bg-success" : item.status === "pending" ? "bg-warning" : "bg-info"}`} />
                    <span className="flex-1">{item.label}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/admin/documents")({
  head: () => ({ meta: [{ title: "Document Repository — Admin" }] }),
  component: AdminDocumentsComponent,
});
