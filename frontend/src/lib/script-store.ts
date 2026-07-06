import type { UploadedFileInfo } from "./upload";

export type AnswerScriptEntry = {
  id: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  examName: string;
  subject: string;
  teacher: string;
  file: UploadedFileInfo;
  uploadedAt: string;
  status: "pending" | "evaluating" | "completed";
  marks?: number;
  totalMarks: number;
  remarks?: string;
};

let scripts: AnswerScriptEntry[] = [];

export function getAnswerScripts(): AnswerScriptEntry[] {
  return scripts;
}

export function addAnswerScript(s: AnswerScriptEntry): void {
  scripts = [...scripts, s];
}

export function updateScriptStatus(id: string, status: AnswerScriptEntry["status"], marks?: number, remarks?: string): void {
  scripts = scripts.map(s =>
    s.id === id ? { ...s, status, marks, remarks } : s
  );
}

export function getScriptsByExamAndClass(examName: string, className: string): AnswerScriptEntry[] {
  return scripts.filter(s => s.examName === examName && s.className === className);
}
