import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface SubjectMark {
  subject: string;
  marks_obtained: string;
  total_marks: string;
  grade: string;
}

interface ResultSheetEntry {
  student_name: string;
  roll_number: string;
  class_assigned: string;
  section?: string;
  subjects: SubjectMark[];
  total_marks: string;
  percentage: string;
  remarks?: string;
}

interface ResultSheetTemplateProps {
  data: ResultSheetEntry[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function ResultSheetTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: ResultSheetTemplateProps) {
  const studentDetailsColumns: DocumentTableColumn[] = [
    { key: "student_name", label: "Student Name", width: "25%" },
    { key: "roll_number", label: "Roll Number", width: "20%" },
    { key: "class_assigned", label: "Class", width: "15%" },
    { key: "section", label: "Section", width: "15%" },
    { key: "total_marks", label: "Total Marks", width: "15%" },
    { key: "percentage", label: "Percentage", width: "10%" },
  ];

  return (
    <BaseLetterHead
      title="Result Sheet"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Results"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Student Details</h3>
      <DocumentTable
        columns={studentDetailsColumns}
        rows={data.map((r) => studentDetailsColumns.map((c) => (r as any)[c.key]))}
        small
      />

      {data.map((entry, idx) => (
        <div key={idx} className="mt-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-1">
            {entry.student_name} — Subject Wise Marks
          </h4>
          <DocumentTable
            columns={[
              { key: "subject", label: "Subject", width: "30%" },
              { key: "marks_obtained", label: "Marks Obtained", width: "25%" },
              { key: "total_marks", label: "Total Marks", width: "20%" },
              { key: "grade", label: "Grade", width: "25%" },
            ]}
            rows={entry.subjects.map((s) => [s.subject, s.marks_obtained, s.total_marks, s.grade])}
            small
          />
          {entry.remarks && (
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Remarks:</span> {entry.remarks}
            </p>
          )}
        </div>
      ))}
    </BaseLetterHead>
  );
}
