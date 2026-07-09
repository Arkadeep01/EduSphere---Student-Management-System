import type { ReactNode } from "react";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentMeta } from "./DocumentMeta";
import { DocumentFooter } from "./DocumentFooter";

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
}: BaseLetterHeadProps) {
  return (
    <div
      className={`
        document-container mx-auto bg-white
        ${pageOrientation === "landscape" ? "w-[297mm]" : "w-[210mm]"}
      `}
    >
      <div className="min-h-screen flex flex-col p-[15mm] print:p-[15mm]">
        <DocumentHeader academicSession={academicSession} />

        <div className="border-b-2 border-[#1e3a5f] my-4" />

        <h1 className="text-xl font-bold text-[#1e3a5f] text-center mb-4">
          {title}
        </h1>

        {showMeta && (
          <DocumentMeta
            title={title}
            generatedBy={generatedBy}
            generatedDate={generatedDate}
            generatedTime={generatedTime}
            academicSession={academicSession}
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
                <div className="border-t border-gray-400 mt-8 pt-1 text-xs text-gray-500">Principal</div>
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

        <DocumentFooter generatedDate={generatedDate} moduleName={moduleName} />
      </div>
    </div>
  );
}
