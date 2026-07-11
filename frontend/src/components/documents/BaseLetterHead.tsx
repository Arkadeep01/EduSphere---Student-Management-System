import type { ReactNode } from "react";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentMeta } from "./DocumentMeta";
import { DocumentFooter } from "./DocumentFooter";
import type { BrandingConfig } from "@/types/letterhead";

export interface BaseLetterHeadProps {
  title: string;
  children: ReactNode;
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
  moduleName: string;
  totalRecords: number;
  pageOrientation?: "portrait" | "landscape";
  documentId?: string;
  showSignature?: boolean;
  showMeta?: boolean;
  branding?: BrandingConfig;
  primaryColor?: string;
  logoUrl?: string;
}

export function BaseLetterHead({
  title,
  children,
  generatedBy,
  generatedDate,
  generatedTime,
  academicSession,
  moduleName,
  totalRecords,
  pageOrientation = "portrait",
  documentId,
  showSignature = true,
  showMeta = true,
  branding,
  primaryColor,
  logoUrl,
}: BaseLetterHeadProps) {
  const color = primaryColor || "#1e3a5f";
  return (
    <div
      className={`
        document-container mx-auto bg-white
        ${pageOrientation === "landscape" ? "w-[297mm]" : "w-[210mm]"}
      `}
    >
      <div className="min-h-screen flex flex-col p-[15mm] print:p-[15mm]">
        <DocumentHeader
          academicSession={academicSession || branding?.academicSession}
          schoolName={branding?.schoolName}
          schoolAddress={branding?.address}
          schoolPhone={branding?.phone}
          schoolEmail={branding?.email}
          schoolWebsite={branding?.website}
          logoUrl={logoUrl}
          primaryColor={color}
          motto={branding?.motto}
        />

        <div className="border-b-2 my-4" style={{ borderColor: color }} />

        <h1 className="text-xl font-bold text-center mb-4" style={{ color }}>
          {title}
        </h1>

        {showMeta && (
          <DocumentMeta
            title={title}
            generatedBy={generatedBy}
            generatedDate={generatedDate}
            generatedTime={generatedTime}
            academicSession={academicSession || branding?.academicSession}
            moduleName={moduleName}
            totalRecords={totalRecords}
            documentId={documentId}
          />
        )}

        <div className="flex-1">{children}</div>

        {showSignature && (
          <div className="mt-8 border-t border-gray-300 pt-6">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="border-t border-gray-400 mt-8 pt-1 text-xs text-gray-500">Prepared By</div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 mt-8 pt-1 text-xs text-gray-500">Verified By</div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 mt-8 pt-1 text-xs text-gray-500">{branding?.principalName || "Principal"}</div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 mt-8 pt-1 text-xs text-gray-500">Administrator</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Date: {generatedDate}
            </p>
          </div>
        )}

        <DocumentFooter
          generatedDate={generatedDate}
          moduleName={moduleName}
          schoolName={branding?.shortName || branding?.schoolName}
          footerText={branding?.documentWatermark}
        />
      </div>
    </div>
  );
}
