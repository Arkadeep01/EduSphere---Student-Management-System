import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface ExamData {
  name: string;
  subject?: string;
  date?: string;
  time?: string;
  room?: string;
  duration?: string;
  status?: string;
  classes?: string;
  academic_year?: string;
}

interface ExamScheduleTemplateProps {
  data: ExamData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function ExamScheduleTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: ExamScheduleTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "name", label: "Exam Name", width: "18%" },
    { key: "subject", label: "Subject", width: "16%" },
    { key: "date", label: "Date", width: "12%" },
    { key: "time", label: "Time", width: "10%" },
    { key: "room", label: "Room", width: "10%" },
    { key: "duration", label: "Duration", width: "10%" },
    { key: "classes", label: "Classes", width: "14%" },
    { key: "status", label: "Status", width: "10%" },
  ];

  function mapRow(e: ExamData) {
    return columns.map((c) => (e as any)[c.key]);
  }

  return (
    <BaseLetterHead
      title="Exam Schedule"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Exams"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <DocumentTable columns={columns} rows={data.map(mapRow)} small />
    </BaseLetterHead>
  );
}
