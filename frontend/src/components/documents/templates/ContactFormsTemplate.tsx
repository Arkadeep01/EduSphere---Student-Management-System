import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  submitted_at: string;
}

interface ContactFormsTemplateProps {
  data: ContactData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function ContactFormsTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: ContactFormsTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "name", label: "Name", width: "14%" },
    { key: "email", label: "Email", width: "18%" },
    { key: "phone", label: "Phone", width: "12%" },
    { key: "subject", label: "Subject", width: "18%" },
    { key: "message", label: "Message", width: "22%" },
    { key: "status", label: "Status", width: "8%" },
    { key: "submitted_at", label: "Date", width: "8%" },
  ];

  return (
    <BaseLetterHead
      title="Contact Forms"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Contacts"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <DocumentTable
        columns={columns}
        rows={data.map((c) => columns.map((col) => (c as any)[col.key]))}
        small
      />
    </BaseLetterHead>
  );
}
