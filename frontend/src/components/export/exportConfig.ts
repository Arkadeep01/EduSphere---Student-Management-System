export type ExportFormat = "csv" | "excel" | "pdf";
export type ExportScope = string;

export interface ExportField {
  key: string;
  label: string;
}

export interface ExportFieldGroup {
  group: string;
  fields: ExportField[];
}

export interface ExportOption {
  value: string;
  label: string;
}

export interface ExportScopeOption {
  value: ExportScope;
  label: string;
}

export interface ExportFilterConfig {
  key: string;
  label: string;
  type: "select" | "text" | "date-range";
  options?: ExportOption[];
}

export interface ModuleExportConfig {
  moduleName: string;
  label: string;
  fieldGroups: ExportFieldGroup[];
  defaultFields: string[];
  scopes: ExportScopeOption[];
  filters: ExportFilterConfig[];
  downloadFn: (format: string, fields: string[], filters: Record<string, unknown>) => Promise<{ blob: Blob; filename: string }>;
  allowedFormats?: ExportFormat[];
  estimateRecordCount?: () => number;
  estimateFileSize?: (format: ExportFormat, fields: string[]) => string;
  scopeInputs?: Record<string, ExportFilterConfig[]>;
}
