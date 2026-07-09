import { exportApi } from "@/services/adminApi";
import type { ModuleExportConfig, ExportFieldGroup } from "./exportConfig";

// ---- Classes ----

const CLASS_FIELD_GROUPS: ExportFieldGroup[] = [
  { group: "Class Info", fields: [
    { key: "name", label: "Class Name" },
    { key: "section", label: "Section" },
    { key: "total_students", label: "Total Students" },
    { key: "class_teacher", label: "Class Teacher" },
    { key: "subject_count", label: "Subject Count" },
    { key: "academic_session", label: "Academic Session" },
  ]},
];

export const classExportConfig: ModuleExportConfig = {
  moduleName: "classes",
  label: "Class Data",
  fieldGroups: CLASS_FIELD_GROUPS,
  defaultFields: ["name", "section", "total_students", "class_teacher"],
  scopes: [
    { value: "school", label: "Entire School" },
    { value: "class", label: "Single Class" },
    { value: "multiple", label: "Multiple Classes" },
  ],
  filters: [
    { key: "class_assigned", label: "Class", type: "text" },
    { key: "section", label: "Section", type: "text" },
  ],
  downloadFn: (format, fields, filters) => exportApi.downloadClasses(format, fields, filters),
};

// ---- Attendance ----

const ATTENDANCE_FIELD_GROUPS: ExportFieldGroup[] = [
  { group: "Attendance Info", fields: [
    { key: "student", label: "Student" },
    { key: "class_assigned", label: "Class" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
    { key: "marked_by", label: "Marked By" },
  ]},
];

export const attendanceExportConfig: ModuleExportConfig = {
  moduleName: "attendance",
  label: "Attendance",
  fieldGroups: ATTENDANCE_FIELD_GROUPS,
  defaultFields: ["student", "class_assigned", "date", "status"],
  scopes: [
    { value: "school", label: "Entire School" },
    { value: "class", label: "Single Class" },
    { value: "section", label: "Single Section" },
  ],
  filters: [
    { key: "class_assigned", label: "Class", type: "text" },
    { key: "section", label: "Section", type: "text" },
    { key: "status", label: "Status", type: "select",
      options: [{ value: "present", label: "Present" }, { value: "absent", label: "Absent" }, { value: "late", label: "Late" }] },
  ],
  downloadFn: (format, fields, filters) => exportApi.downloadAttendance(format, fields, filters),
};

// ---- Exams ----

const EXAM_FIELD_GROUPS: ExportFieldGroup[] = [
  { group: "Exam Details", fields: [
    { key: "name", label: "Exam Name" },
    { key: "subject", label: "Subject" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "room", label: "Room" },
    { key: "duration", label: "Duration" },
    { key: "status", label: "Status" },
    { key: "classes", label: "Classes" },
    { key: "academic_year", label: "Academic Year" },
  ]},
];

export const examExportConfig: ModuleExportConfig = {
  moduleName: "exams",
  label: "Exam Data",
  fieldGroups: EXAM_FIELD_GROUPS,
  defaultFields: ["name", "subject", "date", "status"],
  scopes: [
    { value: "school", label: "All Exams" },
  ],
  filters: [
    { key: "status", label: "Status", type: "select",
      options: [
        { value: "draft", label: "Draft" },
        { value: "scheduled", label: "Scheduled" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ] },
    { key: "academic_year", label: "Academic Year", type: "text" },
  ],
  allowedFormats: ["pdf"],
  downloadFn: (format, fields, filters) => exportApi.downloadExams(format, fields, filters),
};

// ---- Admissions ----

const ADMISSION_FIELD_GROUPS: ExportFieldGroup[] = [
  { group: "Applicant Info", fields: [
    { key: "applicant_name", label: "Applicant Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "date_of_birth", label: "Date of Birth" },
    { key: "address", label: "Address" },
  ]},
  { group: "Guardian", fields: [
    { key: "father_name", label: "Father Name" },
    { key: "mother_name", label: "Mother Name" },
  ]},
  { group: "Academic Background", fields: [
    { key: "previous_school", label: "Previous School" },
    { key: "previous_board", label: "Previous Board" },
    { key: "stream", label: "Stream" },
    { key: "entrance_score", label: "Entrance Score" },
  ]},
  { group: "Status", fields: [
    { key: "status", label: "Status" },
    { key: "submitted_at", label: "Submitted At" },
  ]},
];

export const admissionExportConfig: ModuleExportConfig = {
  moduleName: "admissions",
  label: "Admissions",
  fieldGroups: ADMISSION_FIELD_GROUPS,
  defaultFields: ["applicant_name", "email", "status", "submitted_at"],
  scopes: [
    { value: "school", label: "All Applicants" },
    { value: "verified", label: "Verified Students" },
  ],
  filters: [
    { key: "status", label: "Status", type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ] },
    { key: "stream", label: "Stream", type: "text" },
  ],
  downloadFn: (format, fields, filters) => exportApi.downloadAdmissions(format, fields, filters),
};

// ---- Contacts ----

const CONTACT_FIELD_GROUPS: ExportFieldGroup[] = [
  { group: "Contact Info", fields: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "subject", label: "Subject" },
    { key: "message", label: "Message" },
    { key: "status", label: "Status" },
    { key: "submitted_at", label: "Submitted At" },
  ]},
];

export const contactExportConfig: ModuleExportConfig = {
  moduleName: "contacts",
  label: "Contact Forms",
  fieldGroups: CONTACT_FIELD_GROUPS,
  defaultFields: ["name", "email", "subject", "status", "submitted_at"],
  scopes: [],
  filters: [
    { key: "status", label: "Status", type: "select",
      options: [
        { value: "unread", label: "Unread" },
        { value: "read", label: "Read" },
        { value: "resolved", label: "Resolved" },
      ] },
  ],
  allowedFormats: ["pdf"],
  downloadFn: (format, fields, filters) => exportApi.downloadContacts(format, fields, filters),
};

// ---- Documents ----

const DOCUMENT_FIELD_GROUPS: ExportFieldGroup[] = [
  { group: "File Info", fields: [
    { key: "original_filename", label: "File Name" },
    { key: "file_type", label: "File Type" },
    { key: "file_size", label: "File Size" },
    { key: "uploaded_by", label: "Uploaded By" },
    { key: "related_model", label: "Related Module" },
    { key: "uploaded_at", label: "Uploaded At" },
  ]},
];

export const documentExportConfig: ModuleExportConfig = {
  moduleName: "documents",
  label: "Documents",
  fieldGroups: DOCUMENT_FIELD_GROUPS,
  defaultFields: ["original_filename", "file_type", "file_size", "uploaded_at"],
  scopes: [],
  filters: [
    { key: "file_type", label: "File Type", type: "select",
      options: [
        { value: "student", label: "Student Document" },
        { value: "teacher", label: "Teacher Document" },
        { value: "admission", label: "Admission Document" },
        { value: "resource", label: "Resource File" },
        { value: "gallery", label: "Gallery Image" },
        { value: "other", label: "Other" },
      ] },
  ],
  downloadFn: (format, fields, filters) => exportApi.downloadDocuments(format, fields, filters),
};

// ---- Audit Logs ----

const AUDIT_FIELD_GROUPS: ExportFieldGroup[] = [
  { group: "Audit Log Details", fields: [
    { key: "user", label: "User" },
    { key: "model_name", label: "Model" },
    { key: "export_type", label: "Export Type" },
    { key: "file_path", label: "File Path" },
    { key: "exported_at", label: "Exported At" },
  ]},
];

export const auditLogExportConfig: ModuleExportConfig = {
  moduleName: "audit_logs",
  label: "Audit Logs",
  fieldGroups: AUDIT_FIELD_GROUPS,
  defaultFields: ["user", "model_name", "export_type", "exported_at"],
  scopes: [],
  filters: [
    { key: "model_name", label: "Module", type: "text" },
    { key: "export_type", label: "Export Type", type: "select",
      options: [
        { value: "csv", label: "CSV" },
        { value: "excel", label: "Excel" },
        { value: "pdf", label: "PDF" },
        { value: "zip", label: "ZIP" },
      ] },
  ],
  downloadFn: (format, fields, filters) => exportApi.downloadAuditLogs(format, fields, filters),
};

// ---- Fees & Finance ----

const FEE_FIELD_GROUPS: ExportFieldGroup[] = [
  { group: "Student Info", fields: [
    { key: "studentName", label: "Student Name" },
    { key: "admissionNumber", label: "Admission No" },
    { key: "className", label: "Class" },
    { key: "section", label: "Section" },
    { key: "month", label: "Month" },
    { key: "academicSession", label: "Academic Session" },
  ]},
  { group: "Fee Details", fields: [
    { key: "totalFee", label: "Total Fee" },
    { key: "paidAmount", label: "Paid Amount" },
    { key: "pendingAmount", label: "Pending Amount" },
    { key: "fine", label: "Fine" },
    { key: "status", label: "Status" },
    { key: "paymentMethod", label: "Payment Method" },
  ]},
];

export const feeExportConfig: ModuleExportConfig = {
  moduleName: "fees",
  label: "Fee Report",
  fieldGroups: FEE_FIELD_GROUPS,
  defaultFields: ["studentName", "admissionNumber", "className", "month", "totalFee", "paidAmount", "status"],
  scopes: [
    { value: "school", label: "Entire School" },
    { value: "class", label: "Single Class" },
    { value: "student", label: "Single Student" },
  ],
  filters: [
    { key: "className", label: "Class", type: "text" },
    { key: "month", label: "Month", type: "text" },
    { key: "status", label: "Status", type: "select",
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending_verification", label: "Pending Verification" },
        { value: "not_paid", label: "Not Paid" },
        { value: "rejected", label: "Rejected" },
      ] },
  ],
  downloadFn: (format, fields, filters) => exportApi.downloadFees(format, fields, filters),
};
