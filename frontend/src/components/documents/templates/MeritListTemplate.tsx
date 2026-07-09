import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface MeritListEntry {
  rank: number;
  student_name: string;
  class_assigned: string;
  section?: string;
  total_marks: string;
  percentage: string;
}

interface MeritListTemplateProps {
  data: MeritListEntry[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function MeritListTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: MeritListTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "rank", label: "Rank", width: "10%", align: "center" },
    { key: "student_name", label: "Student", width: "30%" },
    { key: "class_assigned", label: "Class", width: "15%" },
    { key: "section", label: "Section", width: "10%", align: "center" },
    { key: "total_marks", label: "Total Marks", width: "20%", align: "right" },
    { key: "percentage", label: "Percentage", width: "15%", align: "right" },
  ];

  function mapRow(m: MeritListEntry) {
    return columns.map((c) => (m as any)[c.key]);
  }

  return (
    <BaseLetterHead
      title="Merit List"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Results"
      totalRecords={totalRecords}
      pageOrientation="portrait"
    >
      <DocumentTable columns={columns} rows={data.map(mapRow)} small />
    </BaseLetterHead>
  );
}
