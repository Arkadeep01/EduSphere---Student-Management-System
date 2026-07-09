import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface TimetableEntry {
  date: string;
  start_time: string;
  end_time: string;
  subject: string;
  room: string;
  class_name: string;
}

interface ExamTimetableTemplateProps {
  data: TimetableEntry[];
  examName: string;
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function ExamTimetableTemplate({
  data,
  examName,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: ExamTimetableTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "date", label: "Date", width: "18%" },
    { key: "start_time", label: "Start Time", width: "16%" },
    { key: "end_time", label: "End Time", width: "16%" },
    { key: "subject", label: "Subject", width: "20%" },
    { key: "room", label: "Room", width: "14%" },
    { key: "class_name", label: "Class", width: "16%" },
  ];

  return (
    <BaseLetterHead
      title={`Exam Timetable — ${examName}`}
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
