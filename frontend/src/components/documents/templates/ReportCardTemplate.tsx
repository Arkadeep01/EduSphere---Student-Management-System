import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";
import { SignatureSection } from "../SignatureSection";

interface SubjectGrade {
  subject: string;
  marks_obtained: string;
  total_marks: string;
  grade: string;
}

interface ReportCardEntry {
  student_name: string;
  roll_number: string;
  class_assigned: string;
  section?: string;
  academic_session?: string;
  attendance_percentage?: string;
  subjects: SubjectGrade[];
  teacher_remarks?: string;
  principal_remarks?: string;
}

interface ReportCardTemplateProps {
  data: ReportCardEntry[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function ReportCardTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: ReportCardTemplateProps) {
  return (
    <BaseLetterHead
      title="Report Card"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Results"
      totalRecords={totalRecords}
      pageOrientation="portrait"
      showSignature={false}
    >
      {data.map((entry, idx) => (
        <div key={idx} className="mb-6 print:page-break-inside-avoid">
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#1e3a5f] mb-2">Student Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{entry.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Roll Number:</span>
                <span className="font-medium">{entry.roll_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Class:</span>
                <span className="font-medium">{entry.class_assigned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Section:</span>
                <span className="font-medium">{entry.section || "-"}</span>
              </div>
              {entry.academic_session && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Academic Session:</span>
                  <span className="font-medium">{entry.academic_session}</span>
                </div>
              )}
            </div>

            <h4 className="text-xs font-semibold text-gray-700 mb-1">Subject Wise Marks & Grades</h4>
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

            {entry.attendance_percentage && (
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-medium">Attendance:</span> {entry.attendance_percentage}
              </p>
            )}

            {entry.teacher_remarks && (
              <div className="mt-3 p-2 bg-gray-50 border rounded text-xs">
                <span className="font-medium text-gray-700">Teacher Remarks:</span>
                <p className="text-gray-600 mt-0.5">{entry.teacher_remarks}</p>
              </div>
            )}

            {entry.principal_remarks && (
              <div className="mt-2 p-2 bg-gray-50 border rounded text-xs">
                <span className="font-medium text-gray-700">Principal Remarks:</span>
                <p className="text-gray-600 mt-0.5">{entry.principal_remarks}</p>
              </div>
            )}

            <SignatureSection
              entries={[
                { label: "Class Teacher" },
                { label: "Principal" },
                { label: "Parent / Guardian" },
              ]}
              date={generatedDate}
            />
          </div>
        </div>
      ))}
    </BaseLetterHead>
  );
}
