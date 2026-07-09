import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface VerifiedStudentData {
  applicant_name: string;
  email: string;
  phone?: string;
  father_name?: string;
  mother_name?: string;
  status: string;
  verification_status?: string;
  documents?: string;
}

interface AdmissionVerifiedTemplateProps {
  data: VerifiedStudentData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function AdmissionVerifiedTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: AdmissionVerifiedTemplateProps) {
  const columns: DocumentTableColumn[] = [
    { key: "applicant_name", label: "Applicant Name", width: "18%" },
    { key: "email", label: "Email", width: "20%" },
    { key: "phone", label: "Phone", width: "14%" },
    { key: "father_name", label: "Father Name", width: "16%" },
    { key: "mother_name", label: "Mother Name", width: "16%" },
    { key: "status", label: "Status", width: "10%" },
    { key: "verification_status", label: "Verification", width: "-1" },
  ];

  return (
    <BaseLetterHead
      title="Verified Students"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Admissions"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Verified Student Details</h3>
      <DocumentTable
        columns={columns}
        rows={data.map((d) => columns.map((c) => (d as any)[c.key]))}
        small
      />

      <div className="border rounded-lg p-3 mt-4 text-center text-xs text-gray-400 italic">
        [Documents Placeholder — Uploaded documents appear here]
      </div>
    </BaseLetterHead>
  );
}
