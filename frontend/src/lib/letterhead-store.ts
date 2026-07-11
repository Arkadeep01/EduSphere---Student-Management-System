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
    return seedDemoData();
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

export function duplicateLetterhead(id: string): Letterhead | null {
  const items = load();
  const src = items.find(l => l.id === id);
  if (!src) return null;
  const srcVer = src.versions.find(v => v.versionNumber === src.currentVersion);
  if (!srcVer) return null;
  const formData: LetterheadFormData = {
    name: `${src.name} (Copy)`,
    branding: { ...srcVer.branding },
    logoUrl: srcVer.logoUrl,
    letterheadImageUrl: srcVer.letterheadImageUrl,
    footerText: srcVer.footerText,
    watermarkText: srcVer.watermarkText,
    headerSpacing: srcVer.headerSpacing,
    footerSpacing: srcVer.footerSpacing,
    leftMargin: srcVer.leftMargin,
    rightMargin: srcVer.rightMargin,
    primaryColor: srcVer.primaryColor,
    secondaryColor: srcVer.secondaryColor,
    signaturePlaceholder: srcVer.signaturePlaceholder,
    schoolSealPlaceholder: srcVer.schoolSealPlaceholder,
  };
  return addLetterhead(formData, "Duplicated");
}

function seedDemoData(): Letterhead[] {
  const lh1 = createLetterheadFromData({
    name: "Official EduSphere Letterhead",
    branding: {
      schoolName: "EduSphere International School",
      shortName: "EIS",
      motto: "Empowering Minds, Shaping Futures",
      address: "123 Education Lane, Knowledge City, KC 10001",
      phone: "+1 (555) 123-4567",
      email: "info@edusphere.edu",
      website: "www.edusphere.edu",
      boardAffiliation: "Central Board of Secondary Education",
      recognitionNumber: "CBSE/12345/2024",
      principalName: "Dr. Sarah Johnson",
      principalSignaturePlaceholder: "Dr. Sarah Johnson\nPrincipal",
      registrarSignaturePlaceholder: "Mr. Robert Chen\nRegistrar",
      officialSealPlaceholder: "School Seal",
      qrPlaceholder: "",
      barcodePlaceholder: "",
      documentWatermark: "CONFIDENTIAL",
      academicSession: "2025-2026",
    },
    logoUrl: "",
    letterheadImageUrl: "",
    footerText: "This is a computer-generated document. No signature is required.",
    watermarkText: "CONFIDENTIAL",
    headerSpacing: 4, footerSpacing: 4, leftMargin: 15, rightMargin: 15,
    primaryColor: "#1e3a5f", secondaryColor: "#475569",
    signaturePlaceholder: "Authorized Signatory",
    schoolSealPlaceholder: "School Seal",
    isDefault: true,
  });

  const lh2 = createLetterheadFromData({
    name: "Blue Academic Letterhead",
    branding: {
      schoolName: "EduSphere International School",
      shortName: "EIS",
      motto: "Excellence in Education",
      address: "456 Academic Drive, University Town, UT 20002",
      phone: "+1 (555) 234-5678",
      email: "academics@edusphere.edu",
      website: "www.edusphere.edu",
      boardAffiliation: "Central Board of Secondary Education",
      recognitionNumber: "CBSE/12345/2024",
      principalName: "Dr. Sarah Johnson",
      principalSignaturePlaceholder: "Dr. Sarah Johnson\nPrincipal",
      registrarSignaturePlaceholder: "Mr. Robert Chen\nRegistrar",
      officialSealPlaceholder: "Academic Seal",
      qrPlaceholder: "",
      barcodePlaceholder: "",
      documentWatermark: "ACADEMIC DOCUMENT",
      academicSession: "2025-2026",
    },
    logoUrl: "", letterheadImageUrl: "",
    footerText: "Knowledge is Power",
    watermarkText: "ACADEMIC",
    headerSpacing: 5, footerSpacing: 4, leftMargin: 18, rightMargin: 18,
    primaryColor: "#1565C0", secondaryColor: "#64B5F6",
    signaturePlaceholder: "Academic Coordinator",
    schoolSealPlaceholder: "Academic Seal",
    isDefault: false,
  });

  const lh3 = createLetterheadFromData({
    name: "Minimal Administrative Letterhead",
    branding: {
      schoolName: "EduSphere International School",
      shortName: "EIS",
      motto: "Efficiency Through Simplicity",
      address: "789 Admin Plaza, Governance City, GC 30003",
      phone: "+1 (555) 345-6789",
      email: "admin@edusphere.edu",
      website: "www.edusphere.edu",
      boardAffiliation: "Central Board of Secondary Education",
      recognitionNumber: "CBSE/12345/2024",
      principalName: "Dr. Sarah Johnson",
      principalSignaturePlaceholder: "Dr. Sarah Johnson\nPrincipal",
      registrarSignaturePlaceholder: "Mr. Robert Chen\nRegistrar",
      officialSealPlaceholder: "Administrative Seal",
      qrPlaceholder: "",
      barcodePlaceholder: "",
      documentWatermark: "ADMINISTRATIVE",
      academicSession: "2025-2026",
    },
    logoUrl: "", letterheadImageUrl: "",
    footerText: "Streamlined Administrative Communication",
    watermarkText: "ADMIN",
    headerSpacing: 3, footerSpacing: 3, leftMargin: 20, rightMargin: 20,
    primaryColor: "#37474F", secondaryColor: "#78909C",
    signaturePlaceholder: "Administrative Officer",
    schoolSealPlaceholder: "Admin Seal",
    isDefault: false,
  });

  const lh4 = createLetterheadFromData({
    name: "Examination Department Letterhead",
    branding: {
      schoolName: "EduSphere International School",
      shortName: "EIS",
      motto: "Fair Assessment, Bright Future",
      address: "101 Exam Tower, Assessment City, AC 40004",
      phone: "+1 (555) 456-7890",
      email: "exams@edusphere.edu",
      website: "www.edusphere.edu",
      boardAffiliation: "Central Board of Secondary Education",
      recognitionNumber: "CBSE/12345/2024",
      principalName: "Dr. Sarah Johnson",
      principalSignaturePlaceholder: "Dr. Sarah Johnson\nPrincipal",
      registrarSignaturePlaceholder: "Mr. Robert Chen\nRegistrar",
      officialSealPlaceholder: "Examination Seal",
      qrPlaceholder: "",
      barcodePlaceholder: "",
      documentWatermark: "EXAMINATION DOCUMENT",
      academicSession: "2025-2026",
    },
    logoUrl: "", letterheadImageUrl: "",
    footerText: "Examination Branch - Official Communication",
    watermarkText: "EXAMINATION",
    headerSpacing: 4, footerSpacing: 5, leftMargin: 15, rightMargin: 15,
    primaryColor: "#C62828", secondaryColor: "#E53935",
    signaturePlaceholder: "Exam Controller",
    schoolSealPlaceholder: "Exam Seal",
    isDefault: false,
  });

  const lh5 = createLetterheadFromData({
    name: "Finance & Accounts Letterhead",
    branding: {
      schoolName: "EduSphere International School",
      shortName: "EIS",
      motto: "Transparency in Financial Management",
      address: "202 Finance Wing, Treasury Road, FC 50005",
      phone: "+1 (555) 567-8901",
      email: "finance@edusphere.edu",
      website: "www.edusphere.edu",
      boardAffiliation: "Central Board of Secondary Education",
      recognitionNumber: "CBSE/12345/2024",
      principalName: "Dr. Sarah Johnson",
      principalSignaturePlaceholder: "Dr. Sarah Johnson\nPrincipal",
      registrarSignaturePlaceholder: "Mr. Robert Chen\nRegistrar",
      officialSealPlaceholder: "Finance Seal",
      qrPlaceholder: "",
      barcodePlaceholder: "",
      documentWatermark: "FINANCIAL DOCUMENT",
      academicSession: "2025-2026",
    },
    logoUrl: "", letterheadImageUrl: "",
    footerText: "Finance Department - Official Financial Records",
    watermarkText: "FINANCE",
    headerSpacing: 4, footerSpacing: 4, leftMargin: 15, rightMargin: 15,
    primaryColor: "#2E7D32", secondaryColor: "#66BB6A",
    signaturePlaceholder: "Finance Officer",
    schoolSealPlaceholder: "Finance Seal",
    isDefault: false,
  });

  const lh6 = createLetterheadFromData({
    name: "Admission Office Letterhead",
    branding: {
      schoolName: "EduSphere International School",
      shortName: "EIS",
      motto: "Opening Doors to Opportunities",
      address: "303 Admission Gate, Welcome Avenue, AW 60006",
      phone: "+1 (555) 678-9012",
      email: "admissions@edusphere.edu",
      website: "www.edusphere.edu",
      boardAffiliation: "Central Board of Secondary Education",
      recognitionNumber: "CBSE/12345/2024",
      principalName: "Dr. Sarah Johnson",
      principalSignaturePlaceholder: "Dr. Sarah Johnson\nPrincipal",
      registrarSignaturePlaceholder: "Mr. Robert Chen\nRegistrar",
      officialSealPlaceholder: "Admission Seal",
      qrPlaceholder: "",
      barcodePlaceholder: "",
      documentWatermark: "ADMISSION DOCUMENT",
      academicSession: "2025-2026",
    },
    logoUrl: "", letterheadImageUrl: "",
    footerText: "Admission Office - Your Journey Begins Here",
    watermarkText: "ADMISSION",
    headerSpacing: 4, footerSpacing: 4, leftMargin: 15, rightMargin: 15,
    primaryColor: "#6A1B9A", secondaryColor: "#AB47BC",
    signaturePlaceholder: "Admission Officer",
    schoolSealPlaceholder: "Admission Seal",
    isDefault: false,
  });

  const result = [lh1, lh2, lh3, lh4, lh5, lh6];
  save(result);
  return result;
}

function createLetterheadFromData(data: {
  name: string;
  branding: BrandingConfig;
  logoUrl: string;
  letterheadImageUrl: string;
  footerText: string;
  watermarkText: string;
  headerSpacing: number;
  footerSpacing: number;
  leftMargin: number;
  rightMargin: number;
  primaryColor: string;
  secondaryColor: string;
  signaturePlaceholder: string;
  schoolSealPlaceholder: string;
  isDefault: boolean;
}): Letterhead {
  const formData: LetterheadFormData = {
    name: data.name,
    branding: data.branding,
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
  };
  const version = makeVersion(formData, 1, "System");
  return {
    id: `lh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    status: "active",
    isDefault: data.isDefault,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [version],
    currentVersion: 1,
  };
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
