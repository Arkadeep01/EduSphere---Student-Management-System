interface SignatureEntry {
  label: string;
  name?: string;
}

interface SignatureSectionProps {
  entries?: SignatureEntry[];
  date?: string;
}

const DEFAULT_ENTRIES: SignatureEntry[] = [
  { label: "Prepared By" },
  { label: "Verified By" },
  { label: "Principal" },
  { label: "Administrator" },
];

export function SignatureSection({ entries = DEFAULT_ENTRIES, date }: SignatureSectionProps) {
  return (
    <div className="mt-8 border-t border-gray-300 pt-6">
      <div
        className={`grid gap-4 text-sm ${
          entries.length <= 3 ? `grid-cols-${entries.length}` : "grid-cols-4"
        }`}
      >
        {entries.map((entry) => (
          <div key={entry.label} className="text-center">
            {entry.name && <p className="font-medium text-gray-700">{entry.name}</p>}
            <div className="border-t border-gray-400 mt-8 pt-1 text-xs text-gray-500">
              {entry.label}
            </div>
          </div>
        ))}
      </div>
      {date && (
        <p className="text-xs text-gray-500 text-center mt-2">Date: {date}</p>
      )}
    </div>
  );
}
