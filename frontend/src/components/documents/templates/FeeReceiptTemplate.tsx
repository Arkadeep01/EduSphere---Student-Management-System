import { BaseLetterHead } from "../BaseLetterHead";
import { DocumentTable, type DocumentTableColumn } from "../DocumentTable";

interface ReceiptData {
  receiptNumber: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  section: string;
  month: string;
  academicSession: string;
  paymentDate: string;
  paymentMethod: string;
  transactionRef: string | null;
  components: { name: string; amount: number }[];
  totalFee: number;
  fine: number;
  gst: number;
  scholarshipAmount: number;
  totalAmount: number;
  advancePayment: number;
}

interface FeeReceiptTemplateProps {
  data: ReceiptData;
  generatedBy: string;
  generatedDate: string;
  generatedTime: string;
  academicSession?: string;
}

export function FeeReceiptTemplate({ data, generatedBy, generatedDate, generatedTime, academicSession }: FeeReceiptTemplateProps) {
  const componentColumns: DocumentTableColumn[] = [
    { key: "name", label: "Fee Component", width: "60%" },
    { key: "amount", label: "Amount (₹)", width: "40%", align: "right" },
  ];

  return (
    <BaseLetterHead
      title={`Payment Receipt — ${data.receiptNumber}`}
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
          <div className="flex justify-between"><span className="text-gray-500">Student Name:</span><span className="font-medium">{data.studentName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Admission No:</span><span className="font-medium">{data.admissionNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Class:</span><span className="font-medium">{data.className}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Section:</span><span className="font-medium">{data.section}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Month:</span><span className="font-medium">{data.month}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Payment Date:</span><span className="font-medium">{data.paymentDate}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Payment Method:</span><span className="font-medium">{data.paymentMethod === "bank_transfer" ? "Bank Transfer" : data.paymentMethod === "cash" ? "Cash" : "Online"}</span></div>
          {data.transactionRef && <div className="flex justify-between"><span className="text-gray-500">Transaction Ref:</span><span className="font-medium">{data.transactionRef}</span></div>}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-1 mt-2">Fee Breakdown</h3>
      <DocumentTable columns={componentColumns} rows={data.components.map(c => [c.name, `₹${c.amount.toLocaleString()}`])} small />

      <div className="border rounded-lg p-3 mt-3 text-xs space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">₹{data.totalFee.toLocaleString()}</span></div>
        {data.fine > 0 && <div className="flex justify-between text-red-600"><span>Late Fine</span><span className="font-medium">+₹{data.fine.toLocaleString()}</span></div>}
        {data.gst > 0 && <div className="flex justify-between"><span>GST</span><span className="font-medium">+₹{data.gst.toLocaleString()}</span></div>}
        {data.scholarshipAmount > 0 && <div className="flex justify-between text-green-600"><span>Scholarship / Concession</span><span className="font-medium">-₹{data.scholarshipAmount.toLocaleString()}</span></div>}
        {data.advancePayment > 0 && <div className="flex justify-between text-blue-600"><span>Advance Payment Adjusted</span><span className="font-medium">-₹{data.advancePayment.toLocaleString()}</span></div>}
        <div className="border-t pt-1 flex justify-between font-bold text-sm"><span>Total Paid</span><span>₹{data.totalAmount.toLocaleString()}</span></div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6 italic">This is a computer-generated receipt and does not require a physical signature.</p>
    </BaseLetterHead>
  );
}
