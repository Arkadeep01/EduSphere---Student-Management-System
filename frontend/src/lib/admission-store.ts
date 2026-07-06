import type { UploadedFileInfo } from "./upload";
import type { AdmissionDocEntry } from "./upload";

export type AdmissionApplication = {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  phoneNumber: string;
  address: string;
  guardianName: string;
  guardianRelationship: string;
  previousSchool: string;
  board: string;
  stream: string;
  marks: { subject: string; pass: number; obtained: number; total: number }[];
  photoFile: UploadedFileInfo | null;
  documents: AdmissionDocEntry[];
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
};

let applications: AdmissionApplication[] = [];

export function getAdmissionApplications(): AdmissionApplication[] {
  return applications;
}

export function addAdmissionApplication(app: AdmissionApplication): void {
  applications = [...applications, app];
}

export function updateAdmissionStatus(id: string, status: AdmissionApplication["status"]): void {
  applications = applications.map(a =>
    a.id === id ? { ...a, status } : a
  );
}

export function updateDocumentVerification(applicationId: string, docId: string, verified: boolean): void {
  applications = applications.map(a =>
    a.id === applicationId
      ? { ...a, documents: a.documents.map(d => d.id === docId ? { ...d, verified } : d) }
      : a
  );
}
