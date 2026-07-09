import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface TeacherPerfData {
  name: string;
  employee_id?: string;
  assigned_subject?: string;
  performance_rating?: string;
  pending_evaluations?: string;
  assignments_created?: string;
  attendance_taken?: string;
}

interface TeacherPerformanceTemplateProps {
  data: TeacherPerfData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function TeacherPerformanceTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: TeacherPerformanceTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "name", label: "Teacher Name", width: "18%" },
    { key: "employee_id", label: "Employee ID", width: "14%" },
    { key: "assigned_subject", label: "Subject", width: "16%" },
    { key: "performance_rating", label: "Performance Rating", width: "16%" },
    { key: "pending_evaluations", label: "Pending Eval", width: "12%" },
    { key: "assignments_created", label: "Assignments", width: "12%" },
    { key: "attendance_taken", label: "Attendance", width: "12%" },
  ];

  return (
    <BaseLetterHead
      title="Teacher Performance Report"
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
        rows={data.map((t) => columns.map((c) => (t as any)[c.key]))}
        small
      />
    </BaseLetterHead>
  );
}
