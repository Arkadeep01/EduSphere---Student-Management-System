import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/brand/animations";
import { documentsList } from "@/lib/mock-data";
import { validateFile, generateMockUploadResponse, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_BYTES, formatFileSize, createAdmissionDocEntries } from "@/lib/upload";
import type { UploadedFileInfo } from "@/lib/upload";
import { addAdmissionApplication } from "@/lib/admission-store";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, Eye, X, Upload, CheckCircle, Image } from "lucide-react";

type DocumentEntry = {
  label: string;
  file: UploadedFileInfo | null;
};

export const Route = createFileRoute("/admissionForms")({
  head: () => ({
    meta: [
      { title: "Form — EduSphere" },
      { name: "description", content: "Explore 50+ courses across STEM, humanities, arts, and languages." },
    ],
  }),
  component: AdmissionForm,
});

function AdmissionForm() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUploadInfo, setPhotoUploadInfo] = useState<UploadedFileInfo | null>(null);
  const [documents, setDocuments] = useState<DocumentEntry[]>(
    documentsList.map(label => ({ label, file: null }))
  );
  const [previewDoc, setPreviewDoc] = useState<UploadedFileInfo | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    phoneNumber: "",
    address: "",
    guardianName: "",
    guardianRelationship: "",
    previousSchool: "",
    board: "",
    stream: "" as string,
  });

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error("Photo must be less than 10 MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoUploadInfo(generateMockUploadResponse(file, "applicant"));
    }
  }

  function handleDocChange(label: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_BYTES);
    if (error) {
      toast.error(error);
      e.target.value = "";
      return;
    }
    const uploadInfo = generateMockUploadResponse(file, "applicant");
    setDocuments(prev => prev.map(d =>
      d.label === label ? { ...d, file: uploadInfo } : d
    ));
    toast.success(`${label} uploaded`);
  }

  function handleRemoveDoc(label: string) {
    setDocuments(prev => prev.map(d =>
      d.label === label ? { ...d, file: null } : d
    ));
    if (fileInputRefs.current[label]) {
      fileInputRefs.current[label]!.value = "";
    }
  }

  function handleSubmitApplication() {
    if (!formData.name) { toast.error("Please enter your name"); return; }
    if (!formData.fatherName) { toast.error("Please enter father's name"); return; }
    if (!formData.motherName) { toast.error("Please enter mother's name"); return; }
    if (!formData.phoneNumber) { toast.error("Please enter phone number"); return; }
    if (!formData.stream) { toast.error("Please select a stream"); return; }
    const uploadedDocs = documents.filter(d => d.file !== null);
    if (!photoUploadInfo) {
      toast.error("Please upload a passport photo");
      return;
    }
    if (uploadedDocs.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }
    const docEntries = uploadedDocs.map(d => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: d.label,
      file: d.file,
      verified: false,
    }));
    addAdmissionApplication({
      id: `ADM_${Date.now()}`,
      name: formData.name,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      guardianName: formData.guardianName || formData.fatherName,
      guardianRelationship: formData.guardianRelationship || "Father",
      previousSchool: formData.previousSchool || "Not specified",
      board: formData.board || "CBSE",
      stream: formData.stream,
      marks: [],
      photoFile: photoUploadInfo,
      documents: docEntries,
      submittedAt: new Date().toISOString(),
      status: "pending",
    });
    toast.success(`Application submitted with ${uploadedDocs.length} document(s) and photo`);
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-hero-glow py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <FadeIn direction="up">
            <h1 className="text-4xl md:text-5xl font-bold">
              Admission Application Form
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.15}>
            <p className="mt-4 text-muted-foreground">
              Complete the admission application form and upload the required documents.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Admission Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-8">
            {/* Personal Details Card */}
            <FadeIn direction="up">
              <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-8">
                {/* Top Row: Fields + Photo (stacks on mobile, side-by-side on desktop) */}
                <div className="flex flex-col-reverse md:flex-row gap-6 items-center md:items-start">
                  {/* Personal Fields */}
                  <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full flex-1">
                    <StaggerItem>
                      <div className="space-y-2 text-left">
                        <Label>Name (Block Letters)</Label>
                        <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="space-y-2 text-left">
                        <Label>Father's Name</Label>
                        <Input value={formData.fatherName} onChange={e => setFormData(p => ({ ...p, fatherName: e.target.value }))} />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="space-y-2 text-left">
                        <Label>Mother's Name</Label>
                        <Input value={formData.motherName} onChange={e => setFormData(p => ({ ...p, motherName: e.target.value }))} />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="space-y-2 text-left">
                        <Label>Phone Number</Label>
                        <Input value={formData.phoneNumber} onChange={e => setFormData(p => ({ ...p, phoneNumber: e.target.value }))} />
                      </div>
                    </StaggerItem>
                  </StaggerContainer>

                  {/* Photo Upload */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-28 h-36 rounded-xl border-2 border-dashed border-primary/40 overflow-hidden hover:border-primary transition flex items-center justify-center bg-muted/30 cursor-pointer"
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Passport photo preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground text-center px-2 leading-snug">
                          Upload Photo
                        </span>
                      )}
                    </button>
                    <span className="text-[11px] text-muted-foreground text-center">
                      Passport Size
                    </span>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <div className="space-y-2 text-left">
                  <Label>Address</Label>
                  <Textarea rows={4} value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} />
                </div>

                <div className="space-y-2 text-left">
                  <Label>Local Guardian Name &amp; Address</Label>
                  <Textarea rows={3} value={formData.guardianName} onChange={e => setFormData(p => ({ ...p, guardianName: e.target.value }))} />
                </div>

                <div className="space-y-2 text-left">
                  <Label>Relationship With Guardian</Label>
                  <Input value={formData.guardianRelationship} onChange={e => setFormData(p => ({ ...p, guardianRelationship: e.target.value }))} />
                </div>

                <div className="space-y-2 text-left">
                  <Label>Previous School &amp; Board</Label>
                  <Input value={formData.previousSchool} onChange={e => setFormData(p => ({ ...p, previousSchool: e.target.value }))} placeholder="e.g. St. Mary's School, CBSE" />
                </div>

                {/* Stream Selection */}
                <div className="space-y-2 text-left">
                  <Label>Stream / Subject Combination</Label>
                  <StaggerContainer className="flex flex-wrap gap-4 sm:gap-8 pt-1">
                    {["Science", "Arts", "Commerce"].map((stream) => (
                      <StaggerItem key={stream}>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="radio" name="stream" value={stream} checked={formData.stream === stream} onChange={e => setFormData(p => ({ ...p, stream: e.target.value }))} />
                          {stream}
                        </label>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </div>
            </FadeIn>

            {/* Marks Table */}
            <FadeIn direction="up">
              <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b text-left">
                  <h2 className="font-semibold text-base">Previous Examination Marks</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Subject</th>
                        <th className="p-3 font-medium text-center">Pass Marks</th>
                        <th className="p-3 font-medium text-center">Marks Obtained</th>
                        <th className="p-3 font-medium text-center">Total Marks</th>
                        <th className="p-3 font-medium text-center">Division %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {["English", "Bengali", "Mathematics", "Science", "Social Science"].map((subject) => (
                        <tr key={subject} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium text-sm text-left">{subject}</td>
                          <td className="p-3"><Input className="h-8 text-sm text-center mx-auto max-w-[80px]" /></td>
                          <td className="p-3"><Input className="h-8 text-sm text-center mx-auto max-w-[80px]" /></td>
                          <td className="p-3"><Input className="h-8 text-sm text-center mx-auto max-w-[80px]" /></td>
                          <td className="p-3"><Input className="h-8 text-sm text-center mx-auto max-w-[80px]" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>

            {/* Documents Upload Section */}
            <FadeIn direction="up">
              <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-5">
                <h2 className="text-xl font-bold text-left">Upload Documents</h2>

                <div className="space-y-3 text-left">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-muted/20 px-4 py-3"
                    >
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {doc.label}
                      </span>
                      <div className="shrink-0 w-full sm:w-auto flex items-center gap-2">
                        {doc.file ? (
                          <>
                            <div className="flex items-center gap-1 text-xs text-success">
                              <CheckCircle className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">{doc.file.original_name}</span>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setPreviewDoc(doc.file)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => handleRemoveDoc(doc.label)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Input
                            ref={el => fileInputRefs.current[doc.label] = el}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="h-8 text-xs w-full sm:w-56 cursor-pointer bg-background"
                            onChange={e => handleDocChange(doc.label, e)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Submit Button */}
            <FadeIn direction="up" className="w-full text-center">
              <Button type="button" size="lg" onClick={handleSubmitApplication}>
                Submit Application
              </Button>
            </FadeIn>
          </div>
        </div>
      </section>

      <Dialog open={!!previewDoc} onOpenChange={o => { if (!o) setPreviewDoc(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{previewDoc?.original_name || "Preview"}</DialogTitle></DialogHeader>
          <div className="min-h-[300px] bg-muted/10 rounded-lg flex items-center justify-center">
            {previewDoc?.extension && [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(previewDoc.extension) ? (
              <img src={previewDoc.preview_url} alt={previewDoc.original_name} className="max-h-[400px] object-contain rounded" />
            ) : (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium mt-2">{previewDoc?.original_name}</p>
                {previewDoc && <p className="text-xs text-muted-foreground mt-1">{formatFileSize(previewDoc.size)}</p>}
                <p className="text-xs text-muted-foreground mt-1">Preview not available for this format</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDoc(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}