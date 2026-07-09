import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface StatEntry {
  metric: string;
  value: string;
  change?: string;
}

interface SystemStatisticsTemplateProps {
  data: StatEntry[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function SystemStatisticsTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: SystemStatisticsTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "metric", label: "Metric", width: "40%" },
    { key: "value", label: "Value", width: "30%", align: "center" },
    { key: "change", label: "Change", width: "30%", align: "center" },
  ];

  return (
    <BaseLetterHead
      title="System Statistics"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Reports"
      totalRecords={totalRecords}
      pageOrientation="portrait"
    >
      <DocumentTable
        columns={columns}
        rows={data.map((s) => [s.metric, s.value, s.change || "-"])}
        small
      />
    </BaseLetterHead>
  );
}
