import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface SalarySlipData {
  teacherName: string;
  employeeId: string;
  position: string;
  month: string;
  academicSession: string;
  basicSalary: number;
  components: { name: string; amount: number }[];
  bonus: number;
  totalSalary: number;
  paidAt: string;
  receiptNumber: string;
}

interface SalarySlipTemplateProps {
  data: SalarySlipData;
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
}

export function SalarySlipTemplate({ data, generatedBy, generatedDate, generatedTime, academicSession }: SalarySlipTemplateProps) {
  const componentColumns: DocumentTableColumn[] = [
    { key: "name", label: "Component", width: "60%" },
    { key: "amount", label: "Amount (₹)", width: "40%", align: "right" },
  ];

  return (
    <BaseLetterHead
      title={`Salary Slip — ${data.month} ${data.academicSession}`}
      generatedBy={generatedBy}
      generatedDate={generatedDate}
      generatedTime={generatedTime}
      academicSession={academicSession}
      moduleName="Fees"
      totalRecords={1}
      pageOrientation="portrait"
      documentId={data.receiptNumber}
    >
      <div className="border rounded-lg p-4 mb-4 text-sm">
        <div className="grid grid-cols-2 gap-y-1 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Employee Name:</span><span className="font-medium">{data.teacherName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Employee ID:</span><span className="font-medium">{data.employeeId}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Position:</span><span className="font-medium">{data.position}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Month:</span><span className="font-medium">{data.month}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Payment Date:</span><span className="font-medium">{data.paidAt ? new Date(data.paidAt).toLocaleDateString() : "-"}</span></div>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-2">Salary Breakdown</h3>
      <DocumentTable columns={componentColumns} rows={[
        ["Basic Salary", `₹${data.basicSalary.toLocaleString()}`],
        ...data.components.map(c => [c.name, `₹${c.amount.toLocaleString()}`]),
        ...(data.bonus > 0 ? [["Bonus", `₹${data.bonus.toLocaleString()}`]] : []),
      ]} small />

      <div className="border rounded-lg p-3 mt-3 text-xs">
        <div className="flex justify-between font-bold text-sm"><span>Total Salary</span><span>₹{data.totalSalary.toLocaleString()}</span></div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6 italic">This is a computer-generated payslip.</p>
    </BaseLetterHead>
  );
}
