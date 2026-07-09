import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";
import { PageBreak } from "../PageBreak";

interface StudentData {
  name: string;
  username?: string;
  email: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  roll_number?: string;
  admission_number?: string;
  class_assigned?: string;
  section?: string;
  academic_session?: string;
  father_name?: string;
  mother_name?: string;
  guardian_contact?: string;
  core_subjects?: string;
  specialized_subjects?: string;
  enriched_subjects?: string;
  attendance_percentage?: string;
  present_days?: string;
  absent_days?: string;
  gpa?: string;
  overall_percentage?: string;
  rank?: string;
  assignment_average?: string;
  exam_average?: string;
  fees_paid?: string;
  fees_pending?: string;
  fees_total_due?: string;
  admission_status?: string;
  document_verification?: string;
}

interface StudentExportTemplateProps {
  data: StudentData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function StudentExportTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: StudentExportTemplateProps) {
  const personalColumns: DocumentTableColumn[] = [
    { key: "name", label: "Name", width: "18%" },
    { key: "username", label: "Username", width: "12%" },
    { key: "email", label: "Email", width: "20%" },
    { key: "phone", label: "Phone", width: "12%" },
    { key: "gender", label: "Gender", width: "8%" },
    { key: "date_of_birth", label: "DOB", width: "10%" },
    { key: "roll_number", label: "Roll No", width: "10%" },
    { key: "admission_number", label: "Admission No", width: "10%" },
  ];

  const academicColumns: DocumentTableColumn[] = [
    { key: "class_assigned", label: "Class", width: "12%" },
    { key: "section", label: "Section", width: "10%" },
    { key: "academic_session", label: "Session", width: "12%" },
    { key: "core_subjects", label: "Core Subjects", width: "22%" },
    { key: "specialized_subjects", label: "Specialized", width: "22%" },
    { key: "enriched_subjects", label: "Enriched", width: "22%" },
  ];

  const guardianColumns: DocumentTableColumn[] = [
    { key: "father_name", label: "Father Name", width: "30%" },
    { key: "mother_name", label: "Mother Name", width: "30%" },
    { key: "guardian_contact", label: "Guardian Contact", width: "40%" },
  ];

  const attendanceColumns: DocumentTableColumn[] = [
    { key: "attendance_percentage", label: "Attendance %", width: "25%" },
    { key: "present_days", label: "Present", width: "25%" },
    { key: "absent_days", label: "Absent", width: "25%" },
    { key: "rank", label: "Rank", width: "25%" },
  ];

  const performanceColumns: DocumentTableColumn[] = [
    { key: "gpa", label: "GPA", width: "16%" },
    { key: "overall_percentage", label: "Overall %", width: "16%" },
    { key: "assignment_average", label: "Assignment Avg", width: "20%" },
    { key: "exam_average", label: "Exam Avg", width: "16%" },
    { key: "fees_paid", label: "Fees Paid", width: "16%" },
    { key: "fees_pending", label: "Pending", width: "16%" },
  ];

  const verificationColumns: DocumentTableColumn[] = [
    { key: "admission_status", label: "Admission Status", width: "33%" },
    { key: "document_verification", label: "Document Verification", width: "33%" },
    { key: "fees_total_due", label: "Total Due", width: "34%" },
  ];

  function mapRow(s: StudentData, cols: DocumentTableColumn[]): (string | number | null | undefined)[] {
    return cols.map((c) => (s as any)[c.key]);
  }

  return (
    <BaseLetterHead
      title="Student Export"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Students"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Personal Information</h3>
      <DocumentTable columns={personalColumns} rows={data.map((s) => mapRow(s, personalColumns))} small />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Guardian Information</h3>
      <DocumentTable columns={guardianColumns} rows={data.map((s) => mapRow(s, guardianColumns))} small />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Academic Information</h3>
      <DocumentTable columns={academicColumns} rows={data.map((s) => mapRow(s, academicColumns))} small />

      <PageBreak />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Attendance & Performance</h3>
      <DocumentTable columns={attendanceColumns} rows={data.map((s) => mapRow(s, attendanceColumns))} small />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Performance & Fees</h3>
      <DocumentTable columns={performanceColumns} rows={data.map((s) => mapRow(s, performanceColumns))} small />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Verification</h3>
      <DocumentTable columns={verificationColumns} rows={data.map((s) => mapRow(s, verificationColumns))} small />
    </BaseLetterHead>
  );
}
