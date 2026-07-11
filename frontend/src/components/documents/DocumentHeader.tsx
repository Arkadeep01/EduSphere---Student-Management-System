interface DocumentHeaderProps {
  academicSession?: string;
  schoolName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolWebsite?: string;
  logoUrl?: string;
  primaryColor?: string;
  motto?: string;
}

export function DocumentHeader({
  academicSession,
  schoolName = "School Name",
  schoolAddress = "Address",
  schoolPhone = "Phone",
  schoolEmail = "Email",
  schoolWebsite = "Website",
  logoUrl,
  primaryColor = "#1e3a5f",
  motto,
}: DocumentHeaderProps) {
  return (
    <div className="flex items-start gap-4 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
      <div className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden bg-white">
        {logoUrl ? (
          <img src={logoUrl} alt={schoolName} className="w-full h-full object-contain" />
        ) : (
          <span className="text-center text-xs text-gray-400 leading-tight">Logo</span>
        )}
      </div>
      <div className="flex-1">
        <h1 className="text-lg font-bold" style={{ color: primaryColor }}>
          {schoolName}
        </h1>
        {motto && <p className="text-xs italic text-gray-500 mt-0.5">{motto}</p>}
        <p className="text-xs text-gray-500 mt-0.5">
          {schoolAddress}{schoolPhone ? ` · ${schoolPhone}` : ""}{schoolEmail ? ` · ${schoolEmail}` : ""}{schoolWebsite ? ` · ${schoolWebsite}` : ""}
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
