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
import { useState, useRef } from "react";
import { getAdminDocuments, addAdminDocument, replaceAdminDocument, deleteAdminDocument } from "@/lib/admin-document-store";
import { validateFile, generateMockUploadResponse, ALLOWED_RESOURCE_TYPES, MAX_RESOURCE_SIZE_BYTES, formatFileSize } from "@/lib/upload";
import type { DocumentCategory, AdminDocument } from "@/lib/admin-document-store";
import { toast } from "sonner";
import { ExportDialog } from "@/components/export";
import { documentExportConfig } from "@/components/export/moduleConfigs";
import { LetterheadList } from "@/components/documents/LetterheadList";
import { LetterheadEditor } from "@/components/documents/LetterheadEditor";
import {
  getLetterheads, addLetterhead, updateLetterhead, setDefaultLetterhead,
  archiveLetterhead, restoreLetterhead, deleteLetterhead, restoreVersion,
} from "@/lib/letterhead-store";
import type { Letterhead, LetterheadFormData } from "@/types/letterhead";

const categoryLabels: Record<DocumentCategory, string> = {
  circular: "Circular",
  notice: "Notice",
  policy: "Policy",
  official: "Official Document",
};

const categoryBadge: Record<DocumentCategory, { variant: "default" | "secondary" | "outline" | "destructive", className: string }> = {
  circular: { variant: "default", className: "bg-info" },
  notice: { variant: "secondary", className: "" },
  policy: { variant: "default", className: "bg-warning" },
  official: { variant: "default", className: "bg-success" },
};

function DocumentPreview({ doc }: { doc: AdminDocument }) {
  const ext = doc.file.extension.toLowerCase();
  const isPDF = ext === ".pdf";
  const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
  const isOffice = [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"].includes(ext);
  const isZIP = ext === ".zip";

  function handleDownload() {
    window.open(doc.file.download_url, "_blank");
  }

  if (isPDF) {
    return (
      <iframe
        src={doc.file.download_url}
        className="w-full flex-1 rounded border"
        title={doc.title}
      />
    );
  }

  if (isImage) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-auto">
        <img
          src={doc.file.preview_url || doc.file.download_url}
          alt={doc.title}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <FileText className="h-16 w-16 text-muted-foreground/40" />
      <div>
        <p className="text-sm font-medium">{doc.file.original_name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatFileSize(doc.file.size)} {'\u00B7'} {isOffice ? "Office Document" : isZIP ? "ZIP Archive" : "Unknown Format"}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">Preview not available for this file type.</p>
      <Button size="sm" variant="outline" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />Download to View
      </Button>
    </div>
  );
}

function AdminDocumentsComponent() {
  const [docs, setDocs] = useState(getAdminDocuments);
  const [showExport, setShowExport] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showReplace, setShowReplace] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<AdminDocument | null>(null);
  const [letterheads, setLetterheads] = useState(getLetterheads);
  const [showLetterheadEditor, setShowLetterheadEditor] = useState(false);
  const [editingLetterhead, setEditingLetterhead] = useState<Letterhead | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>("circular");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const filtered = docs.filter(d =>
    (d.title.toLowerCase().includes(q.toLowerCase()) || d.file.original_name.toLowerCase().includes(q.toLowerCase()))
    && (categoryFilter === "all" || d.category === categoryFilter)
  );

  function resetUpload() {
    setUploadTitle("");
    setUploadCategory("circular");
    setUploadFile(null);
    setShowUpload(false);
  }

  function handleUpload() {
    if (!uploadTitle.trim()) { toast.error("Please enter a document title"); return; }
    if (!uploadFile) { toast.error("Please select a file"); return; }
    setUploading(true);
    const uploadInfo = generateMockUploadResponse(uploadFile, "admin");
    addAdminDocument({
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: uploadTitle.trim(),
      category: uploadCategory,
      file: uploadInfo,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Admin",
    });
    setDocs(getAdminDocuments());
    setUploading(false);
    resetUpload();
    toast.success("Document uploaded successfully");
  }

  function handleReplace(id: string) {
    if (!replaceFile) { toast.error("Please select a file"); return; }
    const uploadInfo = generateMockUploadResponse(replaceFile, "admin");
    replaceAdminDocument(id, uploadInfo);
    setDocs(getAdminDocuments());
    setShowReplace(null);
    setReplaceFile(null);
    toast.success("Document replaced");
  }

  function handleDelete(id: string) {
    deleteAdminDocument(id);
    setDocs(getAdminDocuments());
    toast.success("Document deleted");
  }

  function handleAddLetterhead() {
    setEditingLetterhead(null);
    setShowLetterheadEditor(true);
  }

  function handleEditLetterhead(lh: Letterhead) {
    setEditingLetterhead(lh);
    setShowLetterheadEditor(true);
  }

  function handleSaveLetterhead(data: LetterheadFormData) {
    if (editingLetterhead) {
      updateLetterhead(editingLetterhead.id, data, "Admin");
    } else {
      addLetterhead(data, "Admin");
    }
    setLetterheads(getLetterheads());
    toast.success(editingLetterhead ? "Letterhead updated" : "Letterhead created");
  }

  return (
    <>
      <div className="space-y-8">
        <LetterheadList
          letterheads={letterheads}
          onEdit={handleEditLetterhead}
          onSetDefault={(id) => { setDefaultLetterhead(id); setLetterheads(getLetterheads()); }}
          onArchive={(id) => { archiveLetterhead(id); setLetterheads(getLetterheads()); }}
          onRestore={(id) => { restoreLetterhead(id); setLetterheads(getLetterheads()); }}
          onDelete={(id) => { deleteLetterhead(id); setLetterheads(getLetterheads()); }}
          onAdd={handleAddLetterhead}
          onRestoreVersion={(lhId, verId) => { restoreVersion(lhId, verId); setLetterheads(getLetterheads()); }}
        />

        <LetterheadEditor
          open={showLetterheadEditor}
          onOpenChange={setShowLetterheadEditor}
          letterhead={editingLetterhead || undefined}
          onSave={handleSaveLetterhead}
        />

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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(categoryLabels).map(([k, v]) => (
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
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.title}</TableCell>
                  <TableCell>
                    <Badge variant={categoryBadge[d.category].variant} className={categoryBadge[d.category].className}>
                      {categoryLabels[d.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{d.file.original_name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatFileSize(d.file.size)}</TableCell>
                  <TableCell className="text-sm">{d.uploadedBy}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(d.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPreviewDoc(d)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(d.file.download_url, "_blank")}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowReplace(d.id)}>
                        <RefreshCw className="h-3.5 w-3.5" />
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
            <div className="space-y-2"><Label>Title</Label><Input placeholder="e.g. Summer Break Notice" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>Category</Label>
              <Select value={uploadCategory} onValueChange={v => setUploadCategory(v as DocumentCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([k, v]) => (
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
                  <p className="text-xs">{uploadFile.name} ({formatFileSize(uploadFile.size)})</p>
                ) : (
                  <p>Click to browse (PDF, DOCX, PPT, PPTX, Images)</p>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const error = validateFile(file, ALLOWED_RESOURCE_TYPES, MAX_RESOURCE_SIZE_BYTES);
                if (error) { toast.error(error); e.target.value = ""; return; }
                setUploadFile(file);
              }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetUpload}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" disabled={uploading || !uploadTitle.trim() || !uploadFile} onClick={handleUpload}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showReplace} onOpenChange={o => { if (!o) { setShowReplace(null); setReplaceFile(null); } }}>
        <DialogContent><DialogHeader><DialogTitle>Replace Document</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Upload a new file to replace the current version.</p>
            <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary" onClick={() => replaceFileInputRef.current?.click()}>
              <Upload className="h-6 w-6 mx-auto mb-2" />
              {replaceFile ? (
                <p className="text-xs">{replaceFile.name} ({formatFileSize(replaceFile.size)})</p>
              ) : (
                <p>Click to browse for replacement file</p>
              )}
            </div>
            <input ref={replaceFileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png" className="hidden" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const error = validateFile(file, ALLOWED_RESOURCE_TYPES, MAX_RESOURCE_SIZE_BYTES);
              if (error) { toast.error(error); e.target.value = ""; return; }
              setReplaceFile(file);
            }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowReplace(null); setReplaceFile(null); }}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" disabled={!replaceFile} onClick={() => showReplace && handleReplace(showReplace)}>Replace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={showExport} onOpenChange={setShowExport} config={documentExportConfig} />

      <Sheet open={!!previewDoc} onOpenChange={o => { if (!o) setPreviewDoc(null); }}>
        <SheetContent side="right" className="sm:max-w-2xl w-full flex flex-col">
          <SheetHeader>
            <SheetTitle>{previewDoc?.title}</SheetTitle>
            <SheetDescription>
              {previewDoc && (
                <span>{categoryLabels[previewDoc.category]} {'\u00B7'} {previewDoc.file.original_name}</span>
              )}
            </SheetDescription>
          </SheetHeader>
          {previewDoc && <DocumentPreview doc={previewDoc} />}
        </SheetContent>
      </Sheet>
      </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/admin/documents")({
  head: () => ({ meta: [{ title: "Document Repository — Admin" }] }),
  component: AdminDocumentsComponent,
});
