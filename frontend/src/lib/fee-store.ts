export type FeeComponentName =
  | "Admission Fee"
  | "Tuition Fee"
  | "Examination Fee"
  | "Library Fee"
  | "Laboratory Fee"
  | "Computer Fee"
  | "Sports Fee"
  | "Activity Fee"
  | "Development Fee"
  | "Transport Fee"
  | "Hostel Fee"
  | "Smart Class Fee"
  | "Annual Charges"
  | "Miscellaneous";

export interface FeeComponent {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "annual" | "one-time";
  isOptional: boolean;
  isActive: boolean;
}

export interface FeeStructure {
  id: string;
  className: string;
  academicSession: string;
  components: FeeComponent[];
  totalMonthly: number;
  totalAnnual: number;
  lateFinePerDay: number;
  gstEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipOrConcession {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  type: "percentage" | "fixed";
  value: number;
  reason: string;
  approvedBy: string;
  approvedAt: string;
  isActive: boolean;
  history: { action: string; timestamp: string; admin: string }[];
}

export type PaymentMethod = "bank_transfer" | "cash" | "online";
export type PaymentStatus = "not_paid" | "pending_verification" | "paid" | "rejected";
export type RefundStatus = "none" | "initiated" | "completed";

export interface FeePayment {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  admissionNumber: string;
  month: string;
  academicSession: string;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  fine: number;
  gst: number;
  scholarshipAmount: number;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  transactionRef: string | null;
  paidAt: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  receiptNumber: string | null;
  components: { name: string; amount: number }[];
  advancePayment: number;
  refundStatus: RefundStatus;
  refundInitiatedAt: string | null;
  refundCompletedAt: string | null;
}

export interface AdmissionFeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  stream: string;
  optionalSubjects: string[];
  admissionFee: number;
  amountPaid: number;
  paymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  transactionRef: string | null;
  verificationStatus: "not_paid" | "pending_verification" | "paid";
  receiptNumber: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
}

export interface SalaryComponent {
  name: string;
  amount: number;
}

export interface TeacherSalary {
  id: string;
  teacherId: string;
  teacherName: string;
  employeeId: string;
  position: string;
  month: string;
  academicSession: string;
  basicSalary: number;
  components: SalaryComponent[];
  bonus: number;
  totalSalary: number;
  paymentMethod: "bank_transfer";
  paidAt: string | null;
  receiptNumber: string | null;
  isPaid: boolean;
}

export interface FinanceActivityLog {
  id: string;
  action: string;
  admin: string;
  student: string | null;
  amount: number;
  timestamp: string;
}

export interface DueDateCalendar {
  className: string;
  dueDate: string;
  month: string;
  totalStudents: number;
  paidCount: number;
  pendingCount: number;
}

let feeStructures: FeeStructure[] = [
  {
    id: "fs_1",
    className: "9",
    academicSession: "2026-27",
    components: [
      { id: "fc_1", name: "Tuition Fee", amount: 3500, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_2", name: "Library Fee", amount: 200, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_3", name: "Laboratory Fee", amount: 300, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_4", name: "Sports Fee", amount: 150, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_5", name: "Transport Fee", amount: 500, frequency: "monthly", isOptional: true, isActive: true },
      { id: "fc_6", name: "Annual Charges", amount: 2400, frequency: "annual", isOptional: false, isActive: true },
    ],
    totalMonthly: 4650,
    totalAnnual: 58200,
    lateFinePerDay: 50,
    gstEnabled: false,
    isActive: true,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "fs_2",
    className: "10",
    academicSession: "2026-27",
    components: [
      { id: "fc_7", name: "Tuition Fee", amount: 4000, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_8", name: "Library Fee", amount: 200, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_9", name: "Laboratory Fee", amount: 350, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_10", name: "Examination Fee", amount: 500, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_11", name: "Computer Fee", amount: 300, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_12", name: "Sports Fee", amount: 150, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_13", name: "Transport Fee", amount: 500, frequency: "monthly", isOptional: true, isActive: true },
      { id: "fc_14", name: "Annual Charges", amount: 2400, frequency: "annual", isOptional: false, isActive: true },
    ],
    totalMonthly: 5500,
    totalAnnual: 68400,
    lateFinePerDay: 50,
    gstEnabled: false,
    isActive: true,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "fs_3",
    className: "11",
    academicSession: "2026-27",
    components: [
      { id: "fc_15", name: "Tuition Fee", amount: 4500, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_16", name: "Library Fee", amount: 250, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_17", name: "Laboratory Fee", amount: 400, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_18", name: "Computer Fee", amount: 350, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_19", name: "Examination Fee", amount: 600, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_20", name: "Smart Class Fee", amount: 200, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_21", name: "Hostel Fee", amount: 3000, frequency: "monthly", isOptional: true, isActive: true },
      { id: "fc_22", name: "Annual Charges", amount: 3000, frequency: "annual", isOptional: false, isActive: true },
    ],
    totalMonthly: 6300,
    totalAnnual: 78600,
    lateFinePerDay: 75,
    gstEnabled: false,
    isActive: true,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "fs_4",
    className: "12",
    academicSession: "2026-27",
    components: [
      { id: "fc_23", name: "Tuition Fee", amount: 5000, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_24", name: "Library Fee", amount: 250, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_25", name: "Laboratory Fee", amount: 450, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_26", name: "Computer Fee", amount: 350, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_27", name: "Examination Fee", amount: 700, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_28", name: "Smart Class Fee", amount: 200, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_29", name: "Development Fee", amount: 300, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_30", name: "Activity Fee", amount: 200, frequency: "monthly", isOptional: false, isActive: true },
      { id: "fc_31", name: "Transport Fee", amount: 500, frequency: "monthly", isOptional: true, isActive: true },
      { id: "fc_32", name: "Hostel Fee", amount: 3000, frequency: "monthly", isOptional: true, isActive: true },
      { id: "fc_33", name: "Annual Charges", amount: 3600, frequency: "annual", isOptional: false, isActive: true },
    ],
    totalMonthly: 7450,
    totalAnnual: 93000,
    lateFinePerDay: 75,
    gstEnabled: false,
    isActive: true,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
];

let feePayments: FeePayment[] = [];
let admissionFeeRecords: AdmissionFeeRecord[] = [];
let scholarships: ScholarshipOrConcession[] = [];
let teacherSalaries: TeacherSalary[] = [];
let activityLog: FinanceActivityLog[] = [];

const CURRENT_SESSION = "2026-27";
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

const STUDENT_NAMES_BY_CLASS: Record<string, { id: string; name: string; section: string; admissionNumber: string }[]> = {
  "9": [
    { id: "STU9_1", name: "Mia Davis", section: "A", admissionNumber: "ADM24001" },
    { id: "STU9_2", name: "Lucas Martin", section: "A", admissionNumber: "ADM24002" },
    { id: "STU9_3", name: "Isabella Lee", section: "B", admissionNumber: "ADM24003" },
    { id: "STU9_4", name: "Mason Rodriguez", section: "B", admissionNumber: "ADM24004" },
  ],
  "10": [
    { id: "STU10_1", name: "Aarav Sharma", section: "A", admissionNumber: "ADM23001" },
    { id: "STU10_2", name: "Priya Patel", section: "A", admissionNumber: "ADM23002" },
    { id: "STU10_3", name: "Liam Chen", section: "A", admissionNumber: "ADM23003" },
    { id: "STU10_4", name: "Sophia Garcia", section: "B", admissionNumber: "ADM23004" },
    { id: "STU10_5", name: "Noah Kim", section: "B", admissionNumber: "ADM23005" },
    { id: "STU10_6", name: "Olivia Brown", section: "B", admissionNumber: "ADM23006" },
    { id: "STU10_7", name: "Ethan Wang", section: "A", admissionNumber: "ADM23007" },
    { id: "STU10_8", name: "Ava Johnson", section: "A", admissionNumber: "ADM23008" },
  ],
};

function seedPayments() {
  if (feePayments.length > 0) return;
  for (const [className, students] of Object.entries(STUDENT_NAMES_BY_CLASS)) {
    const structure = feeStructures.find(fs => fs.className === className);
    if (!structure) continue;
    for (let m = 0; m < 3; m++) {
      const month = MONTHS[m];
      const dueDate = new Date(2026, m + 3, 10).toISOString().split("T")[0];
      for (const student of students) {
        const isPaid = m < 2;
        const paidAt = isPaid ? new Date(2026, m + 3, m + 5).toISOString() : null;
        feePayments.push({
          id: `fp_${className}_${student.id}_${m}`,
          studentId: student.id,
          studentName: student.name,
          className,
          section: student.section,
          admissionNumber: student.admissionNumber,
          month,
          academicSession: CURRENT_SESSION,
          totalFee: structure.totalMonthly,
          paidAmount: isPaid ? structure.totalMonthly : 0,
          pendingAmount: isPaid ? 0 : structure.totalMonthly,
          fine: 0,
          gst: 0,
          scholarshipAmount: 0,
          dueDate,
          status: isPaid ? "paid" : "not_paid",
          paymentMethod: isPaid ? "bank_transfer" : null,
          transactionRef: isPaid ? `TXN${String(Math.random()).slice(2, 12)}` : null,
          paidAt,
          verifiedBy: isPaid ? "Admin" : null,
          verifiedAt: isPaid ? paidAt : null,
          receiptNumber: isPaid ? `RCP${String(Math.random()).slice(2, 10)}` : null,
          components: structure.components.filter(c => c.frequency === "monthly" && c.isActive).map(c => ({ name: c.name, amount: c.amount })),
          advancePayment: 0,
          refundStatus: "none",
          refundInitiatedAt: null,
          refundCompletedAt: null,
        });
      }
    }
  }
}

function seedAdmissionFees() {
  if (admissionFeeRecords.length > 0) return;
  admissionFeeRecords = [
    { id: "af_1", studentId: "ADM_1", studentName: "Arjun Mehta", admissionNumber: "ADM25001", className: "11", stream: "Science", optionalSubjects: ["Computer Science", "Physical Education"], admissionFee: 5000, amountPaid: 5000, paymentDate: "2026-04-01", paymentMethod: "bank_transfer", transactionRef: "TXN9876543210", verificationStatus: "paid", receiptNumber: "RCP_AF_001", verifiedBy: "Admin", verifiedAt: "2026-04-02T10:00:00Z" },
    { id: "af_2", studentId: "ADM_2", studentName: "Neha Singh", admissionNumber: "ADM25002", className: "11", stream: "Commerce", optionalSubjects: ["Mathematics", "Economics"], admissionFee: 5000, amountPaid: 5000, paymentDate: "2026-04-03", paymentMethod: "cash", transactionRef: null, verificationStatus: "pending_verification", receiptNumber: null, verifiedBy: null, verifiedAt: null },
    { id: "af_3", studentId: "ADM_3", studentName: "Rohit Verma", admissionNumber: "ADM25003", className: "9", stream: "Science", optionalSubjects: ["Hindi", "Sanskrit"], admissionFee: 4000, amountPaid: 0, paymentDate: null, paymentMethod: null, transactionRef: null, verificationStatus: "not_paid", receiptNumber: null, verifiedBy: null, verifiedAt: null },
  ];
}

function seedSalaries() {
  if (teacherSalaries.length > 0) return;
  const teachers = [
    { id: "TCH1", name: "Dr. Ananya Gupta", employeeId: "EMP001", position: "Senior Teacher", basicSalary: 45000 },
    { id: "TCH2", name: "Mr. Rajesh Kumar", employeeId: "EMP002", position: "Teacher", basicSalary: 35000 },
    { id: "TCH3", name: "Ms. Priya Sharma", employeeId: "EMP003", position: "Teacher", basicSalary: 32000 },
    { id: "TCH4", name: "Mr. Amit Verma", employeeId: "EMP004", position: "Senior Teacher", basicSalary: 48000 },
  ];
  for (let m = 0; m < 3; m++) {
    const month = MONTHS[m];
    for (const t of teachers) {
      const bonus = m === 2 && t.position === "Senior Teacher" ? 5000 : 0;
      teacherSalaries.push({
        id: `sal_${t.id}_${m}`,
        teacherId: t.id,
        teacherName: t.name,
        employeeId: t.employeeId,
        position: t.position,
        month,
        academicSession: CURRENT_SESSION,
        basicSalary: t.basicSalary,
        components: [{ name: "House Rent Allowance", amount: Math.round(t.basicSalary * 0.3) }, { name: "Dearness Allowance", amount: Math.round(t.basicSalary * 0.15) }, { name: "Transport Allowance", amount: 2000 }],
        bonus,
        totalSalary: t.basicSalary + Math.round(t.basicSalary * 0.3) + Math.round(t.basicSalary * 0.15) + 2000 + bonus,
        paymentMethod: "bank_transfer",
        paidAt: m < 2 ? new Date(2026, m + 3, 28).toISOString() : null,
        receiptNumber: m < 2 ? `SLIP${String(Math.random()).slice(2, 10)}` : null,
        isPaid: m < 2,
      });
    }
  }
}

seedPayments();
seedAdmissionFees();
seedSalaries();

let activitySeq = 0;
function logActivity(action: string, admin: string, student: string | null, amount: number) {
  activitySeq++;
  activityLog.unshift({
    id: `act_${activitySeq}`,
    action,
    admin,
    student,
    amount,
    timestamp: new Date().toISOString(),
  });
}

export function getFeeStructures(): FeeStructure[] {
  return feeStructures.filter(fs => fs.academicSession === CURRENT_SESSION);
}

export function getFeeStructureByClass(className: string): FeeStructure | undefined {
  return feeStructures.find(fs => fs.className === className && fs.academicSession === CURRENT_SESSION);
}

export function addFeeStructure(structure: FeeStructure): void {
  feeStructures.push(structure);
  logActivity("Fee Structure Created", "Admin", null, structure.totalMonthly);
}

export function updateFeeStructure(id: string, updates: Partial<FeeStructure>): void {
  feeStructures = feeStructures.map(fs => fs.id === id ? { ...fs, ...updates, updatedAt: new Date().toISOString() } : fs);
  logActivity("Fee Structure Edited", "Admin", null, 0);
}

export function deleteFeeStructure(id: string): void {
  feeStructures = feeStructures.filter(fs => fs.id !== id);
  logActivity("Fee Structure Deleted", "Admin", null, 0);
}

export function duplicateFeeStructure(fromClass: string, toClass: string): FeeStructure | undefined {
  const source = feeStructures.find(fs => fs.className === fromClass && fs.academicSession === CURRENT_SESSION);
  if (!source) return undefined;
  const newFs: FeeStructure = {
    ...source,
    id: `fs_${Date.now()}`,
    className: toClass,
    components: source.components.map(c => ({ ...c, id: `fc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  feeStructures.push(newFs);
  return newFs;
}

export function getStudentFeeLedger(studentId: string): { payments: FeePayment[]; summary: { totalFee: number; paid: number; pending: number; advancePayment: number } } {
  const payments = feePayments.filter(fp => fp.studentId === studentId).sort((a, b) => a.month.localeCompare(b.month));
  const totalFee = payments.reduce((s, p) => s + p.totalFee, 0);
  const paid = payments.reduce((s, p) => s + p.paidAmount, 0);
  const pending = payments.reduce((s, p) => s + p.pendingAmount, 0);
  const advancePayment = payments.reduce((s, p) => s + p.advancePayment, 0);
  return { payments, summary: { totalFee, paid, pending, advancePayment } };
}

export function getAllFeePayments(): FeePayment[] {
  return feePayments;
}

export function getFeePaymentsByClass(className: string): FeePayment[] {
  return feePayments.filter(fp => fp.className === className);
}

export function getFeePaymentsByMonth(month: string): FeePayment[] {
  return feePayments.filter(fp => fp.month === month);
}

export function getPaymentById(id: string): FeePayment | undefined {
  return feePayments.find(fp => fp.id === id);
}

export function updatePaymentStatus(id: string, status: PaymentStatus, admin: string, receiptNumber?: string): void {
  feePayments = feePayments.map(fp => {
    if (fp.id !== id) return fp;
    const now = new Date().toISOString();
    const updates: Partial<FeePayment> = { status };
    if (status === "paid") {
      updates.verifiedBy = admin;
      updates.verifiedAt = now;
      updates.receiptNumber = receiptNumber || `RCP${Date.now()}`;
      updates.paidAt = fp.paidAt || now;
    }
    if (status === "rejected") {
      updates.verifiedBy = admin;
      updates.verifiedAt = now;
    }
    return { ...fp, ...updates };
  });
  logActivity(`Payment ${status === "paid" ? "Verified" : "Rejected"}`, admin, feePayments.find(fp => fp.id === id)?.studentName || null, feePayments.find(fp => fp.id === id)?.paidAmount || 0);
}

export function initiateRefund(paymentId: string, admin: string): void {
  feePayments = feePayments.map(fp => {
    if (fp.id !== paymentId) return fp;
    return { ...fp, refundStatus: "initiated", refundInitiatedAt: new Date().toISOString() };
  });
  logActivity("Refund Initiated", admin, feePayments.find(fp => fp.id === paymentId)?.studentName || null, feePayments.find(fp => fp.id === paymentId)?.advancePayment || 0);
}

export function completeRefund(paymentId: string, admin: string): void {
  feePayments = feePayments.map(fp => {
    if (fp.id !== paymentId) return fp;
    return { ...fp, refundStatus: "completed", refundCompletedAt: new Date().toISOString(), advancePayment: 0 };
  });
  logActivity("Refund Completed", admin, feePayments.find(fp => fp.id === paymentId)?.studentName || null, 0);
}

export function recordOfflinePayment(data: { studentId: string; month: string; amount: number; paymentMethod: PaymentMethod; transactionRef?: string }): void {
  const payment = feePayments.find(fp => fp.studentId === data.studentId && fp.month === data.month);
  if (!payment) return;
  feePayments = feePayments.map(fp => {
    if (fp.id !== payment.id) return fp;
    return {
      ...fp,
      paidAmount: data.amount,
      pendingAmount: fp.totalFee - data.amount >= 0 ? fp.totalFee - data.amount : 0,
      advancePayment: fp.totalFee - data.amount < 0 ? Math.abs(fp.totalFee - data.amount) : 0,
      status: "pending_verification",
      paymentMethod: data.paymentMethod,
      transactionRef: data.transactionRef || null,
      paidAt: new Date().toISOString(),
    };
  });
  logActivity("Offline Payment Recorded", "Admin", payment.studentName, data.amount);
}

export function getAdmissionFeeRecords(): AdmissionFeeRecord[] {
  return admissionFeeRecords;
}

export function verifyAdmissionFee(id: string, admin: string): void {
  admissionFeeRecords = admissionFeeRecords.map(rec => {
    if (rec.id !== id) return rec;
    return {
      ...rec,
      verificationStatus: "paid",
      receiptNumber: `RCP_AF_${Date.now()}`,
      verifiedBy: admin,
      verifiedAt: new Date().toISOString(),
    };
  });
  logActivity("Admission Fee Verified", admin, admissionFeeRecords.find(r => r.id === id)?.studentName || null, admissionFeeRecords.find(r => r.id === id)?.admissionFee || 0);
}

export function rejectAdmissionFee(id: string, admin: string): void {
  admissionFeeRecords = admissionFeeRecords.map(rec => {
    if (rec.id !== id) return rec;
    return { ...rec, verificationStatus: "not_paid", amountPaid: 0, paymentDate: null, paymentMethod: null, transactionRef: null, verifiedBy: null, verifiedAt: null, receiptNumber: null };
  });
  logActivity("Admission Fee Rejected", admin, admissionFeeRecords.find(r => r.id === id)?.studentName || null, 0);
}

export function getScholarships(): ScholarshipOrConcession[] {
  return scholarships;
}

export function addScholarship(s: ScholarshipOrConcession): void {
  scholarships.push(s);
  logActivity("Scholarship Granted", s.approvedBy, s.studentName, s.value);
}

export function revokeScholarship(id: string): void {
  const s = scholarships.find(sch => sch.id === id);
  if (s) {
    s.isActive = false;
    s.history.push({ action: "Revoked", timestamp: new Date().toISOString(), admin: s.approvedBy });
  }
  logActivity("Scholarship Revoked", s?.approvedBy || "Admin", s?.studentName || null, 0);
}

export function getTeacherSalaries(): TeacherSalary[] {
  return teacherSalaries;
}

export function payTeacherSalary(id: string): void {
  teacherSalaries = teacherSalaries.map(s => {
    if (s.id !== id) return s;
    return { ...s, isPaid: true, paidAt: new Date().toISOString(), receiptNumber: `SLIP${Date.now()}` };
  });
  const salary = teacherSalaries.find(s => s.id === id);
  logActivity("Salary Paid", "Admin", salary?.teacherName || null, salary?.totalSalary || 0);
}

export function getActivityLog(): FinanceActivityLog[] {
  return activityLog;
}

export function getDueDateCalendar(): DueDateCalendar[] {
  return Object.keys(STUDENT_NAMES_BY_CLASS).map(className => {
    const now = new Date();
    const currentMonthIndex = now.getMonth() - 3;
    const month = MONTHS[Math.max(0, Math.min(currentMonthIndex, 11))];
    const students = STUDENT_NAMES_BY_CLASS[className];
    const payments = feePayments.filter(fp => fp.className === className && fp.month === month);
    const paidCount = payments.filter(p => p.status === "paid").length;
    const pendingCount = students.length - paidCount;
    return {
      className,
      dueDate: new Date(2026, MONTHS.indexOf(month) + 3, 10).toISOString().split("T")[0],
      month,
      totalStudents: students.length,
      paidCount,
      pendingCount,
    };
  });
}

export function getFinanceSummary() {
  const allPayments = feePayments;
  const paidPayments = allPayments.filter(p => p.status === "paid");
  const totalCollection = paidPayments.reduce((s, p) => s + p.paidAmount, 0);
  const pendingFees = allPayments.filter(p => p.status !== "paid").reduce((s, p) => s + p.pendingAmount, 0);
  const salaryPaid = teacherSalaries.filter(s => s.isPaid).reduce((s, sal) => s + sal.totalSalary, 0);
  const salaryPending = teacherSalaries.filter(s => !s.isPaid).reduce((s, sal) => s + sal.totalSalary, 0);
  const scholarshipAmount = scholarships.filter(s => s.isActive).reduce((s, sch) => s + sch.value, 0);
  const currentMonth = MONTHS[Math.max(0, Math.min(new Date().getMonth() - 3, 11))];
  const monthlyCollection = paidPayments.filter(p => p.month === currentMonth).reduce((s, p) => s + p.paidAmount, 0);
  const overduePayments = allPayments.filter(p => p.status !== "paid" && new Date(p.dueDate) < new Date());
  const overdueAmount = overduePayments.reduce((s, p) => s + p.pendingAmount, 0);

  return {
    totalCollection,
    monthlyCollection,
    pendingFees,
    overdueAmount,
    scholarshipAmount,
    salaryPaid,
    salaryPending,
    expectedRevenue: allPayments.reduce((s, p) => s + p.totalFee, 0),
    collectedRevenue: totalCollection,
    bonusPaid: teacherSalaries.filter(s => s.isPaid && s.bonus > 0).reduce((s, sal) => s + sal.bonus, 0),
    netSurplus: totalCollection - salaryPaid,
  };
}

export function getMonthlyCollectionData(): { month: string; collection: number; pending: number }[] {
  return MONTHS.slice(0, 3).map(month => {
    const monthPayments = feePayments.filter(fp => fp.month === month);
    const collection = monthPayments.filter(p => p.status === "paid").reduce((s, p) => s + p.paidAmount, 0);
    const pending = monthPayments.filter(p => p.status !== "paid").reduce((s, p) => s + p.pendingAmount, 0);
    return { month, collection, pending };
  });
}

export function getClassWiseCollection(): { className: string; collection: number; pending: number; total: number }[] {
  const classKeys = Object.keys(STUDENT_NAMES_BY_CLASS);
  return classKeys.map(className => {
    const classPayments = feePayments.filter(fp => fp.className === className);
    const collection = classPayments.filter(p => p.status === "paid").reduce((s, p) => s + p.paidAmount, 0);
    const pending = classPayments.filter(p => p.status !== "paid").reduce((s, p) => s + p.pendingAmount, 0);
    const total = classPayments.reduce((s, p) => s + p.totalFee, 0);
    return { className, collection, pending, total };
  });
}

export function generateReceiptNumber(): string {
  return `RCP${Date.now()}`;
}
