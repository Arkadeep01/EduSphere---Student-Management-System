import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface ClassData {
  name: string;
  section: string;
  total_students: string;
  class_teacher: string;
  subject_teachers?: string;
  academic_session?: string;
  student_strength?: string;
}

interface ClassesExportTemplateProps {
  data: ClassData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function ClassesExportTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: ClassesExportTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "name", label: "Class", width: "12%" },
    { key: "section", label: "Section", width: "10%" },
    { key: "total_students", label: "Total Students", width: "14%" },
    { key: "class_teacher", label: "Class Teacher", width: "20%" },
    { key: "subject_teachers", label: "Subject Teachers", width: "22%" },
    { key: "academic_session", label: "Academic Session", width: "12%" },
    { key: "student_strength", label: "Student Strength", width: "10%" },
  ];

  function mapRow(c: ClassData) {
    return columns.map((col) => (c as any)[col.key]);
  }

  return (
    <BaseLetterHead
      title="Classes Export"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Classes"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <DocumentTable columns={columns} rows={data.map(mapRow)} small />
    </BaseLetterHead>
  );
}
