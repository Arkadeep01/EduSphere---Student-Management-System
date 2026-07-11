import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DEFAULT_BRANDING } from "@/types/letterhead";
import type { Letterhead, LetterheadFormData, BrandingConfig } from "@/types/letterhead";
import { LetterheadPreview } from "./LetterheadPreview";

interface LetterheadEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letterhead?: Letterhead;
  onSave: (data: LetterheadFormData) => void;
}

const defaultForm: LetterheadFormData = {
  name: "",
  branding: { ...DEFAULT_BRANDING },
  logoUrl: "",
  letterheadImageUrl: "",
  footerText: "This is a computer-generated document. No signature is required.",
  watermarkText: "",
  headerSpacing: 4,
  footerSpacing: 4,
  leftMargin: 15,
  rightMargin: 15,
  primaryColor: "#1e3a5f",
  secondaryColor: "#475569",
  signaturePlaceholder: "Authorized Signatory",
  schoolSealPlaceholder: "School Seal",
};

export function LetterheadEditor({ open, onOpenChange, letterhead, onSave }: LetterheadEditorProps) {
  const currentVer = letterhead ? letterhead.versions.find(v => v.versionNumber === letterhead.currentVersion) : null;
  const [form, setForm] = useState<LetterheadFormData>(() => {
    if (currentVer) {
      return {
        name: currentVer.letterheadName,
        branding: { ...currentVer.branding },
        logoUrl: currentVer.logoUrl,
        letterheadImageUrl: currentVer.letterheadImageUrl,
        footerText: currentVer.footerText,
        watermarkText: currentVer.watermarkText,
        headerSpacing: currentVer.headerSpacing,
        footerSpacing: currentVer.footerSpacing,
        leftMargin: currentVer.leftMargin,
        rightMargin: currentVer.rightMargin,
        primaryColor: currentVer.primaryColor,
        secondaryColor: currentVer.secondaryColor,
        signaturePlaceholder: currentVer.signaturePlaceholder,
        schoolSealPlaceholder: currentVer.schoolSealPlaceholder,
      };
    }
    return { ...defaultForm };
  });
  const [activeTab, setActiveTab] = useState("basic");

  function update<K extends keyof LetterheadFormData>(key: K, value: LetterheadFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function updateBranding<K extends keyof BrandingConfig>(key: K, value: BrandingConfig[K]) {
    setForm(prev => ({ ...prev, branding: { ...prev.branding, [key]: value } }));
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Letterhead name is required");
      return;
    }
    onSave(form);
    onOpenChange(false);
  }

  function handleLogoUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/svg+xml,image/jpeg";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { toast.error("Logo must be under 5 MB"); return; }
      const url = URL.createObjectURL(file);
      update("logoUrl", url);
    };
    input.click();
  }

  function handleBannerUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { toast.error("Banner must be under 10 MB"); return; }
      const url = URL.createObjectURL(file);
      update("letterheadImageUrl", url);
    };
    input.click();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(90vw,1600px)] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{letterhead ? `Edit: ${letterhead.name}` : "New Letterhead"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-5 space-y-4 overflow-y-auto pr-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
                <TabsTrigger value="branding" className="flex-1">Branding</TabsTrigger>
                <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>Letterhead Name</Label>
                  <Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Official Letterhead" />
                </div>
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input value={form.branding.schoolName} onChange={e => updateBranding("schoolName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Short Name</Label>
                  <Input value={form.branding.shortName} onChange={e => updateBranding("shortName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Motto</Label>
                  <Input value={form.branding.motto} onChange={e => updateBranding("motto", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={form.branding.address} onChange={e => updateBranding("address", e.target.value)} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.branding.phone} onChange={e => updateBranding("phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={form.branding.email} onChange={e => updateBranding("email", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={form.branding.website} onChange={e => updateBranding("website", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Textarea value={form.footerText} onChange={e => update("footerText", e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Watermark Text</Label>
                  <Input value={form.watermarkText} onChange={e => update("watermarkText", e.target.value)} />
                </div>
              </TabsContent>

              <TabsContent value="branding" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-3">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Logo" className="w-16 h-16 object-contain border rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 border">No Logo</div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleLogoUpload}>{form.logoUrl ? "Replace" : "Upload"}</Button>
                      {form.logoUrl && <Button size="sm" variant="outline" onClick={() => update("logoUrl", "")}>Remove</Button>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, SVG, JPG. Max 5 MB.</p>
                </div>
                <div className="space-y-2">
                  <Label>Letterhead Banner</Label>
                  <div className="flex items-center gap-3">
                    {form.letterheadImageUrl ? (
                      <img src={form.letterheadImageUrl} alt="Banner" className="h-16 object-contain border rounded" />
                    ) : (
                      <div className="h-16 w-32 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 border">No Banner</div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleBannerUpload}>{form.letterheadImageUrl ? "Replace" : "Upload"}</Button>
                      {form.letterheadImageUrl && <Button size="sm" variant="outline" onClick={() => update("letterheadImageUrl", "")}>Remove</Button>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG. Max 10 MB.</p>
                </div>
                <div className="space-y-2">
                  <Label>Board Affiliation</Label>
                  <Input value={form.branding.boardAffiliation} onChange={e => updateBranding("boardAffiliation", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Recognition Number</Label>
                  <Input value={form.branding.recognitionNumber} onChange={e => updateBranding("recognitionNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Principal Name</Label>
                  <Input value={form.branding.principalName} onChange={e => updateBranding("principalName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Academic Session</Label>
                  <Input value={form.branding.academicSession} onChange={e => updateBranding("academicSession", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Document Watermark</Label>
                  <Input value={form.branding.documentWatermark} onChange={e => updateBranding("documentWatermark", e.target.value)} />
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.primaryColor} onChange={e => update("primaryColor", e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                    <span className="text-xs font-mono">{form.primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.secondaryColor} onChange={e => update("secondaryColor", e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                    <span className="text-xs font-mono">{form.secondaryColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Header Spacing ({form.headerSpacing}mm)</Label>
                  <input type="range" min="0" max="20" value={form.headerSpacing} onChange={e => update("headerSpacing", Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label>Footer Spacing ({form.footerSpacing}mm)</Label>
                  <input type="range" min="0" max="20" value={form.footerSpacing} onChange={e => update("footerSpacing", Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label>Left Margin ({form.leftMargin}mm)</Label>
                  <input type="range" min="5" max="30" value={form.leftMargin} onChange={e => update("leftMargin", Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label>Right Margin ({form.rightMargin}mm)</Label>
                  <input type="range" min="5" max="30" value={form.rightMargin} onChange={e => update("rightMargin", Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label>Signature Placeholder</Label>
                  <Input value={form.signaturePlaceholder} onChange={e => update("signaturePlaceholder", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>School Seal Placeholder</Label>
                  <Input value={form.schoolSealPlaceholder} onChange={e => update("schoolSealPlaceholder", e.target.value)} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-7 border rounded-lg overflow-hidden bg-white flex flex-col min-h-0">
            <div className="p-3 bg-muted text-xs font-medium text-muted-foreground border-b">Live Preview</div>
            <div className="flex-1 overflow-y-auto p-3 flex items-start justify-center">
              <LetterheadPreview formData={form} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-gradient-brand border-0" onClick={handleSave}>
            {letterhead ? `Save as Version ${(letterhead?.currentVersion || 0) + 1}` : "Create Letterhead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
