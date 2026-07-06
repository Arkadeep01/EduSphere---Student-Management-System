import type { UploadedFileInfo } from "./upload";

export type DocumentCategory = "circular" | "notice" | "policy" | "official";

export type AdminDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  file: UploadedFileInfo;
  uploadedAt: string;
  uploadedBy: string;
};

let documents: AdminDocument[] = [];

export function getAdminDocuments(): AdminDocument[] {
  return documents;
}

export function addAdminDocument(doc: AdminDocument): void {
  documents = [...documents, doc];
}

export function replaceAdminDocument(id: string, file: UploadedFileInfo): void {
  documents = documents.map(d =>
    d.id === id ? { ...d, file, uploadedAt: new Date().toISOString() } : d
  );
}

export function deleteAdminDocument(id: string): void {
  documents = documents.filter(d => d.id !== id);
}
