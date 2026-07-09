import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface AuditLogData {
  user: string;
  model_name: string;
  export_type: string;
  file_path?: string;
  exported_at: string;
  action?: string;
  module?: string;
  timestamp?: string;
}

interface AuditLogsTemplateProps {
  data: AuditLogData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function AuditLogsTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: AuditLogsTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "user", label: "User", width: "18%" },
    { key: "module", label: "Module", width: "18%" },
    { key: "model_name", label: "Activity", width: "20%" },
    { key: "action", label: "Action", width: "14%" },
    { key: "export_type", label: "Type", width: "10%" },
    { key: "timestamp", label: "Timestamp", width: "20%" },
  ];

  return (
    <BaseLetterHead
      title="Audit Logs"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Audit Logs"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <DocumentTable
        columns={columns}
        rows={data.map((log) => columns.map((c) => {
          let val = (log as any)[c.key];
          if (c.key === "timestamp" && !val) val = log.exported_at;
          if (c.key === "module" && !val) val = log.model_name;
          if (c.key === "action" && !val) val = log.export_type;
          return val;
        }))}
        small
      />
    </BaseLetterHead>
  );
}
