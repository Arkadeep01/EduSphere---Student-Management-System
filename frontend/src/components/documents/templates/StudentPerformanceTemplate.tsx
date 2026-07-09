import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface StudentPerfData {
  name: string;
  roll_number?: string;
  class_assigned?: string;
  section?: string;
  gpa?: string;
  overall_percentage?: string;
  attendance_percentage?: string;
  rank?: string;
}

interface StudentPerformanceTemplateProps {
  data: StudentPerfData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function StudentPerformanceTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: StudentPerformanceTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "name", label: "Student Name", width: "18%" },
    { key: "roll_number", label: "Roll Number", width: "14%" },
    { key: "class_assigned", label: "Class", width: "10%" },
    { key: "section", label: "Section", width: "10%" },
    { key: "gpa", label: "GPA", width: "12%", align: "center" },
    { key: "overall_percentage", label: "Overall %", width: "14%", align: "center" },
    { key: "attendance_percentage", label: "Attendance %", width: "12%", align: "center" },
    { key: "rank", label: "Rank", width: "10%", align: "center" },
  ];

  return (
    <BaseLetterHead
      title="Student Performance Report"
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
