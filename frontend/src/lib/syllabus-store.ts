export interface SyllabusEntry {
  subjectCode: string;
  subjectName: string;
  className: string;
  chapterId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

const store: Record<string, SyllabusEntry> = {};

function key(subjectCode: string, className: string, chapterId: string): string {
  return `${subjectCode}::${className}::${chapterId}`;
}

export function setSyllabus(entry: SyllabusEntry): void {
  store[key(entry.subjectCode, entry.className, entry.chapterId)] = entry;
}

export function getSyllabus(subjectCode: string, className: string, chapterId: string): SyllabusEntry | null {
  return store[key(subjectCode, className, chapterId)] || null;
}

export function getSyllabusForStudent(subjectCode: string, className: string): SyllabusEntry | null {
  const entries = Object.values(store).filter(
    e => e.subjectCode === subjectCode && e.className === className
  );
  if (entries.length === 0) return null;
  return entries.reduce((latest, e) =>
    e.uploadedAt > latest.uploadedAt ? e : latest
  );
}

export function getAllSyllabusForClass(className: string): SyllabusEntry[] {
  return Object.values(store).filter(e => e.className === className);
}
