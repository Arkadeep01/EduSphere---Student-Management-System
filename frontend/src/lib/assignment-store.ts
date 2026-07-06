export interface SubmittedFileEntry {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  dataUrl: string;
}

export interface SubmissionEntry {
  id: string;
  assignmentTitle: string;
  className: string;
  studentId: string;
  studentName: string;
  files: SubmittedFileEntry[];
  status: "pending" | "submitted" | "evaluated" | "late";
  marks: number | null;
  totalMarks: number | null;
  remarks: string;
  submittedAt: string | null;
  evaluatedAt: string | null;
}

const store: Record<string, Record<string, Record<string, SubmissionEntry>>> = {};

export function addSubmission(
  assignmentTitle: string,
  className: string,
  studentId: string,
  studentName: string,
  files: SubmittedFileEntry[],
  totalMarks: number,
): SubmissionEntry {
  if (!store[assignmentTitle]) store[assignmentTitle] = {};
  if (!store[assignmentTitle][className]) store[assignmentTitle][className] = {};

  const existing = store[assignmentTitle][className][studentId];
  const mergedFiles = existing ? [...existing.files, ...files] : files;

  const submission: SubmissionEntry = {
    id: `shared_sub_${Date.now()}`,
    assignmentTitle,
    className,
    studentId,
    studentName,
    files: mergedFiles,
    status: "submitted",
    marks: null,
    totalMarks,
    remarks: "",
    submittedAt: new Date().toISOString(),
    evaluatedAt: null,
  };

  store[assignmentTitle][className][studentId] = submission;
  return submission;
}

export function getSubmissions(
  assignmentTitle: string,
  className: string,
): Record<string, SubmissionEntry> {
  return store[assignmentTitle]?.[className] || {};
}

export function getSubmission(
  assignmentTitle: string,
  className: string,
  studentId: string,
): SubmissionEntry | null {
  return store[assignmentTitle]?.[className]?.[studentId] || null;
}

export function updateMarks(
  assignmentTitle: string,
  className: string,
  studentId: string,
  marks: number,
  totalMarks: number,
  remarks: string,
): void {
  const sub = store[assignmentTitle]?.[className]?.[studentId];
  if (!sub) return;
  sub.status = "evaluated";
  sub.marks = marks;
  sub.totalMarks = totalMarks;
  sub.remarks = remarks;
  sub.evaluatedAt = new Date().toISOString();
}

export function removeFile(
  assignmentTitle: string,
  className: string,
  studentId: string,
  fileId: string,
): void {
  const sub = store[assignmentTitle]?.[className]?.[studentId];
  if (!sub) return;
  sub.files = sub.files.filter(f => f.id !== fileId);
  if (sub.files.length === 0) {
    sub.status = "pending";
    sub.submittedAt = null;
  }
}
