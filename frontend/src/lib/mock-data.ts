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

export const teachers = [
  { id: "TCH201", name: "Dr. Anika Rao", subject: "Mathematics", classes: 5, email: "anika.rao@edusphere.edu", experience: 14, rating: "4.9" },
  { id: "TCH202", name: "Mr. Rajesh Sharma", subject: "Mathematics", classes: 4, email: "rajesh.sharma@edusphere.edu", experience: 11, rating: "4.8" },
  { id: "TCH203", name: "Prof. James Miller", subject: "Physics", classes: 4, email: "james.miller@edusphere.edu", experience: 18, rating: "4.8" },
  { id: "TCH204", name: "Dr. Vivek Roy", subject: "Physics", classes: 3, email: "vivek.roy@edusphere.edu", experience: 12, rating: "4.7" },
  { id: "TCH205", name: "Ms. Elena Cruz", subject: "English Literature", classes: 5, email: "elena.cruz@edusphere.edu", experience: 11, rating: "4.7" },
  { id: "TCH206", name: "Mrs. Pooja Das", subject: "English Literature", classes: 4, email: "pooja.das@edusphere.edu", experience: 9, rating: "4.8" },
  { id: "TCH207", name: "Dr. Sarah Khan", subject: "Biology", classes: 4, email: "sarah.khan@edusphere.edu", experience: 16, rating: "4.9" },
  { id: "TCH208", name: "Mrs. Sneha Gupta", subject: "Biology", classes: 4, email: "sneha.gupta@edusphere.edu", experience: 10, rating: "4.8" },
  { id: "TCH209", name: "Mr. David Park", subject: "Chemistry", classes: 4, email: "david.park@edusphere.edu", experience: 12, rating: "4.8" },
  { id: "TCH210", name: "Dr. Amit Verma", subject: "Chemistry", classes: 4, email: "amit.verma@edusphere.edu", experience: 13, rating: "4.8" },
  { id: "TCH211", name: "Ms. Rina Gupta", subject: "Computer Science", classes: 6, email: "rina.gupta@edusphere.edu", experience: 10, rating: "4.9" },
  { id: "TCH212", name: "Mr. Abhishek Sen", subject: "Computer Science", classes: 5, email: "abhishek.sen@edusphere.edu", experience: 8, rating: "4.7" },
  { id: "TCH213", name: "Mrs. Priya Sen", subject: "Business Studies", classes: 4, email: "priya.sen@edusphere.edu", experience: 13, rating: "4.8" },
  { id: "TCH214", name: "Mr. Arindam Roy", subject: "Business Studies", classes: 4, email: "arindam.roy@edusphere.edu", experience: 11, rating: "4.7" },
  { id: "TCH215", name: "Dr. Arjun Mehta", subject: "Research Methodology", classes: 3, email: "arjun.mehta@edusphere.edu", experience: 17, rating: "4.9" },
  { id: "TCH216", name: "Mr. Rohit Das", subject: "Information Technology", classes: 5, email: "rohit.das@edusphere.edu", experience: 8, rating: "4.7" },
  { id: "TCH217", name: "Mrs. Nandini Roy", subject: "Economics", classes: 4, email: "nandini.roy@edusphere.edu", experience: 15, rating: "4.8" },
  { id: "TCH218", name: "Mr. Saurav Bhattacharya", subject: "Economics", classes: 3, email: "saurav.bhattacharya@edusphere.edu", experience: 9, rating: "4.7" },
  { id: "TCH219", name: "Mr. Bikash Goon", subject: "Painting & Visual Arts", classes: 3, email: "bikash.goon@edusphere.edu", experience: 9, rating: "4.7" },
  { id: "TCH220", name: "Ms. Ayesha Kapoor", subject: "Painting & Visual Arts", classes: 2, email: "ayesha.kapoor@edusphere.edu", experience: 7, rating: "4.8" },
  { id: "TCH221", name: "Mr. Tom Wilson", subject: "History", classes: 5, email: "tom.wilson@edusphere.edu", experience: 14, rating: "4.8" },
  { id: "TCH222", name: "Mrs. Aditi Sharma", subject: "Geography", classes: 4, email: "aditi.sharma@edusphere.edu", experience: 12, rating: "4.8" },
  { id: "TCH223", name: "Mr. Vikram Bose", subject: "Physical Education", classes: 8, email: "vikram.bose@edusphere.edu", experience: 11, rating: "4.9" },
  { id: "TCH224", name: "Mrs. Meera Chatterjee", subject: "Environmental Studies", classes: 4, email: "meera.chatterjee@edusphere.edu", experience: 13, rating: "4.8" },
  { id: "TCH225", name: "Mrs. Shreya Dutta", subject: "Primary Section", classes: 6, email: "shreya.dutta@edusphere.edu", experience: 15, rating: "4.9" },
  { id: "TCH226", name: "Mrs. Rupa Ghosh", subject: "Primary Section", classes: 5, email: "rupa.ghosh@edusphere.edu", experience: 12, rating: "4.8" },
  { id: "TCH227", name: "Mrs. Ananya Pal", subject: "Primary Section", classes: 5, email: "ananya.pal@edusphere.edu", experience: 10, rating: "4.8" },
  { id: "TCH228", name: "Mr. Kunal Chakraborty", subject: "Music", classes: 4, email: "kunal.chakraborty@edusphere.edu", experience: 9, rating: "4.7" },
];

export const subjects = [
  { id: "MATH101", name: "Mathematics", code: "MATH101", teacher: "Dr. Anika Rao", progress: 68, category: "core", color: "from-indigo-500 to-blue-500", description: "Study of numbers, quantities, shapes, and patterns. Covers algebra, geometry, trigonometry, and calculus." },
  { id: "PHY201", name: "Physics", code: "PHY201", teacher: "Prof. James Miller", progress: 54, category: "core", color: "from-blue-500 to-cyan-500", description: "Fundamental science exploring matter, energy, motion, force, and the laws governing the universe." },
  { id: "ENG110", name: "English Literature", code: "ENG110", teacher: "Ms. Elena Cruz", progress: 82, category: "core", color: "from-purple-500 to-indigo-500", description: "Study of prose, poetry, and drama from classic to contemporary English literature." },
  { id: "BIO150", name: "Biology", code: "BIO150", teacher: "Dr. Sarah Khan", progress: 41, category: "core", color: "from-green-500 to-emerald-500", description: "Study of living organisms, cell biology, genetics, evolution, and ecosystems." },
  { id: "CHM120", name: "Chemistry", code: "CHM120", teacher: "Mr. David Park", progress: 73, category: "core", color: "from-orange-500 to-red-500", description: "Study of matter, its properties, composition, and reactions including organic and inorganic chemistry." },
  { id: "CS210", name: "Computer Science", code: "CS210", teacher: "Ms. Rina Gupta", progress: 90, category: "core", color: "from-violet-500 to-purple-500", description: "Study of computation, algorithms, programming, data structures, and software development." },

  { id: "BST301", name: "Business Studies", code: "BST301", teacher: "Mrs. Priya Sen", progress: 65, category: "specialized", color: "from-amber-500 to-yellow-500", description: "Introduction to business concepts, management principles, marketing, finance, and entrepreneurship." },
  { id: "RES320", name: "Research Methodology", code: "RES320", teacher: "Dr. Arjun Mehta", progress: 58, category: "specialized", color: "from-slate-500 to-gray-700", description: "Systematic approach to research design, data collection, analysis methods, and academic writing." },
  { id: "ECO250", name: "Economics", code: "ECO250", teacher: "Mrs. Nandini Roy", progress: 71, category: "specialized", color: "from-emerald-500 to-lime-500", description: "Study of resource allocation, market dynamics, supply and demand, and economic policy." },
  { id: "PG0440", name: "Painting", code: "PG0440", teacher: "Mr. Bikash Gon", progress: 56, category: "specialized", color: "from-purple-500 to-indigo-500", description: "Exploration of visual art through various painting techniques, color theory, and creative expression." },
  { id: "ICT220", name: "Information Technology", code: "ICT220", teacher: "Mr. Rohit Das", progress: 87, category: "specialized", color: "from-cyan-500 to-sky-500", description: "Study of computer systems, networks, databases, cybersecurity, and IT infrastructure management." },

  { id: "HIS180", name: "History", code: "HIS180", teacher: "Mr. Tom Wilson", progress: 63, category: "enrichment", color: "from-stone-500 to-amber-700", description: "Study of past events, civilizations, world history, and their impact on the modern world." },
  { id: "GEO210", name: "Geography", code: "GEO210", teacher: "Mrs. Aditi Sharma", progress: 67, category: "enrichment", color: "from-teal-500 to-cyan-500", description: "Study of Earth's landscapes, environments, populations, and the relationship between people and places." },
  { id: "ART440", name: "Painting & Visual Arts", code: "ART440", teacher: "Mr. Bikash Goon", progress: 56, category: "enrichment", color: "from-pink-500 to-rose-500", description: "Advanced study of visual arts including drawing, painting, sculpture, and art history." },
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
  { subject: "English Literature", marks: 92, total: 100, grade: "A+" },
  { subject: "Biology", marks: 81, total: 100, grade: "A" },
  { subject: "Chemistry", marks: 79, total: 100, grade: "B+" },
  { subject: "Computer Science", marks: 95, total: 100, grade: "A+" },
  { subject: "Business Studies", marks: 85, total: 100, grade: "A" },
  { subject: "Information Technology", marks: 88, total: 100, grade: "A" },
  { subject: "History", marks: 74, total: 100, grade: "B+" },
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

export const galleryImages = [
  {
    id: 1,
    label: "Annual Day",
    image: "/gallery/annual-day.avif",
    height: "h-[260px]",
  },
  {
    id: 2,
    label: "Science Fair",
    image: "/gallery/science-fair.jpg",
    height: "h-[420px]",
  },
  {
    id: 3,
    label: "Sports Meet",
    image: "/gallery/sports-meet.avif",
    height: "h-[320px]",
  },
  {
    id: 4,
    label: "Art Exhibition",
    image: "/gallery/art-exhibition.avif",
    height: "h-[380px]",
  },
  {
    id: 5,
    label: "Graduation",
    image: "/gallery/graduation.avif",
    height: "h-[280px]",
  },
  {
    id: 6,
    label: "Field Trip",
    image: "/gallery/field-trip.jpg",
    height: "h-[460px]",
  },
  {
    id: 7,
    label: "Music Night",
    image: "/gallery/music-night.avif",
    height: "h-[300px]",
  },
  {
    id: 8,
    label: "Lab Session",
    image: "/gallery/lab-session.avif",
    height: "h-[360px]",
  },
  {
    id: 9,
    label: "Library",
    image: "/gallery/library.jpg",
    height: "h-[260px]",
  },
];

export const testimonials = [
  { name: "Priya M.", role: "Parent", quote: "EduSphere transformed how we engage with our daughter's education. Real-time updates and crystal-clear insights.", initials: "PM" },
  { name: "Mr. Rajan K.", role: "Teacher", quote: "Managing assignments and tracking 120 students used to take hours. Now it takes minutes.", initials: "RK" },
  { name: "Aarav S.", role: "Student, Grade 10", quote: "I love seeing my progress visualised. It actually motivates me to do better.", initials: "AS" },
];


export const faqs = [
  ["What are the admission requirements?", "We accept applications for grades 1-12. Each level has age requirements and an entrance assessment."],
  ["What is the fee structure?", "Annual fees range from $2,400 to $9,600 depending on grade. Scholarships are available."],
  ["Do you offer transport?", "Yes, with over 20 routes covering most neighborhoods in the metro area."],
  ["What extracurriculars are available?", "Over 30 clubs spanning robotics, music, sports, debate, and the arts."],
  ["Is there boarding?", "We offer hostel facilities for grades 9-12. Limited seats — early application encouraged."],
  ["How can parents track progress?", "Through the EduSphere parent portal with real-time grades, attendance and announcements."],
];

export const feedbacks = [
  { quote: "EduSphere completely transformed how my daughter approaches learning. The teachers genuinely care and the curriculum is world-class.", author: "Priya Mehta", role: "Parent · Grade 8 student", initials: "PM" },
  { quote: "The parent portal is a game-changer. Attendance, grades and teacher feedback all in one place — no more chasing information.", author: "Rajesh Kumar", role: "Parent · Grade 5 student", initials: "RK" },
  { quote: "I joined the robotics club in Grade 9 and it changed my career path. Now I'm headed to engineering college on a full scholarship.", author: "Aanya Singh", role: "Alumni · Class of 2025", initials: "AS" },
  { quote: "Boarding facilities are excellent and the support staff treat students like family. My son has thrived beyond all our expectations.", author: "Deepa Nair", role: "Parent · Grade 11 boarding", initials: "DN" },
  { quote: "From smart classrooms to STEM labs every facility is designed to make learning exciting. EduSphere sets the gold standard.", author: "Vikram Bose", role: "Academic Advisor", initials: "VB" },
];

export const Notifications = [
  " Annual Sports Day on July 15 — Register Now!",
  " Board Exam Results: 98.7% pass rate — Congratulations Class XII!",
  " EduSphere wins State Science Olympiad 2025",
  " Admission Open for 2025–26 Academic Year",
  " Cultural Fest 'Utsav 2025' — 20th June",
  " New Computer Lab Inauguration on 10th July",
  " Green Campus Drive — Join our Tree Plantation Week",
  " Chess Tournament Finals — 25th June in Main Hall",
];

export const LEADERSHIP = [
  {
    name: "Dr. Ananya Bose",
    role: "Director",
    dept: "Higher Secondary",
    image: "https://i.pravatar.cc/300?img=47",
    quote: "Education is the passport to the future.",
    exp: "28 yrs",
  },
  {
    name: "Mr. Subhash Chandra Roy",
    role: "Principal",
    dept: "EduSphere High School",
    image: "https://i.pravatar.cc/300?img=51",
    quote: "Every child is a unique story waiting to be told.",
    exp: "21 yrs",
  },
  {
    name: "Mrs. Priya Ghosh",
    role: "Administrator",
    dept: "Academic Affairs",
    image: "https://i.pravatar.cc/300?img=49",
    quote: "Structure and care are the roots of excellence.",
    exp: "15 yrs",
  },
];

export const TOP_STUDENTS: Record<
  number,
  { name: string; rank: number; score: string; image: string }[]
> = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => {
    const cls = i + 1;
    return [
      cls,
      [
        {
          name: ["Riya Sen", "Arnav Das", "Priya Pal", "Sayan Roy", "Neha Basu", "Rahul Dev", "Anisha Mitra", "Kabir Ghosh", "Pooja Sharma", "Debjit Nag", "Sohini Dey", "Ayan Mukherjee"][i],
          rank: 1,
          score: `${97 - i}%`,
          image: `https://i.pravatar.cc/100?img=${10 + i * 3}`,
        },
        {
          name: ["Moana Dey", "Tanisha Roy", "Vikram Sen", "Ayesha Khan", "Rohan Das", "Simran Kaur", "Aditya Pal", "Tanya Bose", "Nikhil Saha", "Ishita Roy", "Arnab Sen", "Meera Joshi"][i],
          rank: 2,
          score: `${95 - i}%`,
          image: `https://i.pravatar.cc/100?img=${20 + i * 2}`,
        },
        {
          name: ["Sourish Bose", "Ritika Ghosh", "Aarav Singh", "Diya Sharma", "Kiran Mehta", "Farhan Ali", "Shreya Das", "Abir Chatterjee", "Pallavi Roy", "Jeet Mondal", "Rimi Dutta", "Suvo Biswas"][i],
          rank: 3,
          score: `${93 - i}%`,
          image: `https://i.pravatar.cc/100?img=${30 + i * 2}`,
        },
      ],
    ];
  })
);

export const RANK_STYLES = [
  { bg: "bg-amber-400", text: "text-amber-900", icon: "🥇", label: "1st" },
  { bg: "bg-slate-300", text: "text-slate-800", icon: "🥈", label: "2nd" },
  { bg: "bg-orange-300", text: "text-orange-900", icon: "🥉", label: "3rd" },
];


export const schoolPhilosophy = {
  purpose: {
    title: "Our Mission",

    intro:
      "At EduSphere, we develop purpose-driven, tech-savvy K–12 leaders by combining advanced educational technology with intentional character development, creating learners who excel academically while contributing positively to society.",

    points: [
      {
        title: "Holistic Growth",
        description:
          "Our learning ecosystem extends beyond academics to nurture discipline, self-awareness, accountability, and emotional intelligence.",
      },
      {
        title: "Ethical Leadership",
        description:
          "Students are encouraged to develop integrity, respect, responsibility, and a strong commitment to serving their communities.",
      },
      {
        title: "Future-Ready Learning",
        description:
          "Technology, innovation, and critical thinking are integrated into every stage of learning to prepare students for a rapidly evolving world.",
      },
      {
        title: "Timeless Values",
        description:
          "Inspired by enduring wisdom traditions, we cultivate devotion to duty, character, and universal human values that transcend cultures and generations.",
      },
    ],
  },

  pillars: {
    title: "Our Pillars",

    intro:
      "At EduSphere, we develop purpose-driven, tech-savvy K–12 leaders by integrating advanced educational technology with intentional character development. Our learning ecosystem cultivates analytical minds, ethical leadership, and a commitment to lifelong growth.",

    pillars: [
      "Preserving Heritage",
      "Holistic Discipline",
      "Devotion to Duty"
    ],
  },

  approach: {
    title: "Our Approach",
    description:
      "We provide a holistic learning environment where academic achievement, creativity, discipline, innovation, and character development work together to prepare students for lifelong success.",
  },

  foundations: {
    title: "Our Foundations",
    description:
      "The principles that shape our culture, guide our decisions, and inspire every student to become their best self.",
    items: [
      "Character",
      "Leadership",
      "Respect",
      "Integrity",
      "Service",
      "Excellence",
      "Innovation",
      "Discipline",
      "Compassion",
    ],
  },
};


export const facilities = {
  laboratories: {
    title: "Advanced Laboratories",
    description:
      "Students gain practical exposure through modern Physics, Chemistry, Biology, Mathematics, Geography, and Computer laboratories equipped with contemporary learning resources and experimental tools.",
    labs: [
      "Physics Laboratory",
      "Chemistry Laboratory",
      "Biology Laboratory",
      "Mathematics Laboratory",
      "Geography Laboratory",
      "Computer Laboratory",
    ],
  },

  library: {
    title: "Knowledge Resource Centre",
    description:
      "Our library houses thousands of books, journals, reference materials, magazines, and digital learning resources. The peaceful reading environment encourages research, independent learning, and intellectual curiosity among students.",
  },

  houses: [
    {
      name: "Nivedita House",
      motto: "Perseverance",
      color: "from-emerald-500 to-teal-500",
    },
    {
      name: "Matangini House",
      motto: "Dedication",
      color: "from-amber-500 to-orange-500",
    },
    {
      name: "Vivekananda House",
      motto: "Cheerfulness",
      color: "from-indigo-500 to-blue-500",
    },
    {
      name: "Netaji House",
      motto: "Courage",
      color: "from-rose-500 to-red-500",
    },
  ],

  transport: {
    title: "Safe School Transport",
    description:
      "Dedicated transport services are available across major routes. Student safety remains our highest priority through structured boarding procedures, supervised travel, and designated pickup points.",
    points: [
      "Trained Drivers",
      "Designated Bus Stops",
      "Supervised Boarding",
      "Student Safety Protocols",
      "Parent Coordination",
    ],
  },

  canteen: {
    title: "Healthy Vegetarian Canteen",
    description:
      "The school maintains a vegetarian kitchen focused on balanced nutrition and hygienic food preparation. Students enjoy healthy meals prepared according to high quality standards.",
  },
};



export const documentsList = [
  "Completed application form",
  "High school / secondary school mark sheets (10th & 12th)",
  "Bachelor's degree certificate & transcripts (for PG programs)",
  "Valid government-issued photo ID (Passport / Driver's License / National ID)",
  "Passport-size photographs (4 copies, white background)",
  "Character certificate from last attended institution",
  "Migration certificate (if applicable)",
  "Proof of address (Utility bill / Bank statement)",
  "Category certificate (SC/ST/OBC/PWD if applicable)",
  "Income certificate for scholarship applicants",
];

export const importantDates = [
  { event: "Application Opens", date: "January 15, 2026" },
  { event: "Early Bird Deadline", date: "March 31, 2026" },
  { event: "Final Application Deadline", date: "May 15, 2026" },
  { event: "Entrance Examination", date: "June 10–15, 2026" },
  { event: "Interview Round", date: "June 25–30, 2026" },
  { event: "Result Declaration", date: "July 10, 2026" },
  { event: "Admission Confirmation", date: "July 25, 2026" },
  { event: "Academic Session Begins", date: "August 15, 2026" },
];

export const quickInfo = [
  { icon: "clock", label: "Processing Time", value: "2–3 Weeks" },
  { icon: "card", label: "Application Fee", value: "₹500 (Non-refundable)" },
  { icon: "users", label: "Intake Capacity", value: "240 Students" },
  { icon: "book", label: "Programs Offered", value: "12 Courses" },
];

export const admissionInfo = [
  {
    title: "Eligibility",
    icon: "eligibility",
    color: "emerald",
    items: [
      "Minimum 60% in qualifying examination",
      "Age: 17–25 years (as of August 2026)",
      "Valid entrance exam score required",
      "English proficiency for international students",
    ],
  },
  {
    title: "Fee Structure",
    icon: "fees",
    color: "blue",
    items: [
      "Tuition: $8,500 / semester",
      "Library & Lab: $400 / year",
      "Hostel (optional): $2,400 / year",
      "Scholarships available for top 10% scorers",
    ],
  },
  {
    title: "Reservation Policy",
    icon: "reservation",
    color: "violet",
    items: [
      "SC: 15% seats reserved",
      "ST: 7.5% seats reserved",
      "OBC: 27% seats reserved",
      "PWD: 5% horizontal reservation",
    ],
  },
];

export const contactSubmissions = [
  {
    id: "CT001",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    subject: "Admission Inquiry",
    message: "I would like to know about the admission process for grade 11. Please share the fee structure and entrance exam details.",
    submittedAt: "2026-06-10T09:30:00",
    status: "unread",
  },
  {
    id: "CT002",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    subject: "Transfer Certificate",
    message: "I need a transfer certificate for my daughter who is moving to another city. Please let me know the procedure.",
    submittedAt: "2026-06-11T14:15:00",
    status: "read",
  },
  {
    id: "CT003",
    name: "Amit Singh",
    email: "amit.singh@example.com",
    subject: "Fee Payment Issue",
    message: "I tried to pay the tuition fee online but the payment gateway showed an error. My account was debited but the receipt was not generated.",
    submittedAt: "2026-06-12T11:45:00",
    status: "unread",
  },
  {
    id: "CT004",
    name: "Sneha Das",
    email: "sneha.das@example.com",
    subject: "School Timing",
    message: "Could you please share the summer school timings for grade 9? I need to plan the transport accordingly.",
    submittedAt: "2026-06-13T08:00:00",
    status: "read",
  },
  {
    id: "CT005",
    name: "Vikram Roy",
    email: "vikram.roy@example.com",
    subject: "Scholarship Application",
    message: "I want to apply for the merit-based scholarship for my son who scored 95% in the previous year. What is the application process?",
    submittedAt: "2026-06-14T16:30:00",
    status: "unread",
  },
];

export const admissionSubmissions = [
  {
    id: "ADM001",
    name: "Aarav Sharma",
    fathersName: "Rajesh Sharma",
    mothersName: "Sunita Sharma",
    phoneNumber: "9876543210",
    address: "123, Lake View Road, Agartala, Tripura",
    guardianName: "Rajesh Sharma",
    guardianRelationship: "Father",
    previousSchool: "St. Mary's High School",
    board: "CBSE",
    stream: "Science",
    marks: [
      { subject: "English", pass: 33, obtained: 85, total: 100 },
      { subject: "Bengali", pass: 33, obtained: 78, total: 100 },
      { subject: "Mathematics", pass: 33, obtained: 92, total: 100 },
      { subject: "Science", pass: 33, obtained: 88, total: 100 },
      { subject: "Social Science", pass: 33, obtained: 80, total: 100 },
    ],
    documents: ["application_form.pdf", "marksheet_10th.pdf", "photo.jpg", "id_proof.pdf"],
    submittedAt: "2026-06-11T14:00:00",
    status: "pending",
  },
  {
    id: "ADM002",
    name: "Diya Sen",
    fathersName: "Arindam Sen",
    mothersName: "Tanusree Sen",
    phoneNumber: "8765432109",
    address: "45, Green Park Colony, Agartala, Tripura",
    guardianName: "Arindam Sen",
    guardianRelationship: "Father",
    previousSchool: "Delhi Public School",
    board: "CBSE",
    stream: "Commerce",
    marks: [
      { subject: "English", pass: 33, obtained: 90, total: 100 },
      { subject: "Bengali", pass: 33, obtained: 82, total: 100 },
      { subject: "Mathematics", pass: 33, obtained: 78, total: 100 },
      { subject: "Science", pass: 33, obtained: 85, total: 100 },
      { subject: "Social Science", pass: 33, obtained: 88, total: 100 },
    ],
    documents: ["application_form.pdf", "marksheet_10th.pdf", "photo.jpg"],
    submittedAt: "2026-06-12T10:30:00",
    status: "approved",
  },
  {
    id: "ADM003",
    name: "Rohan Das",
    fathersName: "Suman Das",
    mothersName: "Mita Das",
    phoneNumber: "7654321098",
    address: "78, College Road, Agartala, Tripura",
    guardianName: "Suman Das",
    guardianRelationship: "Father",
    previousSchool: "Holy Cross School",
    board: "ICSE",
    stream: "Arts",
    marks: [
      { subject: "English", pass: 33, obtained: 75, total: 100 },
      { subject: "Bengali", pass: 33, obtained: 88, total: 100 },
      { subject: "Mathematics", pass: 33, obtained: 65, total: 100 },
      { subject: "Science", pass: 33, obtained: 72, total: 100 },
      { subject: "Social Science", pass: 33, obtained: 90, total: 100 },
    ],
    documents: ["application_form.pdf", "marksheet_10th.pdf", "photo.jpg", "migration.pdf"],
    submittedAt: "2026-06-13T15:45:00",
    status: "rejected",
  },
  {
    id: "ADM004",
    name: "Ananya Ghosh",
    fathersName: "Prosenjit Ghosh",
    mothersName: "Anindita Ghosh",
    phoneNumber: "6543210987",
    address: "12, Rabindra Pally, Agartala, Tripura",
    guardianName: "Prosenjit Ghosh",
    guardianRelationship: "Father",
    previousSchool: "South Point School",
    board: "CBSE",
    stream: "Science",
    marks: [
      { subject: "English", pass: 33, obtained: 95, total: 100 },
      { subject: "Bengali", pass: 33, obtained: 91, total: 100 },
      { subject: "Mathematics", pass: 33, obtained: 96, total: 100 },
      { subject: "Science", pass: 33, obtained: 93, total: 100 },
      { subject: "Social Science", pass: 33, obtained: 89, total: 100 },
    ],
    documents: ["application_form.pdf", "marksheet_10th.pdf", "photo.jpg", "income_cert.pdf"],
    submittedAt: "2026-06-14T09:15:00",
    status: "pending",
  },
  {
    id: "ADM005",
    name: "Arnab Mitra",
    fathersName: "Debashis Mitra",
    mothersName: "Sreela Mitra",
    phoneNumber: "5432109876",
    address: "56, Hospital Road, Agartala, Tripura",
    guardianName: "Debashis Mitra",
    guardianRelationship: "Father",
    previousSchool: "Bhavan's School",
    board: "CBSE",
    stream: "Commerce",
    marks: [
      { subject: "English", pass: 33, obtained: 82, total: 100 },
      { subject: "Bengali", pass: 33, obtained: 76, total: 100 },
      { subject: "Mathematics", pass: 33, obtained: 88, total: 100 },
      { subject: "Science", pass: 33, obtained: 70, total: 100 },
      { subject: "Social Science", pass: 33, obtained: 84, total: 100 },
    ],
    documents: ["application_form.pdf", "marksheet_10th.pdf", "photo.jpg"],
    submittedAt: "2026-06-15T11:30:00",
    status: "pending",
  },
];

// ──────────────────────────────────────────────
// Enhanced Mock Data for Student & Teacher Pages
// ──────────────────────────────────────────────

export const coreSubjects = subjects.filter(s => s.category === "core");
export const specializedSubjects = subjects.filter(s => s.category === "specialized");
export const enrichedSubjects = subjects.filter(s => s.category === "enrichment");

export const subjectSelection = {
  core: coreSubjects.map(s => ({ ...s, status: "selected" as const })),
  specialized: [
    { id: "BST301", name: "Business Studies", code: "BST301", teacher: "Mrs. Priya Sen", progress: 0, category: "specialized" as const, color: "from-amber-500 to-yellow-500", description: "", status: "selected" as const },
    { id: "ECO250", name: "Economics", code: "ECO250", teacher: "Mrs. Nandini Roy", progress: 0, category: "specialized" as const, color: "from-emerald-500 to-lime-500", description: "", status: "request_pending" as const },
    { id: "ICT220", name: "Information Technology", code: "ICT220", teacher: "Mr. Rohit Das", progress: 0, category: "specialized" as const, color: "from-cyan-500 to-sky-500", description: "", status: "selected" as const },
    { id: "RES320", name: "Research Methodology", code: "RES320", teacher: "Dr. Arjun Mehta", progress: 0, category: "specialized" as const, color: "from-slate-500 to-gray-700", description: "", status: "not_selected" as const },
  ],
  enriched: [
    { id: "HIS180", name: "History", code: "HIS180", teacher: "Mr. Tom Wilson", progress: 0, category: "enrichment" as const, color: "from-stone-500 to-amber-700", description: "", status: "selected" as const },
    { id: "ART440", name: "Painting & Visual Arts", code: "ART440", teacher: "Mr. Bikash Goon", progress: 0, category: "enrichment" as const, color: "from-pink-500 to-rose-500", description: "", status: "request_pending" as const },
  ],
};

export const assignmentDetails = {
  id: "A1",
  title: "Quadratic Equations Problem Set",
  subject: "Mathematics",
  description: "Solve the following quadratic equations using factorization, completing the square, and the quadratic formula. Show all steps clearly. Submit as a single PDF.",
  due: "2026-06-08",
  status: "pending" as const,
  totalMarks: 50,
  attachments: ["quadratic_eqns.pdf", "reference_sheet.pdf"],
  teacherRemarks: "",
  marks: null as number | null,
};

export const submissionHistory = [
  { id: "SH1", title: "Macbeth Character Essay", subject: "English", submitted: "2026-06-03", status: "graded" as const, marks: 42, total: 50, grade: "A", remarks: "Excellent analysis of Macbeth's character arc. Well-structured essay with strong textual evidence." },
  { id: "SH2", title: "Periodic Table Quiz", subject: "Chemistry", submitted: "2026-06-02", status: "graded" as const, marks: 18, total: 20, grade: "A", remarks: "Good understanding of periodic trends. Review lanthanide series." },
  { id: "SH3", title: "Cell Division Diagram", subject: "Biology", submitted: "2026-05-28", status: "graded" as const, marks: 38, total: 40, grade: "A+", remarks: "Excellent diagrams. Detailed annotations." },
  { id: "SH4", title: "Newton's Laws Problem Set", subject: "Physics", submitted: "2026-05-25", status: "graded" as const, marks: 28, total: 30, grade: "A", remarks: "Good work. Review conservation of momentum problems." },
];

export const monthlyAttendance = [
  { month: "Jan 2026", present: 22, absent: 1, late: 0, total: 23, percentage: 95.7 },
  { month: "Feb 2026", present: 20, absent: 0, late: 1, total: 21, percentage: 95.2 },
  { month: "Mar 2026", present: 18, absent: 2, late: 1, total: 21, percentage: 85.7 },
  { month: "Apr 2026", present: 20, absent: 0, late: 0, total: 20, percentage: 100 },
  { month: "May 2026", present: 21, absent: 1, late: 0, total: 22, percentage: 95.5 },
  { month: "Jun 2026", present: 15, absent: 1, late: 1, total: 17, percentage: 88.2 },
];

export const rankings = {
  classRank: 4,
  sectionRank: 2,
  totalStudents: 32,
  topStudents: [
    { rank: 1, name: "Riya Sen", gpa: "3.98", percentage: 97.5 },
    { rank: 2, name: "Arnav Das", gpa: "3.95", percentage: 96.2 },
    { rank: 3, name: "Priya Pal", gpa: "3.88", percentage: 94.8 },
    { rank: 4, name: "Aarav Sharma", gpa: "3.82", percentage: 93.1 },
    { rank: 5, name: "Neha Basu", gpa: "3.78", percentage: 92.4 },
  ],
};

export const studentProfileData = {
  personal: {
    fullName: "Aarav Sharma",
    username: "aarav.sharma",
    email: "aarav.sharma@edusphere.edu",
    phone: "+91 98765 43210",
    dateOfBirth: "2008-04-15",
    gender: "Male",
    bloodGroup: "B+",
    address: "123, Lake View Road, Agartala, Tripura",
  },
  academic: {
    rollNumber: "STU1001",
    admissionNumber: "ADM2024001",
    class: "10-A",
    section: "A",
    academicYear: "2025-2026",
    previousSchool: "St. Mary's High School",
  },
  parents: {
    fatherName: "Rajesh Sharma",
    fatherOccupation: "Software Engineer",
    fatherPhone: "+91 98765 43211",
    motherName: "Sunita Sharma",
    motherOccupation: "Teacher",
    motherPhone: "+91 98765 43212",
    guardianName: "Rajesh Sharma",
    guardianRelation: "Father",
    guardianPhone: "+91 98765 43211",
  },
  documents: [
    { name: "10th Marksheet", uploaded: "2025-06-15" },
    { name: "ID Card", uploaded: "2025-07-01" },
    { name: "Transfer Certificate", uploaded: "2025-05-20" },
  ],
};

export const dailyAttendance = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 4, 16 + i);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  return {
    day: i + 1,
    date: date.toISOString().split("T")[0],
    present: isWeekend ? null : i % 11 !== 0,
    dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
  };
});

export const notificationCategories = [
  {
    category: "Timetable Updates",
    icon: "Calendar",
    items: [
      { id: "nt1", title: "Timetable Updated for June", message: "Your class schedule has been updated for the month of June. Check the new timetable.", time: "Today, 8:30 AM", unread: true },
      { id: "nt2", title: "Library Session Added", message: "A library session has been added on Friday at 11:30 AM in the Main Library.", time: "Yesterday, 3:15 PM", unread: true },
    ],
  },
  {
    category: "Fee Notifications",
    icon: "DollarSign",
    items: [
      { id: "nf1", title: "Q3 2026 Fee Reminder", message: "Your Q3 2026 tuition fee of $2,400 is due by July 15, 2026. Pay now to avoid late fees.", time: "Today, 7:00 AM", unread: true },
      { id: "nf2", title: "Fee Receipt Available", message: "Receipt for Q2 2026 fee payment is now available for download.", time: "2 days ago", unread: false },
    ],
  },
  {
    category: "Exam Schedule Updates",
    icon: "FileText",
    items: [
      { id: "ne1", title: "Midterm Exam Schedule Published", message: "Midterm examinations begin June 12. Download your hall ticket from the Exam Schedule page.", time: "Today, 6:00 AM", unread: true },
      { id: "ne2", title: "Math Exam Rescheduled", message: "The Mathematics midterm has been moved to June 13 at 9:00 AM in Hall A.", time: "3 days ago", unread: false },
    ],
  },
  {
    category: "Assignment Updates",
    icon: "FileCheck",
    items: [
      { id: "na1", title: "New Assignment Posted", message: "Physics — Newton's Laws Lab Report is due June 10. Submit via the Assignments page.", time: "5 hours ago", unread: true },
      { id: "na2", title: "Assignment Graded", message: "Your Macbeth Character Essay has been graded. Check your marks in Submission History.", time: "1 day ago", unread: false },
    ],
  },
  {
    category: "General",
    icon: "Bell",
    items: [
      { id: "ng1", title: "School Reopening", message: "School reopens after the break on June 3. Regular classes resume.", time: "2 days ago", unread: false },
      { id: "ng2", title: "Library Extended Hours", message: "Library will remain open until 6:00 PM during exam week.", time: "3 days ago", unread: true },
    ],
  },
];

export const feeBreakdown = {
  annual: 7200,
  paid: 4800,
  pending: 2400,
  components: [
    { name: "Tuition Fee", amount: 5000, frequency: "Annual" },
    { name: "Library Fee", amount: 500, frequency: "Annual" },
    { name: "Laboratory Fee", amount: 800, frequency: "Annual" },
    { name: "Sports Fee", amount: 400, frequency: "Annual" },
    { name: "Transport Fee", amount: 500, frequency: "Optional" },
  ],
};

// ──────────────────────────────────────────────
// Teacher-Specific Mock Data
// ──────────────────────────────────────────────

export const teacherTimetable = [
  { day: "Mon", slots: [["08:00", "10-A", "Mathematics", "201"], ["09:00", "10-B", "Mathematics", "202"], ["10:00", "9-A", "Mathematics", "101"], ["11:30", "Recess", "", ""], ["12:00", "11-A", "Calculus", "301"]] },
  { day: "Tue", slots: [["08:00", "10-A", "Mathematics", "201"], ["09:00", "Lab", "10-A Practical", "Lab 1"], ["10:00", "10-B", "Mathematics", "202"], ["11:30", "Recess", "", ""], ["12:00", "9-B", "Mathematics", "102"]] },
  { day: "Wed", slots: [["08:00", "9-A", "Mathematics", "101"], ["09:00", "10-A", "Mathematics", "201"], ["10:00", "Library", "10-B Library", "Library"], ["11:30", "Recess", "", ""], ["12:00", "11-A", "Calculus", "301"]] },
  { day: "Thu", slots: [["08:00", "10-B", "Mathematics", "202"], ["09:00", "9-B", "Mathematics", "102"], ["10:00", "10-A", "Mathematics", "201"], ["11:30", "Recess", "", ""], ["12:00", "9-A", "Mathematics", "101"]] },
  { day: "Fri", slots: [["08:00", "11-A", "Calculus", "301"], ["09:00", "10-A", "Mathematics", "201"], ["10:00", "Lab", "10-B Practical", "Lab 2"], ["11:30", "Recess", "", ""], ["12:00", "9-B", "Mathematics", "102"]] },
];

export const teacherSubjectData = {
  id: "MATH101",
  name: "Mathematics",
  code: "MATH101",
  teacher: "Dr. Anika Rao",
  category: "core",
  color: "from-indigo-500 to-blue-500",
  classes: ["10-A", "10-B", "9-A", "9-B", "11-A"],
  totalStudents: 149,
  chapters: [
    {
      id: "ch1", title: "Algebra: Linear Equations", completed: true, lessons: 4, completedLessons: 4,
      modules: [
        { id: "ch1m1", title: "Linear Equations in One Variable", completed: true, subtopics: ["Solving ax + b = 0", "Word Problems", "Graphical Representation"] },
        { id: "ch1m2", title: "Linear Equations in Two Variables", completed: true, subtopics: ["Graphing Lines", "Slope-Intercept Form", "Systems of Equations"] },
      ],
      resources: [
        { id: "ch1r1", title: "Linear Equations Notes", type: "note" as const, size: "1.2 MB" },
        { id: "ch1r2", title: "Algebra Formula Sheet", type: "document" as const, size: "2.4 MB" },
      ]
    },
    {
      id: "ch2", title: "Quadratic Equations", completed: true, lessons: 6, completedLessons: 6,
      modules: [
        { id: "ch2m1", title: "Standard Form & Roots", completed: true, subtopics: ["ax² + bx + c = 0", "Discriminant", "Nature of Roots"] },
        { id: "ch2m2", title: "Solving Methods", completed: true, subtopics: ["Factorization", "Completing Square", "Quadratic Formula"] },
        { id: "ch2m3", title: "Applications", completed: true, subtopics: ["Word Problems", "Projectile Motion"] },
      ],
      resources: [
        { id: "ch2r1", title: "Quadratic Equations Lecture", type: "video" as const, size: "45 MB" },
      ]
    },
    {
      id: "ch3", title: "Coordinate Geometry", completed: true, lessons: 5, completedLessons: 5,
      modules: [
        { id: "ch3m1", title: "Cartesian System", completed: true, subtopics: ["Coordinates", "Distance Formula", "Section Formula"] },
        { id: "ch3m2", title: "Straight Lines", completed: true, subtopics: ["Slope", "Various Forms", "Angle between Lines"] },
      ],
      resources: []
    },
    {
      id: "ch4", title: "Trigonometry", completed: false, lessons: 8, completedLessons: 5,
      modules: [
        { id: "ch4m1", title: "Basic Ratios", completed: true, subtopics: ["sin, cos, tan", "Trigonometric Identities", "Complementary Angles"] },
        { id: "ch4m2", title: "Heights & Distances", completed: true, subtopics: ["Angle of Elevation", "Angle of Depression", "Real-world Problems"] },
        { id: "ch4m3", title: "Trigonometric Equations", completed: false, subtopics: ["General Solutions", "Particular Solutions"] },
      ],
      resources: [
        { id: "ch4r1", title: "Trigonometry Reference PDF", type: "document" as const, size: "3.1 MB" },
      ]
    },
    {
      id: "ch5", title: "Calculus: Limits", completed: false, lessons: 6, completedLessons: 2,
      modules: [
        { id: "ch5m1", title: "Introduction to Limits", completed: true, subtopics: ["Intuitive Definition", "One-sided Limits"] },
        { id: "ch5m2", title: "Limit Laws", completed: false, subtopics: ["Sum, Product, Quotient", "Squeeze Theorem"] },
        { id: "ch5m3", title: "Continuity", completed: false, subtopics: ["Definition", "Types of Discontinuity"] },
      ],
      resources: [
        { id: "ch5r1", title: "Practice Worksheet: Calculus", type: "document" as const, size: "1.8 MB" },
      ]
    },
    {
      id: "ch6", title: "Probability & Statistics", completed: false, lessons: 5, completedLessons: 0,
      modules: [
        { id: "ch6m1", title: "Probability Basics", completed: false, subtopics: ["Events", "Conditional Probability", "Bayes Theorem"] },
        { id: "ch6m2", title: "Statistical Measures", completed: false, subtopics: ["Mean, Median, Mode", "Standard Deviation"] },
      ],
      resources: []
    },
  ],
  evaluations: {
    total: 48,
    pending: 12,
    completed: 36,
  },
};

export const teacherProfileData = {
  personal: {
    fullName: "Dr. Anika Rao",
    email: "anika.rao@edusphere.edu",
    phone: "+91 98765 43200",
    address: "45, Green Park Colony, Agartala, Tripura",
    dateOfBirth: "1985-08-22",
    gender: "Female",
  },
  subject: {
    name: "Mathematics",
    code: "MATH101",
  },
  classes: ["10-A", "10-B", "9-A", "9-B", "11-A"],
  qualifications: [
    { degree: "Ph.D. in Mathematics", institution: "IIT Kharagpur", year: 2012 },
    { degree: "M.Sc. in Applied Mathematics", institution: "University of Calcutta", year: 2007 },
    { degree: "B.Sc. in Mathematics (Hons)", institution: "Presidency College, Kolkata", year: 2005 },
  ],
  experience: [
    { position: "Senior Mathematics Teacher", institution: "EduSphere High School", from: "2018", to: "Present" },
    { position: "Mathematics Teacher", institution: "Delhi Public School", from: "2012", to: "2018" },
  ],
  documents: [
    { name: "Ph.D. Certificate", uploaded: "2024-01-15" },
    { name: "Teaching License", uploaded: "2024-01-15" },
    { name: "Experience Certificate - DPS", uploaded: "2024-01-15" },
  ],
};

export const classStudents: Record<string, typeof students> = {
  "10-A": students.slice(0, 8).map(s => ({ ...s, class: "10-A" })),
  "10-B": students.slice(8, 16).map(s => ({ ...s, class: "10-B" })),
  "9-A": students.slice(16, 24).map(s => ({ ...s, class: "9-A" })),
};

export interface Assignment {
  id: string;
  title: string;
  class: string;
  due: string;
  submissions: number;
  total: number;
  status?: "active" | "closed" | "marked";
  graded: number;
  submittedFiles?: Record<string, { filename: string; url: string; type: string; submittedAt: string }>;
  marks?: Record<string, { marks: number; total: number; remarks: string; evaluatedAt: string }>;
}

export const teacherAssignments: Assignment[] = [
  {
    id: "TA1", title: "Quadratic Equations Problem Set", class: "10-A", due: "2026-06-08",
    submissions: 28, total: 32, graded: 18,
    submittedFiles: {
      "STU1000": { filename: "quadratic_equations_arijit.pdf", url: "#", type: "pdf", submittedAt: "2026-06-05" },
      "STU1001": { filename: "maths_hw_priya.docx", url: "#", type: "docx", submittedAt: "2026-06-06" },
      "STU1002": { filename: "problem_set_liam.pptx", url: "#", type: "pptx", submittedAt: "2026-06-07" },
    },
    marks: {
      "STU1000": { marks: 85, total: 100, remarks: "Good work, check Q4", evaluatedAt: "2026-06-09" },
    },
  },
  { id: "TA2", title: "Quadratic Equations Problem Set", class: "10-B", due: "2026-06-08", submissions: 22, total: 30, graded: 15 },
  { id: "TA3", title: "Linear Equations Worksheet", class: "9-A", due: "2026-06-10", submissions: 10, total: 34, graded: 0 },
  { id: "TA4", title: "Calculus Limits Exercise", class: "11-A", due: "2026-06-12", submissions: 5, total: 28, graded: 0 },
  { id: "TA5", title: "Coordinate Geometry Quiz", class: "9-B", due: "2026-05-30", submissions: 31, total: 31, graded: 31 },
  { id: "TA6", title: "Trigonometry Test", class: "10-A", due: "2026-05-25", submissions: 32, total: 32, graded: 32 },
];

export const librarySlots = [
  { id: "ls1", day: "Monday", date: "2026-06-15", start: "09:00", end: "10:00", room: "Main Library", available: true },
  { id: "ls2", day: "Monday", date: "2026-06-15", start: "10:00", end: "11:00", room: "Main Library", available: true },
  { id: "ls3", day: "Tuesday", date: "2026-06-16", start: "08:00", end: "09:00", room: "Main Library", available: false, bookedBy: "Dr. Samir Ghosh", subject: "Physics", class: "10-A", section: "A" },
  { id: "ls4", day: "Tuesday", date: "2026-06-16", start: "09:00", end: "10:00", room: "Main Library", available: true },
  { id: "ls5", day: "Wednesday", date: "2026-06-17", start: "08:00", end: "09:00", room: "Main Library", available: true },
  { id: "ls6", day: "Wednesday", date: "2026-06-17", start: "11:00", end: "12:00", room: "Main Library", available: true },
  { id: "ls7", day: "Thursday", date: "2026-06-18", start: "10:00", end: "11:00", room: "Main Library", available: false, bookedBy: "Mrs. Meera Nair", subject: "History", class: "10-A", section: "B" },
  { id: "ls8", day: "Friday", date: "2026-06-19", start: "08:00", end: "09:00", room: "Main Library", available: true },
];

export interface AssignmentMarks {
  marks: number;
  total: number;
}

export interface MidtermResult {
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
}

export interface StudentPerformance {
  id: string;
  rollNumber: string;
  name: string;
  class: string;
  attendancePercentage: number;
  assignmentAverage: number;
  assignmentRank: number;
  midterm: MidtermResult | null;
  overallProgress: number;
}

export const classStudentPerformance: Record<string, StudentPerformance[]> = {};

for (const [cls, clsStudents] of Object.entries(classStudents)) {
  classStudentPerformance[cls] = clsStudents.map((s, i) => {
    const idx = i + 1;
    const a1 = 65 + ((idx * 7) % 35);
    const a2 = 60 + ((idx * 11) % 38);
    const avg = Math.round((a1 + a2) / 2);

    const hasMidterm = idx % 4 !== 0;
    const mm = hasMidterm ? 55 + ((idx * 13) % 45) : null;
    const mp = mm !== null ? Math.round((mm / 100) * 100) : null;
    const grade = mp !== null
      ? (mp >= 90 ? "A+" : mp >= 80 ? "A" : mp >= 70 ? "B+" : mp >= 60 ? "B" : "C")
      : null;

    return {
      id: s.id,
      rollNumber: s.id,
      name: s.name,
      class: cls,
      attendancePercentage: s.attendance,
      assignmentAverage: avg,
      assignmentRank: 0,
      midterm: hasMidterm && mm !== null && mp !== null ? {
        marksObtained: mm,
        totalMarks: 100,
        percentage: mp,
        grade: grade!,
      } : null,
      overallProgress: Math.round(avg * 0.5 + (mp ?? 0) * 0.5),
    };
  });

  classStudentPerformance[cls].sort((a, b) => b.assignmentAverage - a.assignmentAverage);
  classStudentPerformance[cls].forEach((s, i) => { s.assignmentRank = i + 1; });
}

export interface LibrarySlot {
  id: string;
  day: string;
  date: string;
  start: string;
  end: string;
  room: string;
  available: boolean;
  bookedBy?: string;
  subject?: string;
  class?: string;
  section?: string;
}

export const answerScripts = [
  { id: "AS1", student: "Riya Sen", class: "10-A", exam: "Midterm — Mathematics", subject: "Mathematics", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-13" },
  { id: "AS2", student: "Arnav Das", class: "10-A", exam: "Midterm — Mathematics", subject: "Mathematics", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-13" },
  { id: "AS3", student: "Priya Pal", class: "10-A", exam: "Midterm — Mathematics", subject: "Mathematics", totalMarks: 100, status: "evaluating" as const, uploadedAt: "2026-06-13", draftMarks: 82, draftRemarks: "Good work. Review Q3." },
  { id: "AS4", student: "Neha Basu", class: "10-A", exam: "Midterm — Mathematics", subject: "Mathematics", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-13" },
  { id: "AS5", student: "Rahul Dev", class: "10-A", exam: "Midterm — Mathematics", subject: "Mathematics", totalMarks: 100, status: "completed" as const, marks: 91, remarks: "Excellent performance!" },
  { id: "AS6", student: "Sayan Roy", class: "10-B", exam: "Midterm — Mathematics", subject: "Mathematics", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-14" },
  { id: "AS7", student: "Tanisha Roy", class: "10-B", exam: "Midterm — Mathematics", subject: "Mathematics", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-14" },
  { id: "AS8", student: "Vikram Sen", class: "10-B", exam: "Midterm — Mathematics", subject: "Mathematics", totalMarks: 100, status: "evaluating" as const, uploadedAt: "2026-06-14", draftMarks: 76, draftRemarks: "" },
];

// ──────────────────────────────────────────────
// Admin-Specific Mock Data
// ──────────────────────────────────────────────

export const classCards = [
  { name: "10", total: 92, boys: 48, girls: 44, pendingRequests: 3, sections: ["A", "B", "C"], classTeacher: "Dr. Anika Rao" },
  { name: "9", total: 88, boys: 45, girls: 43, pendingRequests: 1, sections: ["A", "B"], classTeacher: "Mr. Rajesh Sharma" },
  { name: "11", total: 76, boys: 40, girls: 36, pendingRequests: 5, sections: ["A", "B"], classTeacher: "Prof. James Miller" },
  { name: "12", total: 64, boys: 33, girls: 31, pendingRequests: 0, sections: ["A"], classTeacher: "Dr. Sarah Khan" },
  { name: "8", total: 95, boys: 50, girls: 45, pendingRequests: 2, sections: ["A", "B"], classTeacher: "Ms. Elena Cruz" },
  { name: "7", total: 101, boys: 52, girls: 49, pendingRequests: 4, sections: ["A", "B", "C"], classTeacher: "Mrs. Pooja Das" },
];

export const classDetailsData: Record<string, {
  sections: string[];
  totalStudents: number;
  subjects: { name: string; teacher: string; code: string }[];
  classTeacher: string;
  timetable: { day: string; slots: string[][] }[];
}> = {
  "10": {
    sections: ["A", "B", "C"],
    totalStudents: 92,
    classTeacher: "Dr. Anika Rao",
    subjects: [
      { name: "Mathematics", teacher: "Dr. Anika Rao", code: "MATH101" },
      { name: "Physics", teacher: "Prof. James Miller", code: "PHY201" },
      { name: "English Literature", teacher: "Ms. Elena Cruz", code: "ENG110" },
      { name: "Biology", teacher: "Dr. Sarah Khan", code: "BIO150" },
      { name: "Chemistry", teacher: "Mr. David Park", code: "CHM120" },
      { name: "Computer Science", teacher: "Ms. Rina Gupta", code: "CS210" },
    ],
    timetable: [
      { day: "Mon", slots: [["08:00", "Mathematics", "Dr. Rao", "201"], ["09:00", "Physics", "Prof. Miller", "Lab 1"], ["10:00", "English", "Ms. Cruz", "104"], ["11:30", "Biology", "Dr. Khan", "Lab 3"]] },
      { day: "Tue", slots: [["08:00", "Chemistry", "Mr. Park", "Lab 2"], ["09:00", "CS", "Ms. Gupta", "Lab 4"], ["10:00", "Mathematics", "Dr. Rao", "201"], ["11:30", "PE", "Coach Tom", "Field"]] },
    ],
  },
  "9": {
    sections: ["A", "B"],
    totalStudents: 88,
    classTeacher: "Mr. Rajesh Sharma",
    subjects: [
      { name: "Mathematics", teacher: "Mr. Rajesh Sharma", code: "MATH101" },
      { name: "Physics", teacher: "Prof. James Miller", code: "PHY201" },
      { name: "English Literature", teacher: "Ms. Elena Cruz", code: "ENG110" },
      { name: "Biology", teacher: "Dr. Sarah Khan", code: "BIO150" },
    ],
    timetable: [
      { day: "Mon", slots: [["08:00", "Mathematics", "Mr. Sharma", "101"], ["09:00", "Physics", "Prof. Miller", "Lab 1"], ["10:00", "English", "Ms. Cruz", "104"]] },
    ],
  },
  "11": {
    sections: ["A", "B"],
    totalStudents: 76,
    classTeacher: "Prof. James Miller",
    subjects: [
      { name: "Mathematics", teacher: "Dr. Anika Rao", code: "MATH101" },
      { name: "Physics", teacher: "Prof. James Miller", code: "PHY201" },
      { name: "Chemistry", teacher: "Mr. David Park", code: "CHM120" },
      { name: "Business Studies", teacher: "Mrs. Priya Sen", code: "BST301" },
      { name: "Economics", teacher: "Mrs. Nandini Roy", code: "ECO250" },
    ],
    timetable: [
      { day: "Mon", slots: [["08:00", "Mathematics", "Dr. Rao", "301"], ["09:00", "Physics", "Prof. Miller", "Lab 1"], ["10:00", "Chemistry", "Mr. Park", "Lab 2"]] },
    ],
  },
  "12": {
    sections: ["A"],
    totalStudents: 64,
    classTeacher: "Dr. Sarah Khan",
    subjects: [
      { name: "Mathematics", teacher: "Dr. Anika Rao", code: "MATH101" },
      { name: "Physics", teacher: "", code: "PHY201" },
      { name: "Chemistry", teacher: "Mr. David Park", code: "CHM120" },
    ],
    timetable: [
      { day: "Mon", slots: [["08:00", "Mathematics", "Dr. Rao", "301"], ["10:00", "Chemistry", "Mr. Park", "Lab 2"]] },
    ],
  },
};

export const feeStatusData: Record<string, { student: string; status: "paid" | "unpaid"; amount: number; dueDate: string }[]> = {
  "10": [
    { student: "Aarav Sharma", status: "paid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Priya Patel", status: "paid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Liam Chen", status: "unpaid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Sophia Garcia", status: "paid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Noah Kim", status: "unpaid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Olivia Brown", status: "paid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Ethan Wang", status: "unpaid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Ava Johnson", status: "paid", amount: 2400, dueDate: "2026-07-15" },
  ],
  "9": [
    { student: "Mia Davis", status: "paid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Lucas Martin", status: "unpaid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Isabella Lee", status: "paid", amount: 2400, dueDate: "2026-07-15" },
    { student: "Mason Rodriguez", status: "paid", amount: 2400, dueDate: "2026-07-15" },
  ],
};

export const facultyAttendanceData = [
  { id: "TCH201", name: "Dr. Anika Rao", subject: "Mathematics", today: "present" as const, monthly: { present: 18, absent: 1, leave: 1, halfDay: 0 } },
  { id: "TCH202", name: "Mr. Rajesh Sharma", subject: "Mathematics", today: "present" as const, monthly: { present: 19, absent: 0, leave: 1, halfDay: 0 } },
  { id: "TCH203", name: "Prof. James Miller", subject: "Physics", today: "leave" as const, monthly: { present: 17, absent: 1, leave: 2, halfDay: 0 } },
  { id: "TCH204", name: "Dr. Vivek Roy", subject: "Physics", today: "present" as const, monthly: { present: 18, absent: 0, leave: 0, halfDay: 2 } },
  { id: "TCH205", name: "Ms. Elena Cruz", subject: "English Literature", today: "absent" as const, monthly: { present: 16, absent: 2, leave: 1, halfDay: 1 } },
  { id: "TCH206", name: "Mrs. Pooja Das", subject: "English Literature", today: "present" as const, monthly: { present: 20, absent: 0, leave: 0, halfDay: 0 } },
  { id: "TCH207", name: "Dr. Sarah Khan", subject: "Biology", today: "present" as const, monthly: { present: 19, absent: 0, leave: 0, halfDay: 1 } },
  { id: "TCH208", name: "Mrs. Sneha Gupta", subject: "Biology", today: "half_day" as const, monthly: { present: 18, absent: 1, leave: 0, halfDay: 1 } },
  { id: "TCH209", name: "Mr. David Park", subject: "Chemistry", today: "present" as const, monthly: { present: 20, absent: 0, leave: 0, halfDay: 0 } },
  { id: "TCH210", name: "Dr. Amit Verma", subject: "Chemistry", today: "present" as const, monthly: { present: 17, absent: 0, leave: 2, halfDay: 1 } },
  { id: "TCH211", name: "Ms. Rina Gupta", subject: "Computer Science", today: "present" as const, monthly: { present: 19, absent: 0, leave: 1, halfDay: 0 } },
  { id: "TCH212", name: "Mr. Abhishek Sen", subject: "Computer Science", today: "absent" as const, monthly: { present: 15, absent: 3, leave: 1, halfDay: 1 } },
];

export const attendanceAnalytics = {
  school: { present: 94.2, previous: 92.8, trend: "up" as const },
  byClass: [
    { class: "10", present: 96.1 },
    { class: "9", present: 93.5 },
    { class: "11", present: 91.8 },
    { class: "12", present: 88.2 },
    { class: "8", present: 95.7 },
    { class: "7", present: 94.0 },
  ],
  weeklyTrend: [
    { week: "Week 1", present: 94.0, absent: 6.0 },
    { week: "Week 2", present: 93.2, absent: 6.8 },
    { week: "Week 3", present: 95.1, absent: 4.9 },
    { week: "Week 4", present: 92.8, absent: 7.2 },
    { week: "Week 5", present: 94.5, absent: 5.5 },
  ],
};

export const examsFull = [
  { id: "E1", name: "Midterm — Mathematics", date: "2026-06-12", time: "09:00 AM", room: "Hall A", duration: "2h", classes: ["10-A", "10-B", "10-C"], subjects: ["Mathematics"], status: "scheduled" as const },
  { id: "E2", name: "Midterm — Physics", date: "2026-06-14", time: "09:00 AM", room: "Hall B", duration: "2h", classes: ["10-A", "10-B"], subjects: ["Physics"], status: "scheduled" as const },
  { id: "E3", name: "Midterm — English", date: "2026-06-16", time: "11:00 AM", room: "Hall A", duration: "1.5h", classes: ["10-A", "10-B", "9-A", "9-B"], subjects: ["English Literature"], status: "published" as const },
  { id: "E4", name: "Midterm — Biology", date: "2026-06-18", time: "09:00 AM", room: "Lab 3", duration: "2h", classes: ["10-A", "10-B"], subjects: ["Biology"], status: "draft" as const },
  { id: "E5", name: "Midterm — Chemistry", date: "2026-06-20", time: "09:00 AM", room: "Lab 2", duration: "2h", classes: ["10-A", "10-B", "11-A"], subjects: ["Chemistry"], status: "published" as const },
  { id: "E6", name: "Final — Mathematics", date: "2026-07-20", time: "09:00 AM", room: "Hall A", duration: "3h", classes: ["10-A", "10-B", "10-C"], subjects: ["Mathematics"], status: "draft" as const },
  { id: "E7", name: "Unit Test — Computer Science", date: "2026-06-08", time: "10:00 AM", room: "Lab 4", duration: "1h", classes: ["10-A"], subjects: ["Computer Science"], status: "archived" as const },
];

export const answerScriptsFull = [
  { id: "AS1", student: "Riya Sen", class: "10-A", section: "A", exam: "Midterm — Mathematics", subject: "Mathematics", teacher: "Dr. Anika Rao", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-13" },
  { id: "AS2", student: "Arnav Das", class: "10-A", section: "A", exam: "Midterm — Mathematics", subject: "Mathematics", teacher: "Dr. Anika Rao", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-13" },
  { id: "AS3", student: "Priya Pal", class: "10-A", section: "A", exam: "Midterm — Mathematics", subject: "Mathematics", teacher: "Dr. Anika Rao", totalMarks: 100, status: "evaluating" as const, uploadedAt: "2026-06-13", draftMarks: 82, draftRemarks: "Good work. Review Q3." },
  { id: "AS4", student: "Neha Basu", class: "10-A", section: "A", exam: "Midterm — Mathematics", subject: "Mathematics", teacher: "Dr. Anika Rao", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-13" },
  { id: "AS5", student: "Rahul Dev", class: "10-A", section: "A", exam: "Midterm — Mathematics", subject: "Mathematics", teacher: "Dr. Anika Rao", totalMarks: 100, status: "completed" as const, marks: 91, remarks: "Excellent performance!" },
  { id: "AS6", student: "Sayan Roy", class: "10-B", section: "B", exam: "Midterm — Mathematics", subject: "Mathematics", teacher: "Dr. Anika Rao", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-14" },
  { id: "AS7", student: "Tanisha Roy", class: "10-B", section: "B", exam: "Midterm — Mathematics", subject: "Mathematics", teacher: "Dr. Anika Rao", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-14" },
  { id: "AS8", student: "Vikram Sen", class: "10-B", section: "B", exam: "Midterm — Mathematics", subject: "Mathematics", teacher: "Dr. Anika Rao", totalMarks: 100, status: "evaluating" as const, uploadedAt: "2026-06-14", draftMarks: 76, draftRemarks: "" },
  { id: "AS9", student: "Mia Davis", class: "9-A", section: "A", exam: "Midterm — English", subject: "English Literature", teacher: "Ms. Elena Cruz", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-15" },
  { id: "AS10", student: "Lucas Martin", class: "9-A", section: "A", exam: "Midterm — English", subject: "English Literature", teacher: "Ms. Elena Cruz", totalMarks: 100, status: "pending" as const, uploadedAt: "2026-06-15" },
];

export const evaluationTracking = [
  { teacher: "Dr. Anika Rao", subject: "Mathematics", total: 48, pending: 12, evaluating: 3, completed: 33, exam: "Midterm — Mathematics" },
  { teacher: "Ms. Elena Cruz", subject: "English Literature", total: 32, pending: 20, evaluating: 2, completed: 10, exam: "Midterm — English" },
  { teacher: "Prof. James Miller", subject: "Physics", total: 28, pending: 28, evaluating: 0, completed: 0, exam: "Midterm — Physics" },
  { teacher: "Mr. David Park", subject: "Chemistry", total: 36, pending: 15, evaluating: 5, completed: 16, exam: "Midterm — Chemistry" },
];

export const eventsFull = [
  { id: "EV1", title: "Annual Science Fair", date: "2026-06-22", type: "Academic" as const, location: "Main Auditorium", description: "Students showcase innovative science projects.", status: "published" as const, banner: "/gallery/science-fair.jpg" },
  { id: "EV2", title: "Inter-School Sports Meet", date: "2026-06-28", type: "Sports" as const, location: "Sports Ground", description: "Track and field competitions.", status: "published" as const, banner: "/gallery/sports-meet.avif" },
  { id: "EV3", title: "Cultural Night", date: "2026-07-05", type: "Cultural" as const, location: "Open Theatre", description: "Music, dance and drama performances.", status: "draft" as const, banner: "" },
  { id: "EV4", title: "Parent-Teacher Meeting", date: "2026-07-10", type: "Meeting" as const, location: "All Classrooms", description: "Quarterly progress discussion.", status: "published" as const, banner: "" },
  { id: "EV5", title: "Graduation Ceremony", date: "2026-07-20", type: "Ceremony" as const, location: "Main Hall", description: "Class of 2026 graduation.", status: "published" as const, banner: "" },
  { id: "EV6", title: "Robotics Workshop", date: "2026-08-05", type: "Workshop" as const, location: "CS Lab", description: "Hands-on robotics and coding workshop for grades 8-10.", status: "draft" as const, banner: "" },
  { id: "EV7", title: "Alumni Meet", date: "2026-08-15", type: "Cultural" as const, location: "Main Hall", description: "Annual alumni gathering and networking event.", status: "archived" as const, banner: "" },
];

export const contactSubmissionsFull = [
  { id: "CT001", name: "Rahul Sharma", email: "rahul.sharma@example.com", phone: "+91 98765 43210", subject: "Admission Inquiry", message: "I would like to know about the admission process for grade 11. Please share the fee structure and entrance exam details.", submittedAt: "2026-06-10T09:30:00", status: "unread" as const },
  { id: "CT002", name: "Priya Patel", email: "priya.patel@example.com", phone: "+91 87654 32109", subject: "Transfer Certificate", message: "I need a transfer certificate for my daughter who is moving to another city. Please let me know the procedure.", submittedAt: "2026-06-11T14:15:00", status: "read" as const },
  { id: "CT003", name: "Amit Singh", email: "amit.singh@example.com", phone: "+91 76543 21098", subject: "Fee Payment Issue", message: "I tried to pay the tuition fee online but the payment gateway showed an error. My account was debited but the receipt was not generated.", submittedAt: "2026-06-12T11:45:00", status: "unread" as const },
  { id: "CT004", name: "Sneha Das", email: "sneha.das@example.com", phone: "+91 65432 10987", subject: "School Timing", message: "Could you please share the summer school timings for grade 9? I need to plan the transport accordingly.", submittedAt: "2026-06-13T08:00:00", status: "resolved" as const },
  { id: "CT005", name: "Vikram Roy", email: "vikram.roy@example.com", phone: "+91 54321 09876", subject: "Scholarship Application", message: "I want to apply for the merit-based scholarship for my son who scored 95% in the previous year. What is the application process?", submittedAt: "2026-06-14T16:30:00", status: "pending" as const },
  { id: "CT006", name: "Ananya Ghosh", email: "ananya.ghosh@example.com", phone: "+91 43210 98765", subject: "Library Membership", message: "I would like to know about the library membership process for alumni.", submittedAt: "2026-06-15T10:00:00", status: "unread" as const },
];

export const admissionStats = {
  totalApplicants: 45,
  entranceAppeared: 38,
  passed: 28,
  failed: 10,
  pendingVerification: 12,
  selected: 20,
  rejected: 8,
};

export const siteContent = {
  about: {
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoTitle: "EduSphere — Where Excellence Meets Innovation",
    featuredStudents: [
      { name: "Riya Sen", class: "10-A", achievement: "State Science Olympiad Winner", image: "https://i.pravatar.cc/100?img=10" },
      { name: "Arnav Das", class: "10-A", achievement: "National Level Debater", image: "https://i.pravatar.cc/100?img=20" },
      { name: "Priya Pal", class: "10-B", achievement: "Inter-School Athletics Gold", image: "https://i.pravatar.cc/100?img=30" },
    ],
    topStudents: [
      { name: "Riya Sen", rank: 1, percentage: 97.5, class: "10-A" },
      { name: "Arnav Das", rank: 2, percentage: 96.2, class: "10-A" },
      { name: "Priya Pal", rank: 3, percentage: 94.8, class: "10-B" },
      { name: "Sayan Roy", rank: 4, percentage: 93.1, class: "10-B" },
      { name: "Neha Basu", rank: 5, percentage: 92.4, class: "10-A" },
    ],
    content: "EduSphere Academy is a premier educational institution dedicated to nurturing young minds through a blend of academic excellence, character development, and technological innovation. With state-of-the-art facilities, experienced faculty, and a student-centric approach, we prepare our students to become future-ready global citizens.",
  },
  gallery: {
    images: [
      { id: 1, label: "Annual Day", image: "/gallery/annual-day.avif", featured: true, order: 1 },
      { id: 2, label: "Science Fair", image: "/gallery/science-fair.jpg", featured: true, order: 2 },
      { id: 3, label: "Sports Meet", image: "/gallery/sports-meet.avif", featured: true, order: 3 },
      { id: 4, label: "Art Exhibition", image: "/gallery/art-exhibition.avif", featured: false, order: 4 },
      { id: 5, label: "Graduation", image: "/gallery/graduation.avif", featured: false, order: 5 },
    ],
  },
  home: {
    featuredImages: [
      { id: 1, label: "Campus Aerial View", image: "/campus-image.jpg", starred: true, order: 1 },
      { id: 2, label: "Students in Lab", image: "/students.avif", starred: true, order: 2 },
      { id: 3, label: "Group of Students", image: "/group.avif", starred: false, order: 3 },
    ],
  },
  admission: {
    dates: [
      { event: "Application Opens", date: "January 15, 2026" },
      { event: "Early Bird Deadline", date: "March 31, 2026" },
      { event: "Final Application Deadline", date: "May 15, 2026" },
      { event: "Entrance Examination", date: "June 10–15, 2026" },
      { event: "Result Declaration", date: "July 10, 2026" },
      { event: "Academic Session Begins", date: "August 15, 2026" },
    ],
    fee: 500,
    intakeCapacity: 240,
    bannerInfo: "Admissions Open for Academic Year 2026-27",
    notices: [
      "Early bird discount of 10% available until March 31, 2026",
      "Scholarship applications must be submitted with the admission form",
      "Entrance examination syllabus is available on the admissions page",
    ],
  },
};

export const classTeacherAssignments = [
  { teacher: "Dr. Anika Rao", class: "10", academicYear: "2026-27" },
  { teacher: "Mr. Rajesh Sharma", class: "9", academicYear: "2026-27" },
  { teacher: "Prof. James Miller", class: "11", academicYear: "2026-27" },
  { teacher: "Dr. Sarah Khan", class: "12", academicYear: "2026-27" },
  { teacher: "Ms. Elena Cruz", class: "8", academicYear: "2026-27" },
  { teacher: "Mrs. Pooja Das", class: "7", academicYear: "2026-27" },
];

export type ChapterResource = {
  id: string;
  title: string;
  type: "note" | "video" | "document";
  size: string;
};

export type ClassModuleStatus = {
  id: string;
  completed: boolean;
};

export type ClassChapterStatus = {
  id: string;
  completed: boolean;
  modules: ClassModuleStatus[];
  syllabus?: { fileName: string; uploadedAt: string };
  resources: ChapterResource[];
};

export const classSubjectProgress: Record<string, ClassChapterStatus[]> = {
  "10-A": [
    {
      id: "ch1", completed: true,
      modules: [{ id: "ch1m1", completed: true }, { id: "ch1m2", completed: true }],
      resources: [{ id: "ch1r1-10a", title: "10-A Algebra Worksheet", type: "document" as const, size: "0.8 MB" }],
    },
    {
      id: "ch2", completed: true,
      modules: [{ id: "ch2m1", completed: true }, { id: "ch2m2", completed: true }, { id: "ch2m3", completed: true }],
      resources: [],
    },
    {
      id: "ch3", completed: true,
      modules: [{ id: "ch3m1", completed: true }, { id: "ch3m2", completed: true }],
      resources: [],
    },
    {
      id: "ch4", completed: false,
      modules: [{ id: "ch4m1", completed: true }, { id: "ch4m2", completed: true }, { id: "ch4m3", completed: false }],
      resources: [],
    },
    {
      id: "ch5", completed: false,
      modules: [{ id: "ch5m1", completed: true }, { id: "ch5m2", completed: false }, { id: "ch5m3", completed: false }],
      resources: [],
    },
    {
      id: "ch6", completed: false,
      modules: [{ id: "ch6m1", completed: false }, { id: "ch6m2", completed: false }],
      resources: [],
    },
  ],
  "10-B": [
    {
      id: "ch1", completed: true,
      modules: [{ id: "ch1m1", completed: true }, { id: "ch1m2", completed: true }],
      resources: [],
    },
    {
      id: "ch2", completed: false,
      modules: [{ id: "ch2m1", completed: true }, { id: "ch2m2", completed: false }, { id: "ch2m3", completed: false }],
      syllabus: { fileName: "10B_Quad_Syllabus.pdf", uploadedAt: "2026-06-20" },
      resources: [{ id: "ch2r1-10b", title: "10-B Quadratic Notes", type: "note" as const, size: "1.1 MB" }],
    },
    {
      id: "ch3", completed: false,
      modules: [{ id: "ch3m1", completed: true }, { id: "ch3m2", completed: false }],
      resources: [],
    },
    {
      id: "ch4", completed: false,
      modules: [{ id: "ch4m1", completed: false }, { id: "ch4m2", completed: false }, { id: "ch4m3", completed: false }],
      resources: [],
    },
    {
      id: "ch5", completed: false,
      modules: [{ id: "ch5m1", completed: false }, { id: "ch5m2", completed: false }, { id: "ch5m3", completed: false }],
      resources: [],
    },
    {
      id: "ch6", completed: false,
      modules: [{ id: "ch6m1", completed: false }, { id: "ch6m2", completed: false }],
      resources: [],
    },
  ],
};

export const studentSubjectResources: Record<string, ChapterResource[]> = {
  "Mathematics": [
    { id: "r1", title: "Linear Equations Notes", type: "note" as const, size: "1.2 MB" },
    { id: "r2", title: "Algebra Formula Sheet", type: "document" as const, size: "2.4 MB" },
    { id: "r3", title: "Quadratic Equations Lecture", type: "video" as const, size: "45 MB" },
    { id: "r4", title: "Trigonometry Reference PDF", type: "document" as const, size: "3.1 MB" },
    { id: "r5", title: "Practice Worksheet: Calculus", type: "document" as const, size: "1.8 MB" },
  ],
  "Physics": [
    { id: "r6", title: "Mechanics Notes", type: "note" as const, size: "2.1 MB" },
    { id: "r7", title: "Laws of Motion Worksheet", type: "document" as const, size: "1.5 MB" },
    { id: "r8", title: "Optics Lecture Recording", type: "video" as const, size: "120 MB" },
  ],
  "Chemistry": [
    { id: "r9", title: "Periodic Table Reference", type: "document" as const, size: "4.2 MB" },
    { id: "r10", title: "Chemical Bonding Notes", type: "note" as const, size: "1.8 MB" },
  ],
  "English Literature": [
    { id: "r11", title: "Poetry Analysis Guide", type: "document" as const, size: "2.0 MB" },
    { id: "r12", title: "Grammar Handbook", type: "note" as const, size: "0.9 MB" },
  ],
  "Biology": [
    { id: "r13", title: "Cell Biology Notes", type: "note" as const, size: "2.5 MB" },
    { id: "r14", title: "Genetics Worksheet", type: "document" as const, size: "1.3 MB" },
  ],
  "Computer Science": [
    { id: "r15", title: "Python Basics Guide", type: "note" as const, size: "1.6 MB" },
    { id: "r16", title: "Algorithm Visualization", type: "video" as const, size: "85 MB" },
    { id: "r17", title: "Data Structures Reference", type: "document" as const, size: "3.0 MB" },
  ],
};

export type QMark = {
  id: string;
  label: string;
  maxMarks: number;
  obtained: number | null;
};

export type PaperData = {
  id: string;
  rollNumber: string;
  studentName: string;
  submissionStatus: "submitted" | "absent" | "pending";
  scriptFile?: string;
  questions: QMark[];
  totalMarks: number;
  marksObtained: number | null;
  draftMarks: number | null;
  remarks: string;
  draftRemarks: string;
  status: "pending" | "draft" | "completed";
  evaluatedAt?: string;
};

export type ClassExamData = {
  examId: string;
  examName: string;
  className: string;
  section: string;
  examDate: string;
  subject: string;
  totalStudents: number;
  submittedCount: number;
  evaluatedCount: number;
  status: "pending" | "evaluating" | "completed";
  averageMarks?: number;
  highestMarks?: number;
  lowestMarks?: number;
  passPercentage?: number;
  papers: PaperData[];
};

const q = (id: string, label: string, max: number, obtained: number | null): QMark => ({ id, label, maxMarks: max, obtained });

const mkPaper = (
  id: string, roll: string, name: string,
  qs: QMark[], total: number, status: "pending" | "draft" | "completed",
  overrides?: Partial<PaperData>
): PaperData => ({
  id, rollNumber: roll, studentName: name,
  submissionStatus: "submitted" as const,
  questions: qs,
  totalMarks: total,
  marksObtained: status === "completed" ? qs.reduce((s, q) => s + (q.obtained ?? 0), 0) : null,
  draftMarks: status === "draft" ? qs.reduce((s, q) => s + (q.obtained ?? 0), 0) : null,
  remarks: "",
  draftRemarks: "",
  scriptFile: `/scripts/${id}.pdf`,
  status,
  ...overrides,
});

const midtermQs = [
  q("q1", "Algebra", 20, null), q("q2", "Quadratic Equations", 15, null),
  q("q3", "Coordinate Geometry", 25, null), q("q4", "Trigonometry", 20, null),
  q("q5", "Calculus", 10, null), q("q6", "Statistics", 10, null),
];

const setObtained = (qs: QMark[], vals: number[]): QMark[] =>
  qs.map((q, i) => ({ ...q, obtained: vals[i] ?? null }));

export const teacherExamData: ClassExamData[] = [
  {
    examId: "E1", examName: "Midterm Examination", className: "10-A", section: "A",
    examDate: "2026-06-12", subject: "Mathematics",
    totalStudents: 32, submittedCount: 32, evaluatedCount: 18, status: "evaluating",
    papers: [
      mkPaper("P1", "1001", "Riya Sen", setObtained(midtermQs, [18, 14, 22, 17, 9, 8]), 100, "completed", { marksObtained: 88, evaluatedAt: "2026-06-20", remarks: "Excellent work, especially in Algebra." }),
      mkPaper("P2", "1002", "Arnav Das", setObtained(midtermQs, [15, 12, 20, 14, 7, 6]), 100, "completed", { marksObtained: 74, evaluatedAt: "2026-06-20", remarks: "Good, needs practice in Trigonometry." }),
      mkPaper("P3", "1003", "Priya Pal", setObtained(midtermQs, [20, 15, 25, 18, 10, 9]), 100, "completed", { marksObtained: 97, evaluatedAt: "2026-06-21", remarks: "Outstanding performance!" }),
      mkPaper("P4", "1004", "Neha Basu", setObtained(midtermQs, [12, 10, 18, 15, 6, 5]), 100, "draft", { draftRemarks: "Review Q3, good effort." }),
      mkPaper("P5", "1005", "Rahul Dev", setObtained(midtermQs, [10, 8, 15, 12, 5, 4]), 100, "draft", { draftRemarks: "Needs to focus on Calculus." }),
      mkPaper("P6", "1006", "Sneha Kapoor", setObtained(midtermQs, [null, null, null, null, null, null]), 100, "pending"),
      mkPaper("P7", "1007", "Vikram Singh", setObtained(midtermQs, [null, null, null, null, null, null]), 100, "pending"),
    ],
  },
  {
    examId: "E1", examName: "Midterm Examination", className: "10-B", section: "B",
    examDate: "2026-06-12", subject: "Mathematics",
    totalStudents: 30, submittedCount: 30, evaluatedCount: 30, status: "completed",
    averageMarks: 81.2, highestMarks: 98, lowestMarks: 45, passPercentage: 93.3,
    papers: [
      mkPaper("P8", "1021", "Sayan Roy", setObtained(midtermQs, [19, 14, 24, 18, 9, 9]), 100, "completed", { marksObtained: 93, evaluatedAt: "2026-06-19", remarks: "Excellent consistency." }),
      mkPaper("P9", "1022", "Tanisha Roy", setObtained(midtermQs, [16, 13, 21, 16, 8, 7]), 100, "completed", { marksObtained: 81, evaluatedAt: "2026-06-19", remarks: "Good work." }),
      mkPaper("P10", "1023", "Vikram Sen", setObtained(midtermQs, [14, 10, 19, 13, 6, 5]), 100, "completed", { marksObtained: 67, evaluatedAt: "2026-06-20", remarks: "Fair, needs improvement in Coordinate Geometry." }),
      mkPaper("P11", "1024", "Aanya Gupta", setObtained(midtermQs, [20, 15, 25, 20, 10, 8]), 100, "completed", { marksObtained: 98, evaluatedAt: "2026-06-19", remarks: "Brilliant!" }),
      mkPaper("P12", "1025", "Rohit Das", setObtained(midtermQs, [8, 7, 12, 10, 4, 4]), 100, "completed", { marksObtained: 45, evaluatedAt: "2026-06-21", remarks: "Requires extra coaching." }),
    ],
  },
  {
    examId: "E1", examName: "Midterm Examination", className: "9-A", section: "A",
    examDate: "2026-06-12", subject: "Mathematics",
    totalStudents: 28, submittedCount: 28, evaluatedCount: 0, status: "pending",
    papers: [
      mkPaper("P13", "901", "Mia Davis", setObtained(midtermQs, [null, null, null, null, null, null]), 100, "pending"),
      mkPaper("P14", "902", "Lucas Martin", setObtained(midtermQs, [null, null, null, null, null, null]), 100, "pending"),
      mkPaper("P15", "903", "Isabella Lee", setObtained(midtermQs, [null, null, null, null, null, null]), 100, "pending"),
    ],
  },
  {
    examId: "E1", examName: "Midterm Examination", className: "9-B", section: "B",
    examDate: "2026-06-12", subject: "Mathematics",
    totalStudents: 26, submittedCount: 25, evaluatedCount: 0, status: "pending",
    papers: [
      mkPaper("P16", "951", "Mason Rodriguez", setObtained(midtermQs, [null, null, null, null, null, null]), 100, "pending"),
      mkPaper("P17", "952", "Aria Patel", setObtained(midtermQs, [null, null, null, null, null, null]), 100, "pending"),
    ],
  },
  {
    examId: "E2", examName: "Unit Test — Calculus", className: "11-A", section: "A",
    examDate: "2026-07-01", subject: "Mathematics",
    totalStudents: 25, submittedCount: 25, evaluatedCount: 10, status: "evaluating",
    papers: (() => {
      const utQs = [
        q("u1", "Limits", 25, null), q("u2", "Continuity", 25, null),
        q("u3", "Derivatives", 25, null), q("u4", "Applications", 25, null),
      ];
      return [
        mkPaper("P18", "1101", "Ananya Ghosh", setObtained(utQs, [22, 20, 23, 18]), 100, "completed", { marksObtained: 83, evaluatedAt: "2026-07-04", remarks: "Strong in Limits." }),
        mkPaper("P19", "1102", "Ravi Kumar", setObtained(utQs, [18, 19, 20, 16]), 100, "completed", { marksObtained: 73, evaluatedAt: "2026-07-04", remarks: "Needs practice in Applications." }),
        mkPaper("P20", "1103", "Sita Rajan", setObtained(utQs, [24, 23, 25, 22]), 100, "completed", { marksObtained: 94, evaluatedAt: "2026-07-04", remarks: "Excellent." }),
        mkPaper("P21", "1104", "Arjun Nair", setObtained(utQs, [null, null, null, null]), 100, "pending"),
        mkPaper("P22", "1105", "Divya Mehta", setObtained(utQs, [null, null, null, null]), 100, "pending"),
        mkPaper("P23", "1106", "Karan Joshi", setObtained(utQs, [15, 14, 16, 12]), 100, "draft", { draftRemarks: "Work in progress." }),
      ];
    })(),
  },
];

export const subjectAllocations = [
  { teacher: "Dr. Anika Rao", subject: "Mathematics", classes: ["10-A", "10-B", "10-C", "11-A", "11-B"], academicYear: "2026-27" },
  { teacher: "Mr. Rajesh Sharma", subject: "Mathematics", classes: ["9-A", "9-B"], academicYear: "2026-27" },
  { teacher: "Prof. James Miller", subject: "Physics", classes: ["10-A", "10-B", "11-A", "11-B"], academicYear: "2026-27" },
  { teacher: "Dr. Vivek Roy", subject: "Physics", classes: ["9-A", "9-B", "12-A"], academicYear: "2026-27" },
  { teacher: "Ms. Elena Cruz", subject: "English Literature", classes: ["10-A", "10-B", "9-A", "9-B", "8-A"], academicYear: "2026-27" },
  { teacher: "Mrs. Pooja Das", subject: "English Literature", classes: ["7-A", "7-B", "7-C"], academicYear: "2026-27" },
  { teacher: "Dr. Sarah Khan", subject: "Biology", classes: ["10-A", "10-B", "11-A", "12-A"], academicYear: "2026-27" },
  { teacher: "Mr. David Park", subject: "Chemistry", classes: ["10-A", "10-B", "11-A", "12-A"], academicYear: "2026-27" },
  { teacher: "Ms. Rina Gupta", subject: "Computer Science", classes: ["10-A", "10-B", "11-A", "11-B", "12-A", "9-A"], academicYear: "2026-27" },
];