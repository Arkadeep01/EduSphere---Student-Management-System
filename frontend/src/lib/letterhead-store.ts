import type { Letterhead, LetterheadFormData, BrandingConfig, LetterheadVersion } from "@/types/letterhead";
import { DEFAULT_BRANDING } from "@/types/letterhead";

const STORAGE_KEY = "edusphere_letterheads";

function load(): Letterhead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return [];
}

function save(items: Letterhead[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function makeVersion(data: LetterheadFormData, versionNumber: number, updatedBy: string): LetterheadVersion {
  return {
    id: `ver_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    versionNumber,
    letterheadName: data.name,
    branding: { ...data.branding },
    logoUrl: data.logoUrl,
    letterheadImageUrl: data.letterheadImageUrl,
    footerText: data.footerText,
    watermarkText: data.watermarkText,
    headerSpacing: data.headerSpacing,
    footerSpacing: data.footerSpacing,
    leftMargin: data.leftMargin,
    rightMargin: data.rightMargin,
    primaryColor: data.primaryColor,
    secondaryColor: data.secondaryColor,
    signaturePlaceholder: data.signaturePlaceholder,
    schoolSealPlaceholder: data.schoolSealPlaceholder,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
}

export function getLetterheads(): Letterhead[] {
  const items = load();
  if (items.length === 0) {
    const defaultLH = createDefaultLetterhead();
    return [defaultLH];
  }
  return items;
}

export function getDefaultLetterhead(): Letterhead | null {
  const items = load();
  return items.find(l => l.isDefault && l.status === "active") || items.find(l => l.status === "active") || null;
}

export function getDefaultBranding(): BrandingConfig | null {
  const lh = getDefaultLetterhead();
  if (!lh) return null;
  const ver = lh.versions.find(v => v.versionNumber === lh.currentVersion);
  return ver?.branding || null;
}

function createDefaultLetterhead(): Letterhead {
  const formData: LetterheadFormData = {
    name: "Default Letterhead",
    branding: { ...DEFAULT_BRANDING },
    logoUrl: "",
    letterheadImageUrl: "",
    footerText: "This is a computer-generated document. No signature is required.",
    watermarkText: "",
    headerSpacing: 4,
    footerSpacing: 4,
    leftMargin: 15,
    rightMargin: 15,
    primaryColor: "#1e3a5f",
    secondaryColor: "#475569",
    signaturePlaceholder: "Authorized Signatory",
    schoolSealPlaceholder: "School Seal",
  };
  const version = makeVersion(formData, 1, "System");
  const letterhead: Letterhead = {
    id: `lh_default_${Date.now()}`,
    name: "Default Letterhead",
    status: "active",
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [version],
    currentVersion: 1,
  };
  save([letterhead]);
  return letterhead;
}

export function addLetterhead(data: LetterheadFormData, createdBy: string): Letterhead {
  const items = load();
  const version = makeVersion(data, 1, createdBy);
  const letterhead: Letterhead = {
    id: `lh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    status: "active",
    isDefault: items.length === 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [version],
    currentVersion: 1,
  };
  items.push(letterhead);
  save(items);
  return letterhead;
}

export function updateLetterhead(
  id: string,
  data: LetterheadFormData,
  updatedBy: string,
): Letterhead | null {
  const items = load();
  const idx = items.findIndex(l => l.id === id);
  if (idx === -1) return null;
  const lh = items[idx];
  const nextVersion = lh.currentVersion + 1;
  const version = makeVersion(data, nextVersion, updatedBy);
  lh.versions.push(version);
  lh.currentVersion = nextVersion;
  lh.name = data.name;
  lh.updatedAt = new Date().toISOString();
  items[idx] = lh;
  save(items);
  return lh;
}

export function setDefaultLetterhead(id: string): void {
  const items = load();
  for (const lh of items) {
    lh.isDefault = lh.id === id;
  }
  save(items);
}

export function archiveLetterhead(id: string): void {
  const items = load();
  const lh = items.find(l => l.id === id);
  if (lh) {
    lh.status = "archived";
    if (lh.isDefault) lh.isDefault = false;
    save(items);
  }
}

export function restoreLetterhead(id: string): void {
  const items = load();
  const lh = items.find(l => l.id === id);
  if (lh) {
    lh.status = "active";
    save(items);
  }
}

export function deleteLetterhead(id: string): void {
  let items = load();
  items = items.filter(l => l.id !== id);
  save(items);
}

export function restoreVersion(letterheadId: string, versionId: string): Letterhead | null {
  const items = load();
  const lh = items.find(l => l.id === letterheadId);
  if (!lh) return null;
  const ver = lh.versions.find(v => v.id === versionId);
  if (!ver) return null;

  const formData: LetterheadFormData = {
    name: ver.letterheadName,
    branding: ver.branding,
    logoUrl: ver.logoUrl,
    letterheadImageUrl: ver.letterheadImageUrl,
    footerText: ver.footerText,
    watermarkText: ver.watermarkText,
    headerSpacing: ver.headerSpacing,
    footerSpacing: ver.footerSpacing,
    leftMargin: ver.leftMargin,
    rightMargin: ver.rightMargin,
    primaryColor: ver.primaryColor,
    secondaryColor: ver.secondaryColor,
    signaturePlaceholder: ver.signaturePlaceholder,
    schoolSealPlaceholder: ver.schoolSealPlaceholder,
  };
  return updateLetterhead(letterheadId, formData, "System (Version Restore)");
}
