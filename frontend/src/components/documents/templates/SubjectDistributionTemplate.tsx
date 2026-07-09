import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface SubjectDistData {
  subject: string;
  tier?: string;
  total_students: string;
  teachers_count?: string;
  classes_offered?: string;
}

interface SubjectDistributionTemplateProps {
  data: SubjectDistData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function SubjectDistributionTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: SubjectDistributionTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "subject", label: "Subject", width: "25%" },
    { key: "tier", label: "Tier", width: "15%" },
    { key: "total_students", label: "Total Students", width: "20%", align: "center" },
    { key: "teachers_count", label: "Teachers", width: "15%", align: "center" },
    { key: "classes_offered", label: "Classes Offered", width: "25%" },
  ];

  return (
    <BaseLetterHead
      title="Subject Distribution Report"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Reports"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <DocumentTable
        columns={columns}
        rows={data.map((s) => columns.map((c) => (s as any)[c.key]))}
        small
      />
    </BaseLetterHead>
  );
}
