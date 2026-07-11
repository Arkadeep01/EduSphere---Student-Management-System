import { BaseLetterHead } from "./BaseLetterHead";
import type { LetterheadFormData } from "@/types/letterhead";

interface LetterheadPreviewProps {
  formData: LetterheadFormData;
}

export function LetterheadPreview({ formData }: LetterheadPreviewProps) {
  return (
    <div className="transform scale-[0.6] origin-top-left" style={{ width: "166.6%" }}>
      <BaseLetterHead
        title="Document Title"
        generatedBy="Administrator"
        generatedDate={new Date().toLocaleDateString()}
        generatedTime={new Date().toLocaleTimeString()}
        academicSession={formData.branding.academicSession}
        moduleName="Preview"
        totalRecords={0}
        pageOrientation="portrait"
        branding={formData.branding}
        primaryColor={formData.primaryColor}
        logoUrl={formData.logoUrl}
      >
        <div className="p-4 text-sm space-y-3">
          <p>This is a sample document preview showing how the letterhead will appear on generated documents.</p>
          <p>The school branding, colors, and layout are rendered dynamically from the letterhead configuration.</p>
          <table className="w-full border-collapse border border-gray-300 text-xs mt-4">
            <thead>
              <tr className="text-white" style={{ backgroundColor: formData.primaryColor }}>
                <th className="border border-gray-300 p-2 text-left">#</th>
                <th className="border border-gray-300 p-2 text-left">Name</th>
                <th className="border border-gray-300 p-2 text-left">Class</th>
                <th className="border border-gray-300 p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map(i => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="border border-gray-300 p-2">{i}</td>
                  <td className="border border-gray-300 p-2">Student {i}</td>
                  <td className="border border-gray-300 p-2">Class {10 - i}</td>
                  <td className="border border-gray-300 p-2">
                    <span className="text-green-600">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BaseLetterHead>
    </div>
  );
}
