interface DocumentTableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
}

interface DocumentTableProps {
  columns: DocumentTableColumn[];
  rows: (string | number | null | undefined)[][];
  caption?: string;
  striped?: boolean;
  bordered?: boolean;
  small?: boolean;
}

export function DocumentTable({
  columns,
  rows,
  caption,
  striped = true,
  bordered = false,
  small = false,
}: DocumentTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={`
          w-full border-collapse
          ${small ? "text-[9px]" : "text-[10px]"}
        `}
      >
        {caption && (
          <caption className="text-xs text-gray-500 text-left mb-1 italic">
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  bg-[#2563EB] text-white font-semibold
                  ${small ? "py-1 px-1.5" : "py-1.5 px-2"}
                  ${bordered ? "border border-[#1d4ed8]" : ""}
                  ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}
                `}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`
                ${striped && rowIdx % 2 === 1 ? "bg-gray-50" : "bg-white"}
                ${bordered ? "" : "border-b border-gray-200"}
              `}
            >
              {row.map((cell, colIdx) => (
                <td
                  key={colIdx}
                  className={`
                    ${small ? "py-1 px-1.5" : "py-1.5 px-2"}
                    ${bordered ? "border border-gray-300" : ""}
                    ${columns[colIdx]?.align === "center" ? "text-center" : columns[colIdx]?.align === "right" ? "text-right" : "text-left"}
                  `}
                >
                  {cell ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { DocumentTableColumn };
