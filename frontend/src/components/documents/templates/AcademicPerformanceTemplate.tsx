import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface AcademicPerfData {
  subject: string;
  class_name: string;
  highest: string;
  lowest: string;
  average: string;
  pass_percentage: string;
  fail_percentage: string;
}

interface AcademicPerformanceTemplateProps {
  data: AcademicPerfData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function AcademicPerformanceTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: AcademicPerformanceTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "subject", label: "Subject", width: "20%" },
    { key: "class_name", label: "Class", width: "12%" },
    { key: "highest", label: "Highest", width: "14%", align: "center" },
    { key: "lowest", label: "Lowest", width: "14%", align: "center" },
    { key: "average", label: "Average", width: "14%", align: "center" },
    { key: "pass_percentage", label: "Pass %", width: "13%", align: "center" },
    { key: "fail_percentage", label: "Fail %", width: "13%", align: "center" },
  ];

  return (
    <BaseLetterHead
      title="Academic Performance Report"
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
        rows={data.map((a) => columns.map((c) => (a as any)[c.key]))}
        small
      />
    </BaseLetterHead>
  );
}
