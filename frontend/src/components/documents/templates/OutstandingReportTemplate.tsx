import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface OutstandingEntry {
  studentName: string;
  admissionNumber: string;
  className: string;
  section: string;
  month: string;
  pendingAmount: number;
  dueDate: string;
  daysOverdue: number;
  fine: number;
}

interface OutstandingReportTemplateProps {
  data: OutstandingEntry[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function OutstandingReportTemplate({ data, generatedBy, generatedDate, generatedTime, academicSession, totalRecords }: OutstandingReportTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "studentName", label: "Student Name", width: "18%" },
    { key: "admissionNumber", label: "Admission No", width: "14%" },
    { key: "className", label: "Class", width: "8%" },
    { key: "section", label: "Sec", width: "6%" },
    { key: "month", label: "Month", width: "10%" },
    { key: "pendingAmount", label: "Pending (₹)", width: "12%", align: "right" },
    { key: "dueDate", label: "Due Date", width: "12%" },
    { key: "daysOverdue", label: "Overdue (Days)", width: "10%", align: "center" },
    { key: "fine", label: "Fine (₹)", width: "10%", align: "right" },
  ];

  return (
    <BaseLetterHead
      title="Outstanding Fee Report"
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
