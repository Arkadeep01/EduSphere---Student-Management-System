export interface UploadedFileInfo {
  id: string;
  filename: string;
  original_name: string;
  extension: string;
  size: number;
  uploaded_at: string;
  uploaded_by: string;
  download_url: string;
  preview_url: string;
}

export const ALLOWED_DOCUMENT_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];
export const ALLOWED_ASSIGNMENT_TYPES = [".pdf", ".ppt", ".pptx"];
export const ALLOWED_RESOURCE_TYPES = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".mp4", ".zip"];
export const ALLOWED_IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
export const ALLOWED_SCRIPT_TYPES = [".pdf"];

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_RESOURCE_SIZE_MB = 100;
export const MAX_RESOURCE_SIZE_BYTES = MAX_RESOURCE_SIZE_MB * 1024 * 1024;
export const MAX_SCRIPT_SIZE_MB = 50;
export const MAX_SCRIPT_SIZE_BYTES = MAX_SCRIPT_SIZE_MB * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileExtension(filename: string): string {
  return "." + filename.split(".").pop()?.toLowerCase() || "";
}

export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeBytes: number,
): string | null {
  const ext = getFileExtension(file.name);
  if (!allowedTypes.includes(ext)) {
    return `"${file.name}": unsupported format. Allowed: ${allowedTypes.join(", ")}`;
  }
  if (file.size > maxSizeBytes) {
    const maxMB = Math.floor(maxSizeBytes / (1024 * 1024));
    return `"${file.name}": exceeds ${maxMB} MB limit`;
  }
  return null;
}

export function generateMockUploadResponse(file: File, uploadedBy: string = "current_user"): UploadedFileInfo {
  return {
    id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    filename: file.name,
    original_name: file.name,
    extension: getFileExtension(file.name),
    size: file.size,
    uploaded_at: new Date().toISOString(),
    uploaded_by: uploadedBy,
    download_url: URL.createObjectURL(file),
    preview_url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
  };
}

export interface AdmissionDocEntry {
  id: string;
  label: string;
  file: UploadedFileInfo | null;
  verified: boolean;
}

export function createAdmissionDocEntries(labels: string[]): AdmissionDocEntry[] {
  return labels.map(label => ({
    id: `adm_doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    label,
    file: null,
    verified: false,
  }));
}
