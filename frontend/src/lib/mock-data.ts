// Centralized mock data for EduSphere demo
export type Role = "admin" | "teacher" | "student";

export const stats = {
  students: 1248,
  teachers: 84,
  subjects: 42,
  classes: 36,
  revenue: 284500,
  pendingFees: 18450,
  attendance: 94.2,
  upcomingExams: 7,
  upcomingEvents: 12,
};

export const studentGrowth = [
  { month: "Jan", students: 920, revenue: 210000 },
  { month: "Feb", students: 968, revenue: 224000 },
  { month: "Mar", students: 1020, revenue: 238000 },
  { month: "Apr", students: 1085, revenue: 251000 },
  { month: "May", students: 1142, revenue: 263000 },
  { month: "Jun", students: 1180, revenue: 272000 },
  { month: "Jul", students: 1248, revenue: 284500 },
];

export const attendanceData = [
  { day: "Mon", present: 1180, absent: 68 },
  { day: "Tue", present: 1205, absent: 43 },
  { day: "Wed", present: 1192, absent: 56 },
  { day: "Thu", present: 1170, absent: 78 },
  { day: "Fri", present: 1142, absent: 106 },
];

export const examPerformance = [
  { subject: "Math", avg: 78, top: 98 },
  { subject: "Science", avg: 82, top: 99 },
  { subject: "English", avg: 75, top: 96 },
  { subject: "History", avg: 71, top: 94 },
  { subject: "Art", avg: 85, top: 100 },
  { subject: "PE", avg: 88, top: 99 },
];

export const students = Array.from({ length: 24 }, (_, i) => ({
  id: `STU${1000 + i}`,
  name: ["Aarav Sharma", "Priya Patel", "Liam Chen", "Sophia Garcia", "Noah Kim", "Olivia Brown", "Ethan Wang", "Ava Johnson", "Mia Davis", "Lucas Martin", "Isabella Lee", "Mason Rodriguez"][i % 12],
  class: ["10-A", "10-B", "9-A", "9-B", "11-A", "11-B"][i % 6],
  email: `student${i + 1}@edusphere.edu`,
  attendance: 85 + (i % 15),
  gpa: (3.0 + (i % 10) / 10).toFixed(2),
  status: i % 7 === 0 ? "Pending" : "Active",
}));

export const teachers = Array.from({ length: 16 }, (_, i) => ({
  id: `TCH${200 + i}`,
  name: ["Dr. Anika Rao", "Prof. James Miller", "Ms. Elena Cruz", "Mr. David Park", "Dr. Sarah Khan", "Mr. Tom Wilson", "Ms. Rina Gupta", "Mr. Hiro Tanaka"][i % 8],
  subject: ["Mathematics", "Physics", "English", "Biology", "Chemistry", "History", "Computer Science", "Art"][i % 8],
  classes: 3 + (i % 4),
  email: `teacher${i + 1}@edusphere.edu`,
  experience: 2 + (i % 18),
  rating: (4.2 + (i % 8) / 10).toFixed(1),
}));

export const subjects = [
  { id: "MATH101", name: "Mathematics", code: "MATH101", teacher: "Dr. Anika Rao", progress: 68, color: "from-indigo-500 to-blue-500" },
  { id: "PHY201", name: "Physics", code: "PHY201", teacher: "Prof. James Miller", progress: 54, color: "from-blue-500 to-cyan-500" },
  { id: "ENG110", name: "English Literature", code: "ENG110", teacher: "Ms. Elena Cruz", progress: 82, color: "from-purple-500 to-indigo-500" },
  { id: "BIO150", name: "Biology", code: "BIO150", teacher: "Dr. Sarah Khan", progress: 41, color: "from-green-500 to-emerald-500" },
  { id: "CHM120", name: "Chemistry", code: "CHM120", teacher: "Mr. David Park", progress: 73, color: "from-orange-500 to-red-500" },
  { id: "CS210", name: "Computer Science", code: "CS210", teacher: "Ms. Rina Gupta", progress: 90, color: "from-violet-500 to-purple-500" },
];

export const assignments = [
  { id: "A1", title: "Quadratic Equations Problem Set", subject: "Mathematics", due: "2026-06-08", status: "pending", submissions: 18, total: 32 },
  { id: "A2", title: "Newton's Laws Lab Report", subject: "Physics", due: "2026-06-10", status: "pending", submissions: 22, total: 32 },
  { id: "A3", title: "Macbeth Character Essay", subject: "English", due: "2026-06-05", status: "graded", submissions: 32, total: 32 },
  { id: "A4", title: "Cell Division Diagram", subject: "Biology", due: "2026-06-12", status: "pending", submissions: 10, total: 32 },
  { id: "A5", title: "Periodic Table Quiz", subject: "Chemistry", due: "2026-06-04", status: "graded", submissions: 30, total: 32 },
  { id: "A6", title: "Python Recursion Exercise", subject: "Computer Science", due: "2026-06-15", status: "pending", submissions: 8, total: 32 },
];

export const exams = [
  { id: "E1", name: "Midterm — Mathematics", date: "2026-06-12", time: "09:00 AM", room: "Hall A", duration: "2h" },
  { id: "E2", name: "Midterm — Physics", date: "2026-06-14", time: "09:00 AM", room: "Hall B", duration: "2h" },
  { id: "E3", name: "Midterm — English", date: "2026-06-16", time: "11:00 AM", room: "Hall A", duration: "1.5h" },
  { id: "E4", name: "Midterm — Biology", date: "2026-06-18", time: "09:00 AM", room: "Lab 3", duration: "2h" },
  { id: "E5", name: "Midterm — Chemistry", date: "2026-06-20", time: "09:00 AM", room: "Lab 2", duration: "2h" },
];

export const results = [
  { subject: "Mathematics", marks: 88, total: 100, grade: "A" },
  { subject: "Physics", marks: 76, total: 100, grade: "B+" },
  { subject: "English", marks: 92, total: 100, grade: "A+" },
  { subject: "Biology", marks: 81, total: 100, grade: "A" },
  { subject: "Chemistry", marks: 79, total: 100, grade: "B+" },
  { subject: "Computer Science", marks: 95, total: 100, grade: "A+" },
];

export const events = [
  { id: "EV1", title: "Annual Science Fair", date: "2026-06-22", type: "Academic", location: "Main Auditorium", description: "Students showcase innovative science projects." },
  { id: "EV2", title: "Inter-School Sports Meet", date: "2026-06-28", type: "Sports", location: "Sports Ground", description: "Track and field competitions." },
  { id: "EV3", title: "Cultural Night", date: "2026-07-05", type: "Cultural", location: "Open Theatre", description: "Music, dance and drama performances." },
  { id: "EV4", title: "Parent-Teacher Meeting", date: "2026-07-10", type: "Meeting", location: "All Classrooms", description: "Quarterly progress discussion." },
  { id: "EV5", title: "Graduation Ceremony", date: "2026-07-20", type: "Ceremony", location: "Main Hall", description: "Class of 2026 graduation." },
];

export const holidays = [
  { date: "2026-06-15", name: "Founders Day" },
  { date: "2026-07-04", name: "Independence Day" },
  { date: "2026-08-12", name: "Summer Break Begins" },
];

export const fees = [
  { id: "F1", term: "Q1 2026", amount: 2400, status: "paid", date: "2026-01-15" },
  { id: "F2", term: "Q2 2026", amount: 2400, status: "paid", date: "2026-04-15" },
  { id: "F3", term: "Q3 2026", amount: 2400, status: "pending", date: "2026-07-15" },
];

export const timetable = [
  { day: "Mon", slots: [["08:00", "Math", "Dr. Rao", "201"], ["09:00", "Physics", "Prof. Miller", "Lab 1"], ["10:00", "English", "Ms. Cruz", "104"], ["11:30", "Biology", "Dr. Khan", "Lab 3"]] },
  { day: "Tue", slots: [["08:00", "Chemistry", "Mr. Park", "Lab 2"], ["09:00", "CS", "Ms. Gupta", "Lab 4"], ["10:00", "Math", "Dr. Rao", "201"], ["11:30", "PE", "Coach Tom", "Field"]] },
  { day: "Wed", slots: [["08:00", "English", "Ms. Cruz", "104"], ["09:00", "Biology", "Dr. Khan", "Lab 3"], ["10:00", "Physics", "Prof. Miller", "Lab 1"], ["11:30", "Art", "Ms. Lee", "Studio"]] },
  { day: "Thu", slots: [["08:00", "Math", "Dr. Rao", "201"], ["09:00", "Chemistry", "Mr. Park", "Lab 2"], ["10:00", "CS", "Ms. Gupta", "Lab 4"], ["11:30", "History", "Mr. Wilson", "208"]] },
  { day: "Fri", slots: [["08:00", "Physics", "Prof. Miller", "Lab 1"], ["09:00", "English", "Ms. Cruz", "104"], ["10:00", "Biology", "Dr. Khan", "Lab 3"], ["11:30", "Art", "Ms. Lee", "Studio"]] },
];

export const notifications = [
  { id: "n1", title: "New assignment posted", desc: "Physics — Newton's Laws Lab Report due Jun 10", time: "2h ago", unread: true },
  { id: "n2", title: "Exam schedule published", desc: "Midterm exams begin June 12", time: "5h ago", unread: true },
  { id: "n3", title: "Fee reminder", desc: "Q3 2026 fees due by July 15", time: "1d ago", unread: false },
  { id: "n4", title: "Results released", desc: "Unit Test 2 results are now available", time: "2d ago", unread: false },
];

export const announcements = [
  { id: "an1", title: "School reopens after break on June 3", date: "2026-05-30", priority: "high" },
  { id: "an2", title: "Library extended hours during exam week", date: "2026-05-28", priority: "medium" },
  { id: "an3", title: "New CS lab inaugurated", date: "2026-05-25", priority: "low" },
];

export const galleryImages = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  // gradient placeholders (deterministic)
  gradient: [
    "from-indigo-400 to-blue-500",
    "from-blue-400 to-cyan-500",
    "from-purple-400 to-indigo-500",
    "from-orange-400 to-pink-500",
    "from-emerald-400 to-teal-500",
    "from-rose-400 to-orange-500",
    "from-violet-400 to-purple-500",
    "from-cyan-400 to-blue-500",
    "from-amber-400 to-orange-500",
  ][i],
  label: ["Annual Day", "Science Fair", "Sports Meet", "Art Exhibition", "Graduation", "Field Trip", "Music Night", "Lab Session", "Library"][i],
}));

export const testimonials = [
  { name: "Priya M.", role: "Parent", quote: "EduSphere transformed how we engage with our daughter's education. Real-time updates and crystal-clear insights.", initials: "PM" },
  { name: "Mr. Rajan K.", role: "Teacher", quote: "Managing assignments and tracking 120 students used to take hours. Now it takes minutes.", initials: "RK" },
  { name: "Aarav S.", role: "Student, Grade 10", quote: "I love seeing my progress visualised. It actually motivates me to do better.", initials: "AS" },
];
