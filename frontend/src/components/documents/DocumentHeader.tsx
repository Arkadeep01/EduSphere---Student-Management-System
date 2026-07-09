interface DocumentHeaderProps {
  academicSession?: string;
}

export function DocumentHeader({ academicSession }: DocumentHeaderProps) {
  return (
    <div className="flex items-start gap-4 border-b-2 border-[#1e3a5f] pb-4">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 shrink-0 border">
        <span className="text-center leading-tight">Logo</span>
      </div>
      <div className="flex-1">
        <h1 className="text-lg font-bold text-[#1e3a5f]">
          EduSphere Student Management System
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">School Name Placeholder</p>
        <p className="text-xs text-gray-500 mt-0.5">
          School Address · Phone Number · Email · Website
        </p>
        {academicSession && (
          <p className="text-xs text-gray-500 mt-0.5">
            Academic Session: {academicSession}
          </p>
        )}
      </div>
    </div>
  );
}
