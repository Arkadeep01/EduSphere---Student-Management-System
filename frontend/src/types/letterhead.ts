export interface BrandingConfig {
  schoolName: string;
  shortName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  boardAffiliation: string;
  recognitionNumber: string;
  principalName: string;
  principalSignaturePlaceholder: string;
  registrarSignaturePlaceholder: string;
  officialSealPlaceholder: string;
  qrPlaceholder: string;
  barcodePlaceholder: string;
  documentWatermark: string;
  academicSession: string;
}

export interface LetterheadVersion {
  id: string;
  versionNumber: number;
  letterheadName: string;
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
  updatedAt: string;
  updatedBy: string;
}

export interface Letterhead {
  id: string;
  name: string;
  status: "active" | "archived";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  versions: LetterheadVersion[];
  currentVersion: number;
}

export interface LetterheadFormData {
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
}

export const DEFAULT_BRANDING: BrandingConfig = {
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
};
