import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Eye, Trash2, Archive, RotateCcw, Star, Plus, History } from "lucide-react";
import { toast } from "sonner";
import type { Letterhead, LetterheadVersion, LetterheadFormData } from "@/types/letterhead";
import { getDefaultBranding } from "@/lib/letterhead-store";
import { LetterheadPreview } from "./LetterheadPreview";

interface LetterheadListProps {
  letterheads: Letterhead[];
  onEdit: (lh: Letterhead) => void;
  onSetDefault: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onRestoreVersion: (letterheadId: string, versionId: string) => void;
}

export function LetterheadList({
  letterheads,
  onEdit,
  onSetDefault,
  onArchive,
  onRestore,
  onDelete,
  onAdd,
  onRestoreVersion,
}: LetterheadListProps) {
  const [previewLh, setPreviewLh] = useState<Letterhead | null>(null);
  const [previewVersion, setPreviewVersion] = useState<LetterheadVersion | null>(null);
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
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {active.map(lh => {
                const ver = lh.versions.find(v => v.versionNumber === lh.currentVersion);
                return (
                  <TableRow key={lh.id}>
                    <TableCell className="font-medium">{lh.name}{lh.isDefault && <Badge variant="default" className="ml-2 bg-brand">Default</Badge>}</TableCell>
                    <TableCell className="text-sm">{ver?.branding.schoolName || "-"}</TableCell>
                    <TableCell className="text-xs">v{lh.currentVersion}</TableCell>
                    <TableCell>
                      <Badge variant={lh.status === "active" ? "default" : "secondary"} className={lh.status === "active" ? "bg-success" : ""}>
                        {lh.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(lh.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setPreviewLh(lh); setPreviewVersion(null); }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(lh)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        {!lh.isDefault && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Set as default" onClick={() => { onSetDefault(lh.id); toast.success(`${lh.name} set as default`); }}>
                            <Star className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Version history" onClick={() => setShowVersions(lh.id)}>
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteConfirm(lh.id)}>
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}

      {archived.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Archived Letterheads</h4>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archived.map(lh => (
                  <TableRow key={lh.id}>
                    <TableCell className="font-medium">{lh.name}</TableCell>
                    <TableCell className="text-sm">{lh.versions.find(v => v.versionNumber === lh.currentVersion)?.branding.schoolName || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(lh.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { onRestore(lh.id); toast.success("Letterhead restored"); }}>
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => { onDelete(lh.id); toast.success("Letterhead deleted"); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </div>
      )}

      {/* Preview */}
      <Dialog open={!!previewLh} onOpenChange={o => { if (!o) { setPreviewLh(null); setPreviewVersion(null); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Preview: {previewLh?.name}</DialogTitle></DialogHeader>
          <div className="overflow-auto border rounded-lg">
            {previewLh && (
              <LetterheadPreview
                formData={
                  previewVersion
                    ? getVersionData(previewLh, previewVersion)
                    : getVersionData(previewLh, previewLh.versions.find(v => v.versionNumber === previewLh.currentVersion)!)
                }
              />
            )}
          </div>
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
                      <p className="text-xs text-muted-foreground">
                        {new Date(ver.updatedAt).toLocaleString()} — {ver.updatedBy}
                      </p>
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

      {/* Delete Confirmation */}
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
