import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface SeatingEntry {
  exam_name: string;
  date: string;
  room: string;
  seat_number: string;
  student_name: string;
  roll_number: string;
  class_name: string;
}

interface SeatingPlanTemplateProps {
  data: SeatingEntry[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function SeatingPlanTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: SeatingPlanTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "seat_number", label: "Seat No", width: "10%" },
    { key: "student_name", label: "Student Name", width: "20%" },
    { key: "roll_number", label: "Roll Number", width: "14%" },
    { key: "class_name", label: "Class", width: "10%" },
    { key: "exam_name", label: "Exam", width: "18%" },
    { key: "date", label: "Date", width: "12%" },
    { key: "room", label: "Room", width: "16%" },
  ];

  return (
    <BaseLetterHead
      title="Seating Plan"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Exams"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <DocumentTable
        columns={columns}
        rows={data.map((e) => columns.map((c) => (e as any)[c.key]))}
        small
      />
    </BaseLetterHead>
  );
}
