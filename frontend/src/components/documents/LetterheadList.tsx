import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Edit, Eye, Trash2, Archive, RotateCcw, Plus, Copy, Download, ZoomIn, ZoomOut, Maximize, Minimize, Printer, X,
} from "lucide-react";
import { toast } from "sonner";
import type { Letterhead, LetterheadVersion, LetterheadFormData } from "@/types/letterhead";
import { BaseLetterHead } from "./BaseLetterHead";

interface LetterheadListProps {
  letterheads: Letterhead[];
  onEdit: (lh: Letterhead) => void;
  onSetDefault: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onRestoreVersion: (letterheadId: string, versionId: string) => void;
  onDuplicate: (id: string) => void;
  onReplaceLogo: (id: string) => void;
  onReplaceLetterhead: (id: string) => void;
  onDownload: (id: string) => void;
}

const PREVIEW_ZOOM = 0.4;

export function LetterheadList({
  letterheads,
  onEdit,
  onSetDefault,
  onArchive,
  onRestore,
  onDelete,
  onAdd,
  onRestoreVersion,
  onDuplicate,
  onDownload,
}: LetterheadListProps) {
  const [previewLh, setPreviewLh] = useState<Letterhead | null>(null);
  const [previewVersion, setPreviewVersion] = useState<LetterheadVersion | null>(null);
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<"width" | "page">("page");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState<string | null>(null);

  const active = letterheads.filter(l => l.status === "active");
  const archived = letterheads.filter(l => l.status === "archived");

  function getVersionData(lh: Letterhead, ver: LetterheadVersion): LetterheadFormData {
    return {
      name: ver.letterheadName,
      branding: ver.branding,
      logoUrl: ver.logoUrl,
      letterheadImageUrl: ver.letterheadImageUrl,
      footerText: ver.footerText,
      watermarkText: ver.watermarkText,
      headerSpacing: ver.headerSpacing,
      footerSpacing: ver.footerSpacing,
      leftMargin: ver.leftMargin,
      rightMargin: ver.rightMargin,
      primaryColor: ver.primaryColor,
      secondaryColor: ver.secondaryColor,
      signaturePlaceholder: ver.signaturePlaceholder,
      schoolSealPlaceholder: ver.schoolSealPlaceholder,
    };
  }

  function openFullPreview(lh: Letterhead) {
    setPreviewLh(lh);
    setPreviewVersion(null);
    setZoom(100);
    setFitMode("page");
  }

  function getCurrentVer(lh: Letterhead | null): LetterheadVersion | undefined {
    if (!lh) return undefined;
    return lh.versions.find(v => v.versionNumber === (previewVersion ? previewVersion.versionNumber : lh.currentVersion))
      || lh.versions.find(v => v.versionNumber === lh.currentVersion);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Institution Letterheads</h3>
          <p className="text-sm text-muted-foreground">{active.length} active · {archived.length} archived</p>
        </div>
        <Button size="sm" className="bg-gradient-brand border-0" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />New Letterhead
        </Button>
      </div>

      {active.length === 0 ? (
        <Card><CardContent className="text-center py-8 text-muted-foreground">
          <p>No active letterheads. Create one to get started.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map(lh => {
            const ver = lh.versions.find(v => v.versionNumber === lh.currentVersion);
            if (!ver) return null;
            const fd = getVersionData(lh, ver);
            return (
              <Card key={lh.id} className="overflow-hidden flex flex-col">
                <div className="relative bg-white border-b overflow-hidden" style={{ height: 140 }}>
                  <div
                    className="absolute inset-0"
                    style={{ transform: `scale(${PREVIEW_ZOOM})`, transformOrigin: "top left", width: `${100 / PREVIEW_ZOOM}%` }}
                  >
                    <div style={{ height: "45%", overflow: "hidden" }}>
                      <BaseLetterHead
                        title="Sample Document"
                        generatedBy="Preview"
                        generatedDate={new Date().toLocaleDateString()}
                        generatedTime=""
                        academicSession={fd.branding.academicSession}
                        moduleName="Preview"
                        totalRecords={0}
                        pageOrientation="portrait"
                        branding={fd.branding}
                        primaryColor={fd.primaryColor}
                        logoUrl={fd.logoUrl}
                        showSignature={false}
                        showMeta={false}
                      >
                        <div className="p-2" />
                      </BaseLetterHead>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-1.5 right-1.5 h-7 w-7 p-0 shadow-sm"
                    onClick={() => openFullPreview(lh)}
                    title="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  {lh.isDefault && (
                    <Badge variant="default" className="absolute bottom-1.5 left-1.5 bg-brand text-[10px] h-4 px-1.5">Default</Badge>
                  )}
                </div>
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm leading-tight truncate">{lh.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{ver.branding.schoolName}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px] h-4">v{lh.currentVersion}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{ver.branding.academicSession}</span>
                    <span>{new Date(lh.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 pt-1.5 border-t">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Edit" onClick={() => onEdit(lh)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Duplicate" onClick={() => { onDuplicate(lh.id); toast.success("Letterhead duplicated"); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Download" onClick={() => onDownload(lh.id)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    {!lh.isDefault && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Set as default" onClick={() => { onSetDefault(lh.id); toast.success(`${lh.name} set as default`); }}>
                        <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal">Set Default</Badge>
                      </Button>
                    )}
                    <div className="flex-1" />
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" title="Archive" onClick={() => setDeleteConfirm(lh.id)}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {archived.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Archived Letterheads</h4>
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-2 font-medium">Name</th>
                  <th className="p-2 font-medium">School</th>
                  <th className="p-2 font-medium">Updated</th>
                  <th className="p-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {archived.map(lh => (
                  <tr key={lh.id} className="border-b last:border-0">
                    <td className="p-2 font-medium">{lh.name}</td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {lh.versions.find(v => v.versionNumber === lh.currentVersion)?.branding.schoolName || "-"}
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{new Date(lh.updatedAt).toLocaleDateString()}</td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { onRestore(lh.id); toast.success("Letterhead restored"); }}>
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => { onDelete(lh.id); toast.success("Letterhead deleted"); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </div>
      )}

      {/* Full preview modal */}
      <Dialog open={!!previewLh} onOpenChange={o => { if (!o) { setPreviewLh(null); setPreviewVersion(null); } }}>
        <DialogContent size="full" className="sm:!max-w-[min(90vw,1800px)] max-h-[92vh] h-full overflow-hidden flex flex-col !p-0">
          <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
            <DialogTitle className="text-sm font-semibold">{previewLh?.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getCurrentVer(previewLh)?.branding.academicSession}
              </Badge>
              <div className="h-4 w-px bg-border" />
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setZoom(z => Math.max(25, z - 10))}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-mono w-10 text-center font-medium">{zoom}%</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setZoom(z => Math.min(300, z + 10))}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button size="sm" variant={fitMode === "width" ? "default" : "outline"} className="h-7 text-xs gap-1" onClick={() => setFitMode("width")}>
                <Maximize className="h-3 w-3" />Width
              </Button>
              <Button size="sm" variant={fitMode === "page" ? "default" : "outline"} className="h-7 text-xs gap-1" onClick={() => setFitMode("page")}>
                <Minimize className="h-3 w-3" />Page
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onDownload(previewLh?.id || "")}>
                <Download className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => window.print()}>
                <Printer className="h-3 w-3" />
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setPreviewLh(null); setPreviewVersion(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-6">
            {previewLh && (() => {
              const ver = getCurrentVer(previewLh);
              if (!ver) return null;
              return (
                <div
                  className="shadow-xl bg-white"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                    maxWidth: fitMode === "width" ? "100%" : undefined,
                  }}
                >
                  <BaseLetterHead
                    title="Official Letterhead"
                    generatedBy="Administrator"
                    generatedDate={new Date().toLocaleDateString()}
                    generatedTime={new Date().toLocaleTimeString()}
                    academicSession={ver.branding.academicSession}
                    moduleName="Preview"
                    totalRecords={0}
                    pageOrientation="portrait"
                    branding={ver.branding}
                    primaryColor={ver.primaryColor}
                    logoUrl={ver.logoUrl}
                  >
                    <div className="p-4 text-sm space-y-3">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="font-semibold mb-2">Sample Document Content</p>
                        <p>This is a demonstration of the official letterhead layout for {previewLh?.name}. The letterhead displays the school branding, logo, header with contact information, footer, and signature section.</p>
                      </div>
                      <table className="w-full border-collapse border border-gray-300 text-xs mt-4">
                        <thead>
                          <tr className="text-white" style={{ backgroundColor: ver.primaryColor }}>
                            <th className="border border-gray-300 p-2 text-left">#</th>
                            <th className="border border-gray-300 p-2 text-left">Student</th>
                            <th className="border border-gray-300 p-2 text-left">Class</th>
                            <th className="border border-gray-300 p-2 text-left">Roll No</th>
                            <th className="border border-gray-300 p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { id: 1, name: "Alice Johnson", cls: "10-A", roll: "1001", status: "Active" },
                            { id: 2, name: "Bob Smith", cls: "10-A", roll: "1002", status: "Active" },
                            { id: 3, name: "Carol Davis", cls: "10-B", roll: "1003", status: "Active" },
                          ].map((row, i) => (
                            <tr key={row.id} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                              <td className="border border-gray-300 p-2">{row.id}</td>
                              <td className="border border-gray-300 p-2">{row.name}</td>
                              <td className="border border-gray-300 p-2">{row.cls}</td>
                              <td className="border border-gray-300 p-2">{row.roll}</td>
                              <td className="border border-gray-300 p-2"><span className="text-green-600">{row.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="border-t border-gray-300 pt-4 mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <p className="font-semibold text-gray-700 mb-1">Header</p>
                          <p>School branding with logo, name, address, contact, motto</p>
                          <p className="mt-1"><span className="font-medium">Watermark:</span> {ver.watermarkText || "None"}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 mb-1">Footer</p>
                          <p>{ver.footerText || "Standard footer"}</p>
                        </div>
                      </div>
                      <div className="border rounded-lg p-3 bg-gray-50 text-xs">
                        <p className="font-semibold text-gray-700 mb-1">Signature & Seal</p>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div className="text-center">
                            <div className="border-b border-gray-400 h-8 mb-1" />
                            <p className="text-xs text-muted-foreground">Principal Signature</p>
                            <p className="text-[10px] text-muted-foreground">{ver.branding.principalSignaturePlaceholder?.split("\n")[0] || "Principal"}</p>
                          </div>
                          <div className="text-center">
                            <div className="border-b border-gray-400 h-8 mb-1" />
                            <p className="text-xs text-muted-foreground">Registrar Signature</p>
                            <p className="text-[10px] text-muted-foreground">{ver.branding.registrarSignaturePlaceholder?.split("\n")[0] || "Registrar"}</p>
                          </div>
                          <div className="text-center flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-[8px] text-gray-400 mb-1">{ver.schoolSealPlaceholder || "Seal"}</div>
                            <p className="text-[10px] text-muted-foreground">School Seal</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BaseLetterHead>
                </div>
              );
            })()}
          </div>
          {previewLh && previewLh.versions.length > 1 && (
            <div className="shrink-0 border-t px-5 py-2 flex gap-2 items-center text-xs text-muted-foreground">
              <span>Versions:</span>
              {[...previewLh.versions].reverse().map(v => (
                <Button
                  key={v.id}
                  size="sm"
                  variant={(!previewVersion && v.versionNumber === previewLh.currentVersion) || previewVersion?.id === v.id ? "default" : "outline"}
                  className="h-6 text-[10px]"
                  onClick={() => setPreviewVersion(v)}
                >
                  v{v.versionNumber}
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Version History */}
      <Dialog open={!!showVersions} onOpenChange={o => { if (!o) setShowVersions(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Version History</DialogTitle></DialogHeader>
          {showVersions && (() => {
            const lh = letterheads.find(l => l.id === showVersions);
            if (!lh) return null;
            return (
              <div className="space-y-3">
                {[...lh.versions].reverse().map((ver, idx) => (
                  <div key={ver.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Version {ver.versionNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(ver.updatedAt).toLocaleString()} — {ver.updatedBy}</p>
                      {idx === 0 && <Badge variant="default" className="mt-1 bg-brand">Current</Badge>}
                    </div>
                    {idx > 0 && (
                      <Button size="sm" variant="outline" onClick={() => { onRestoreVersion(lh.id, ver.id); setShowVersions(null); toast.success(`Restored to version ${ver.versionNumber}`); }}>
                        <RotateCcw className="mr-2 h-4 w-4" />Restore
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={o => { if (!o) setDeleteConfirm(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Archive Letterhead</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This letterhead will be archived and won't appear in active selections. You can restore it later.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { onArchive(deleteConfirm); setDeleteConfirm(null); toast.success("Letterhead archived"); } }}>
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
