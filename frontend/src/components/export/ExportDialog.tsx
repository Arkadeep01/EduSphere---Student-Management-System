import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { ExportFormat, ExportScope, ModuleExportConfig, ExportFieldGroup, ExportFilterConfig } from "./exportConfig";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ModuleExportConfig;
}

export function ExportDialog({ open, onOpenChange, config }: ExportDialogProps) {
  const [exportScope, setExportScope] = useState<ExportScope>("school");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [selectedFields, setSelectedFields] = useState<string[]>([...config.defaultFields]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showLargeWarning, setShowLargeWarning] = useState(false);
  const [pendingLargeExport, setPendingLargeExport] = useState(false);

  function toggleField(key: string) {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  }

  function selectAllFields() {
    setSelectedFields(config.fieldGroups.flatMap(g => g.fields.map(f => f.key)));
  }

  function deselectAllFields() {
    setSelectedFields([]);
  }

  function buildFilters(): Record<string, unknown> {
    const f: Record<string, unknown> = { ...filterValues };
    if (exportScope && exportScope !== "school") {
      f.scope = exportScope;
    }
    return f;
  }

  function handleProceedToConfirm() {
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field to export");
      return;
    }
    const totalRecords = config.estimateRecordCount ? config.estimateRecordCount() : 0;
    if (totalRecords > 500) {
      setShowLargeWarning(true);
      setPendingLargeExport(true);
    } else {
      setShowConfirm(true);
    }
  }

  function handleLargeConfirm() {
    setShowLargeWarning(false);
    setPendingLargeExport(false);
    setShowConfirm(true);
  }

  function handleLargeCancel() {
    setShowLargeWarning(false);
    setPendingLargeExport(false);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const filters = buildFilters();
      const { blob, filename } = await config.downloadFn(exportFormat, selectedFields, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setShowConfirm(false);
      onOpenChange(false);
      toast.success(`Exported ${filename}`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
    setShowConfirm(false);
    setShowLargeWarning(false);
  }

  const allFormats: ExportFormat[] = config.allowedFormats || ["csv", "excel", "pdf"];

  return (
    <>
      <Dialog open={open && !showConfirm && !showLargeWarning} onOpenChange={o => { if (!o) handleClose(); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Export {config.label}</DialogTitle></DialogHeader>

          {/* Format */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Export Format</Label>
            <div className="flex gap-2 flex-wrap">
              {allFormats.map(fmt => (
                <Button
                  key={fmt}
                  size="sm"
                  variant={exportFormat === fmt ? "default" : "outline"}
                  onClick={() => setExportFormat(fmt)}
                  className="capitalize"
                >
                  {fmt === "csv" ? "CSV (.csv)" : fmt === "excel" ? "Excel (.xlsx)" : "PDF (.pdf)"}
                </Button>
              ))}
            </div>
          </div>

          {/* Scope */}
          {config.scopes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Export Scope</Label>
              <Select value={exportScope} onValueChange={setExportScope}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {config.scopes.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {exportScope !== "school" && config.scopes.filter(s => s.value !== "school").map(s => {
                if (s.value === exportScope && exportScope.includes("_")) {
                  return null;
                }
                return null;
              })}
            </div>
          )}

          {/* Filters */}
          {config.filters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Filter Options</Label>
              <div className="flex gap-2 flex-wrap">
                {config.filters.map(filter => (
                  <div key={filter.key} className="flex-1 min-w-[140px]">
                    <Label className="text-xs">{filter.label}</Label>
                    {filter.type === "select" ? (
                      <Select
                        value={filterValues[filter.key] || ""}
                        onValueChange={v => setFilterValues(prev => ({ ...prev, [filter.key]: v }))}
                      >
                        <SelectTrigger><SelectValue placeholder={`All ${filter.label.toLowerCase()}`} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {(filter.options || []).map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={filter.label}
                        value={filterValues[filter.key] || ""}
                        onChange={e => setFilterValues(prev => ({ ...prev, [filter.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Fields to Export</Label>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={selectAllFields}>Select All</Button>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={deselectAllFields}>Deselect All</Button>
              </div>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
              {config.fieldGroups.map(group => (
                <div key={group.group}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{group.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.fields.map(f => (
                      <Badge
                        key={f.key}
                        variant={selectedFields.includes(f.key) ? "default" : "outline"}
                        className={`cursor-pointer text-xs ${selectedFields.includes(f.key) ? "bg-primary" : ""}`}
                        onClick={() => toggleField(f.key)}
                      >
                        {selectedFields.includes(f.key) ? "\u2611" : "\u2610"} {f.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleProceedToConfirm}>
              Review & Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Export</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium capitalize">
                  {exportFormat === "csv" ? "CSV (.csv)" : exportFormat === "excel" ? "Excel (.xlsx)" : "PDF (.pdf)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scope</span>
                <span className="font-medium capitalize">{exportScope.replace("_", " ")}</span>
              </div>
              {Object.entries(filterValues).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{k.replace("_", " ")}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fields</span>
                <span className="font-medium">{selectedFields.length} selected</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {exportFormat === "csv" && "CSV files can be opened in Excel, Google Sheets, or any text editor."}
              {exportFormat === "excel" && "Excel files include formatted headers and auto-filter."}
              {exportFormat === "pdf" && "PDF will be generated in landscape orientation with a table layout."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleExport} disabled={exporting}>
              {exporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Exporting...</> : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Large Warning */}
      <Dialog open={showLargeWarning} onOpenChange={o => { if (!o) { setShowLargeWarning(false); setPendingLargeExport(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Large Export
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You are about to export <strong>{config.estimateRecordCount ? config.estimateRecordCount() : 0}</strong> records.
            This may take a moment depending on the selected fields and format.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={handleLargeCancel}>Cancel</Button>
            <Button className="bg-gradient-brand border-0" onClick={handleLargeConfirm}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
