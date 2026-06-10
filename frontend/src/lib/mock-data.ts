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
  { id: "MATH101", name: "Mathematics", code: "MATH101", teacher: "Dr. Anika Rao", progress: 68, category: "core", color: "from-indigo-500 to-blue-500" },
  { id: "PHY201", name: "Physics", code: "PHY201", teacher: "Prof. James Miller", progress: 54, category: "core", color: "from-blue-500 to-cyan-500" },
  { id: "ENG110", name: "English Literature", code: "ENG110", teacher: "Ms. Elena Cruz", progress: 82, category: "core", color: "from-purple-500 to-indigo-500" },
  { id: "BIO150", name: "Biology", code: "BIO150", teacher: "Dr. Sarah Khan", progress: 41, category: "core", color: "from-green-500 to-emerald-500" },
  { id: "CHM120", name: "Chemistry", code: "CHM120", teacher: "Mr. David Park", progress: 73, category: "core", color: "from-orange-500 to-red-500" },
  { id: "CS210", name: "Computer Science", code: "CS210", teacher: "Ms. Rina Gupta", progress: 90, category: "core", color: "from-violet-500 to-purple-500" },

  { id: "BST301", name: "Business Studies", code: "BST301", teacher: "Mrs. Priya Sen", progress: 65, category: "specialized", color: "from-amber-500 to-yellow-500" },
  { id: "RES320", name: "Research Methodology", code: "RES320", teacher: "Dr. Arjun Mehta", progress: 58, category: "specialized", color: "from-slate-500 to-gray-700" },
  { id: "ICT220", name: "Information Technology", code: "ICT220", teacher: "Mr. Rohit Das", progress: 87, color: "from-cyan-500 to-sky-500" },
  { id: "ECO250", name: "Economics", code: "ECO250", teacher: "Mrs. Nandini Roy", progress: 71, category: "specialized", color: "from-emerald-500 to-lime-500" },
  { id: "PG0440", name: "Painting", code: "PG0440", teacher: "Mr. Bikash Gon", progress: 56, category: "specialized", color: "from-purple-500 to-indigo-500" },
  { id: "ICT220", name: "Information Technology", code: "ICT220", teacher: "Mr. Rohit Das", progress: 87, category: "specialized", color: "from-cyan-500 to-sky-500" },

  { id: "HIS180", name: "History", code: "HIS180", teacher: "Mr. Tom Wilson", progress: 63, category: "enrichment", color: "from-stone-500 to-amber-700" },
  { id: "GEO210", name: "Geography", code: "GEO210", teacher: "Mrs. Aditi Sharma", progress: 67, category: "enrichment", color: "from-teal-500 to-cyan-500" },
  { id: "ART440", name: "Painting & Visual Arts", code: "ART440", teacher: "Mr. Bikash Goon", progress: 56, category: "enrichment", color: "from-pink-500 to-rose-500" },
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