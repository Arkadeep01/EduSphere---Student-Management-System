import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";
import { PageBreak } from "../PageBreak";

interface AttendanceRecord {
  student_name: string;
  roll_number?: string;
  class_assigned: string;
  section?: string;
  attendance_percentage?: string;
  present?: string;
  absent?: string;
  leave?: string;
  date?: string;
  status?: string;
  marked_by?: string;
}

interface AttendanceExportTemplateProps {
  data: AttendanceRecord[];
  summary?: {
    totalStudents: number;
    averagePercentage: string;
    totalPresent: number;
    totalAbsent: number;
    totalLeave: number;
  };
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function AttendanceExportTemplate({
  data,
  summary,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: AttendanceExportTemplateProps) {
  const detailColumns: DocumentTableColumn[] = [
    { key: "student_name", label: "Student Name", width: "18%" },
    { key: "roll_number", label: "Roll Number", width: "12%" },
    { key: "class_assigned", label: "Class", width: "10%" },
    { key: "section", label: "Section", width: "10%" },
    { key: "attendance_percentage", label: "Attendance %", width: "14%" },
    { key: "present", label: "Present", width: "10%" },
    { key: "absent", label: "Absent", width: "10%" },
    { key: "leave", label: "Leave", width: "10%" },
  ];

  return (
    <BaseLetterHead
      title="Attendance Report"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Attendance"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      {summary && (
        <>
          <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Attendance Summary</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="border rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[#2563EB]">{summary.totalStudents}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-green-600">{summary.averagePercentage}%</p>
              <p className="text-xs text-gray-500">Average Attendance</p>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-green-600">{summary.totalPresent}</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-red-600">{summary.totalAbsent}</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
          </div>
          {summary.totalLeave > 0 && (
            <p className="text-xs text-gray-500 mb-2 text-right">Leave: {summary.totalLeave}</p>
          )}
          <div className="border rounded-lg p-3 mb-4 text-center text-xs text-gray-400 italic">
            [Attendance Charts Placeholder]
          </div>
          <PageBreak />
        </>
      )}

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Attendance Details</h3>
      <DocumentTable columns={detailColumns} rows={data.map((r) => detailColumns.map((c) => (r as any)[c.key]))} small />
    </BaseLetterHead>
  );
}
