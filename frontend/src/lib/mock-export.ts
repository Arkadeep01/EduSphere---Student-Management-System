import { students, teachers, fees, contactSubmissions, admissionSubmissions } from "./mock-data";

type FieldMap = Record<string, (record: any) => string | number>;

function fieldValue(record: any, field: string): string | number {
  const v = record[field];
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}

function buildFieldMap(fields: string[], records: any[]): FieldMap {
  const map: FieldMap = {};
  for (const field of fields) {
    if (records.length > 0 && field in records[0]) {
      map[field] = (r: any) => fieldValue(r, field);
    } else {
      map[field] = () => field;
    }
  }
  return map;
}

function generateCSV(records: any[], fields: string[]): string {
  const header = fields.join(",");
  const rows = records.map(r => fields.map(f => {
    const v = fieldValue(r, f);
    const s = String(v);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(","));
  return [header, ...rows].join("\n");
}

function generateHTML(records: any[], fields: string[], title: string): string {
  const header = fields.map(f => `<th>${f.replace(/_/g, " ")}</th>`).join("");
  const rows = records.map(r =>
    `<tr>${fields.map(f => `<td>${fieldValue(r, f)}</td>`).join("")}</tr>`
  ).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:20px}h2{color:#333}table{border-collapse:collapse;width:100%;margin-top:10px}th{background:#1e3a5f;color:#fff;padding:8px;text-align:left;font-size:12px}td{padding:6px 8px;border-bottom:1px solid #ddd;font-size:11px}tr:nth-child(even){background:#f5f5f5}</style></head><body><h2>${title}</h2><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

function generatePDF(records: any[], fields: string[], title: string): string {
  return generateHTML(records, fields, title);
}

function filename(prefix: string, format: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.${format === "excel" ? "xls" : format}`;
}

function mimeType(format: string): string {
  if (format === "csv") return "text/csv";
  if (format === "excel") return "application/vnd.ms-excel";
  return "text/html";
}

function getRecords(module: string): any[] {
  switch (module) {
    case "students": return students;
    case "teachers": return teachers;
    case "attendance": return [];
    case "classes": return [];
    case "exams": return [];
    case "admissions": return admissionSubmissions;
    case "contacts": return contactSubmissions;
    case "documents": return [];
    case "fees": return fees;
    case "audit_logs": return [];
    case "salary": return [];
    case "receipt": return [];
    default: return [];
  }
}

export function generateMockExport(
  module: string,
  format: string,
  fields: string[],
  filters: Record<string, unknown>,
): { blob: Blob; filename: string } {
  const records = getRecords(module);
  const label = module.charAt(0).toUpperCase() + module.slice(1);

  if (format === "csv") {
    const csv = generateCSV(records, fields);
    return {
      blob: new Blob([csv], { type: mimeType(format) }),
      filename: filename(label, format),
    };
  }

  const html = format === "excel" ? generateHTML(records, fields, `${label} Export`) : generatePDF(records, fields, `${label} Export`);
  return {
    blob: new Blob([html], { type: mimeType(format) }),
    filename: filename(label, format),
  };
}
