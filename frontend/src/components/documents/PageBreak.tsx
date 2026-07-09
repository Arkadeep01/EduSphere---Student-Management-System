export function PageBreak() {
  return (
    <div
      className="print:page-break-before-always"
      style={{ pageBreakBefore: "always" }}
    />
  );
}
