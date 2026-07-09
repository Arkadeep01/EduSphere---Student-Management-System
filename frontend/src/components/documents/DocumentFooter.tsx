interface DocumentFooterProps {
  generatedDate: string;
  moduleName: string;
}

export function DocumentFooter({ generatedDate, moduleName }: DocumentFooterProps) {
  return (
    <div className="mt-6 pt-3 border-t border-gray-300 text-xs text-gray-500">
      <div className="flex justify-between items-center">
        <span>Generated using EduSphere</span>
        <span className="font-medium">Confidential Document</span>
        <span className="print:block hidden">Page <span className="page-number" /></span>
      </div>
      <p className="text-center mt-1">
        &copy; {new Date().getFullYear()} EduSphere. All rights reserved.
      </p>
      <p className="text-center text-gray-400 mt-0.5">
        {moduleName} Report — Generated {generatedDate}
      </p>
    </div>
  );
}
