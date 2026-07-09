import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface ApplicantData {
  applicant_name: string;
  email: string;
  phone?: string;
  father_name?: string;
  mother_name?: string;
  date_of_birth?: string;
  address?: string;
  previous_school?: string;
  previous_board?: string;
  stream?: string;
  entrance_score?: string;
  status: string;
  submitted_at: string;
  documents?: string;
}

interface AdmissionApplicantsTemplateProps {
  data: ApplicantData[];
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  totalRecords: number;
}

export function AdmissionApplicantsTemplate({
  data,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  totalRecords,
}: AdmissionApplicantsTemplateProps) {
  const applicantColumns: DocumentTableColumn[] = [
    { key: "applicant_name", label: "Applicant Name", width: "16%" },
    { key: "email", label: "Email", width: "18%" },
    { key: "phone", label: "Phone", width: "12%" },
    { key: "date_of_birth", label: "DOB", width: "10%" },
    { key: "stream", label: "Stream", width: "12%" },
    { key: "entrance_score", label: "Entrance Score", width: "12%" },
    { key: "status", label: "Status", width: "10%" },
    { key: "submitted_at", label: "Submitted At", width: "10%" },
  ];

  const parentColumns: DocumentTableColumn[] = [
    { key: "father_name", label: "Father Name", width: "30%" },
    { key: "mother_name", label: "Mother Name", width: "30%" },
    { key: "address", label: "Address", width: "40%" },
  ];

  const backgroundColumns: DocumentTableColumn[] = [
    { key: "previous_school", label: "Previous School", width: "35%" },
    { key: "previous_board", label: "Board", width: "25%" },
    { key: "documents", label: "Documents", width: "40%" },
  ];

  function mapRow(d: ApplicantData, cols: DocumentTableColumn[]) {
    return cols.map((c) => (d as any)[c.key]);
  }

  return (
    <BaseLetterHead
      title="Admission Applicants"
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Admissions"
      totalRecords={totalRecords}
      pageOrientation="landscape"
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Applicant Details</h3>
      <DocumentTable columns={applicantColumns} rows={data.map((d) => mapRow(d, applicantColumns))} small />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Parent Details</h3>
      <DocumentTable columns={parentColumns} rows={data.map((d) => mapRow(d, parentColumns))} small />

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-3">Academic Background</h3>
      <DocumentTable columns={backgroundColumns} rows={data.map((d) => mapRow(d, backgroundColumns))} small />
    </BaseLetterHead>
  );
}
