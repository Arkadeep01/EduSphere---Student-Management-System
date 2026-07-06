import type { ChapterResource } from "./mock-data";

export type SharedResource = ChapterResource & {
  fileUrl?: string;
  uploadedAt?: string;
  assignedClasses?: string[];
  uploadedBy?: string;
  subject?: string;
};

let sharedResources: SharedResource[] = [];

export function getSharedResources(): SharedResource[] {
  return [...sharedResources];
}

export function addSharedResource(r: SharedResource): void {
  sharedResources = [r, ...sharedResources];
}

export function updateSharedResource(id: string, r: Partial<SharedResource>): void {
  sharedResources = sharedResources.map(ex =>
    ex.id === id ? { ...ex, ...r } : ex
  );
}

export function removeSharedResource(id: string): void {
  sharedResources = sharedResources.filter(ex => ex.id !== id);
}

export function getResourcesBySubject(subjectName: string, studentClass?: string): SharedResource[] {
  return sharedResources.filter(r => {
    const matchesSubject = r.subject
      ? r.subject.toLowerCase() === subjectName.toLowerCase()
      : r.title.toLowerCase().includes(subjectName.toLowerCase().split(" ").slice(0, 2).join(" "));
    if (!matchesSubject) return false;
    if (!r.assignedClasses || r.assignedClasses.length === 0) return true;
    if (studentClass && r.assignedClasses.includes(studentClass)) return true;
    return false;
  });
}
