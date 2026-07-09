import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface TeacherData {
  name: string;
  employee_id?: string;
  username?: string;
  email: string;
  phone?: string;
  gender?: string;
  qualification?: string;
  experience?: string;
  date_of_joining?: string;
  employment_status?: string;
  assigned_subject?: string;
  assigned_classes?: string;
  assigned_sections?: string;
  class_teacher_of?: string;
  total_students?: string;
  pending_evaluations?: string;
  assignments_created?: string;
  attendance_taken?: string;
  resources_uploaded?: string;
  syllabus_uploaded?: string;
  last_login?: string;
  performance_rating?: string;
}

interface TeacherExportTemplateProps {
  data: TeacherData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function TeacherExportTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: TeacherExportTemplateProps) {
  const personalColumns: DocumentTableColumn[] = [
    { key: "name", label: "Name", width: "16%" },
    { key: "employee_id", label: "Employee ID", width: "12%" },
    { key: "username", label: "Username", width: "12%" },
    { key: "email", label: "Email", width: "20%" },
    { key: "phone", label: "Phone", width: "14%" },
    { key: "gender", label: "Gender", width: "8%" },
    { key: "last_login", label: "Last Login", width: "18%" },
  ];

  const professionalColumns: DocumentTableColumn[] = [
    { key: "qualification", label: "Qualification", width: "25%" },
    { key: "experience", label: "Experience", width: "15%" },
    { key: "date_of_joining", label: "Date of Joining", width: "20%" },
    { key: "employment_status", label: "Status", width: "15%" },
    { key: "performance_rating", label: "Performance Rating", width: "25%" },
  ];

  const academicColumns: DocumentTableColumn[] = [
    { key: "assigned_subject", label: "Assigned Subject", width: "20%" },
    { key: "assigned_classes", label: "Assigned Classes", width: "25%" },
    { key: "assigned_sections", label: "Assigned Sections", width: "25%" },
    { key: "class_teacher_of", label: "Class Teacher Of", width: "30%" },
  ];

  const statisticsColumns: DocumentTableColumn[] = [
    { key: "total_students", label: "Total Students", width: "16%" },
    { key: "pending_evaluations", label: "Pending Eval", width: "16%" },
    { key: "assignments_created", label: "Assignments", width: "16%" },
    { key: "attendance_taken", label: "Attendance Taken", width: "18%" },
    { key: "resources_uploaded", label: "Resources", width: "16%" },
    { key: "syllabus_uploaded", label: "Syllabus Uploaded", width: "18%" },
  ];

  function mapRow(t: TeacherData, cols: DocumentTableColumn[]) {
    return cols.map((c) => (t as any)[c.key]);
  }

  return (
    <BaseLetterHead
      title="Teacher Export"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Teachers"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Personal Information</h3>
      <DocumentTable columns={personalColumns} rows={data.map((t) => mapRow(t, personalColumns))} small />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Professional Information</h3>
      <DocumentTable columns={professionalColumns} rows={data.map((t) => mapRow(t, professionalColumns))} small />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Academic Information</h3>
      <DocumentTable columns={academicColumns} rows={data.map((t) => mapRow(t, academicColumns))} small />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Statistics</h3>
      <DocumentTable columns={statisticsColumns} rows={data.map((t) => mapRow(t, statisticsColumns))} small />
    </BaseLetterHead>
  );
}
