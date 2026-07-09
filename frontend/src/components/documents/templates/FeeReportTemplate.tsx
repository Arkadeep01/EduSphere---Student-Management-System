import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface FeeReportEntry {
  studentName: string;
  admissionNumber: string;
  className: string;
  month: string;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  fine: number;
  status: string;
}

interface FeeReportTemplateProps {
  data: FeeReportEntry[];
  title: string;
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function FeeReportTemplate({ data, title, generatedBy, generatedDate, generatedTime, academicSession, totalRecords }: FeeReportTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "studentName", label: "Student Name", width: "18%" },
    { key: "admissionNumber", label: "Admission No", width: "14%" },
    { key: "className", label: "Class", width: "8%" },
    { key: "month", label: "Month", width: "10%" },
    { key: "totalFee", label: "Total (₹)", width: "12%", align: "right" },
    { key: "paidAmount", label: "Paid (₹)", width: "12%", align: "right" },
    { key: "pendingAmount", label: "Pending (₹)", width: "12%", align: "right" },
    { key: "fine", label: "Fine (₹)", width: "8%", align: "right" },
    { key: "status", label: "Status", width: "6%" },
  ];

  return (
    <BaseLetterHead
      title={title}
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Fees"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <DocumentTable columns={columns} rows={data.map(r => columns.map(c => {
        const val = (r as any)[c.key];
        if (c.align === "right" && typeof val === "number") return `₹${val.toLocaleString()}`;
        return val ?? "-";
      }))} small />
    </BaseLetterHead>
  );
}
