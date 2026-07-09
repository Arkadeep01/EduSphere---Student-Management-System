import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface InvigilationEntry {
  exam_name: string;
  date: string;
  time: string;
  room: string;
  invigilator: string;
  subject: string;
  class_name: string;
}

interface InvigilationTemplateProps {
  data: InvigilationEntry[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function InvigilationTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: InvigilationTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "exam_name", label: "Exam", width: "16%" },
    { key: "date", label: "Date", width: "12%" },
    { key: "time", label: "Time", width: "12%" },
    { key: "room", label: "Room", width: "12%" },
    { key: "invigilator", label: "Invigilator", width: "20%" },
    { key: "subject", label: "Subject", width: "16%" },
    { key: "class_name", label: "Class", width: "12%" },
  ];

  return (
    <BaseLetterHead
      title="Invigilation Schedule"
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
