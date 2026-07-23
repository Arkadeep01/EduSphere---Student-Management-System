from django.core.management.base import BaseCommand
from django.conf import settings
from authentication.models import CustomUser
from student.models import Subject, StudentProfile, StudentSubject
from teacher.models import TeacherProfile, TeacherClassAssignment


CORE_SUBJECTS = [
    {"name": "Mathematics", "code": "MATH101", "tier": "core",
     "color": "from-indigo-500 to-blue-500",
     "description": "Study of numbers, quantities, shapes, and patterns."},
    {"name": "Physics", "code": "PHY201", "tier": "core",
     "color": "from-blue-500 to-cyan-500",
     "description": "Fundamental science exploring matter, energy, motion, and force."},
    {"name": "English Literature", "code": "ENG110", "tier": "core",
     "color": "from-purple-500 to-indigo-500",
     "description": "Study of prose, poetry, and drama from classic to contemporary literature."},
    {"name": "Biology", "code": "BIO150", "tier": "core",
     "color": "from-green-500 to-emerald-500",
     "description": "Study of living organisms, cell biology, genetics, and evolution."},
    {"name": "Chemistry", "code": "CHM120", "tier": "core",
     "color": "from-orange-500 to-red-500",
     "description": "Study of matter, its properties, composition, and reactions."},
    {"name": "Computer Science", "code": "CS210", "tier": "core",
     "color": "from-violet-500 to-purple-500",
     "description": "Study of computation, algorithms, programming, and data structures."},
]

SPECIALIZED_SUBJECTS = [
    {"name": "Business Studies", "code": "BST301", "tier": "specialized",
     "color": "from-amber-500 to-yellow-500",
     "description": "Introduction to business concepts, management principles, and entrepreneurship."},
    {"name": "Research Methodology", "code": "RES320", "tier": "specialized",
     "color": "from-slate-500 to-gray-700",
     "description": "Systematic approach to research design, data collection, and analysis methods."},
    {"name": "Economics", "code": "ECO250", "tier": "specialized",
     "color": "from-emerald-500 to-lime-500",
     "description": "Study of resource allocation, market dynamics, and economic policy."},
    {"name": "Information Technology", "code": "ICT220", "tier": "specialized",
     "color": "from-cyan-500 to-sky-500",
     "description": "Study of computer systems, networks, databases, and cybersecurity."},
    {"name": "Painting", "code": "PG0440", "tier": "specialized",
     "color": "from-purple-500 to-indigo-500",
     "description": "Exploration of visual art through various painting techniques and creative expression."},
]

ENRICHMENT_SUBJECTS = [
    {"name": "History", "code": "HIS180", "tier": "enrichment",
     "color": "from-stone-500 to-amber-700",
     "description": "Study of past events, civilizations, and their impact on the modern world."},
    {"name": "Geography", "code": "GEO210", "tier": "enrichment",
     "color": "from-teal-500 to-cyan-500",
     "description": "Study of Earth's landscapes, environments, and populations."},
    {"name": "Painting & Visual Arts", "code": "ART440", "tier": "enrichment",
     "color": "from-pink-500 to-rose-500",
     "description": "Advanced study of visual arts including drawing, painting, and sculpture."},
]

TEACHER_DATA = [
    {"email": "anika.rao@edusphere.edu", "first_name": "Anika", "last_name": "Rao", "subject_code": "MATH101", "classes": ["X-A", "X-B", "IX-A", "IX-B", "XI-A"]},
    {"email": "james.miller@edusphere.edu", "first_name": "James", "last_name": "Miller", "subject_code": "PHY201", "classes": ["XI-A", "XI-B", "X-A", "X-B"]},
    {"email": "elena.cruz@edusphere.edu", "first_name": "Elena", "last_name": "Cruz", "subject_code": "ENG110", "classes": ["X-A", "X-B", "IX-A", "IX-B", "XI-A"]},
    {"email": "sarah.khan@edusphere.edu", "first_name": "Sarah", "last_name": "Khan", "subject_code": "BIO150", "classes": ["XI-A", "XI-B", "X-A", "X-B"]},
    {"email": "david.park@edusphere.edu", "first_name": "David", "last_name": "Park", "subject_code": "CHM120", "classes": ["XI-A", "XI-B", "X-A", "X-B"]},
    {"email": "rina.gupta@edusphere.edu", "first_name": "Rina", "last_name": "Gupta", "subject_code": "CS210", "classes": ["X-A", "X-B", "IX-A", "IX-B", "XI-A", "XI-B"]},
    {"email": "priya.sen@edusphere.edu", "first_name": "Priya", "last_name": "Sen", "subject_code": "BST301", "classes": ["XI-A", "XI-B"]},
    {"email": "nandini.roy@edusphere.edu", "first_name": "Nandini", "last_name": "Roy", "subject_code": "ECO250", "classes": ["XI-A", "XI-B"]},
    {"email": "tom.wilson@edusphere.edu", "first_name": "Tom", "last_name": "Wilson", "subject_code": "HIS180", "classes": ["IX-A", "IX-B", "X-A", "X-B", "XI-A"]},
]

STUDENT_DATA = [
    {"email": "aarav.sharma@edusphere.edu", "first_name": "Aarav", "last_name": "Sharma", "class": "X-A", "roll": "STU1001"},
    {"email": "priya.patel@edusphere.edu", "first_name": "Priya", "last_name": "Patel", "class": "X-B", "roll": "STU1002"},
    {"email": "liam.chen@edusphere.edu", "first_name": "Liam", "last_name": "Chen", "class": "X-A", "roll": "STU1003"},
    {"email": "sophia.garcia@edusphere.edu", "first_name": "Sophia", "last_name": "Garcia", "class": "XI-B", "roll": "STU1004"},
    {"email": "olivia.brown@edusphere.edu", "first_name": "Olivia", "last_name": "Brown", "class": "XI-A", "roll": "STU1005"},
    {"email": "ethan.wang@edusphere.edu", "first_name": "Ethan", "last_name": "Wang", "class": "IX-A", "roll": "STU1006"},
    {"email": "ava.johnson@edusphere.edu", "first_name": "Ava", "last_name": "Johnson", "class": "X-B", "roll": "STU1007"},
    {"email": "mia.davis@edusphere.edu", "first_name": "Mia", "last_name": "Davis", "class": "IX-B", "roll": "STU1008"},
]


class Command(BaseCommand):
    help = "Seed the database with foundational data"

    def handle(self, *args, **options):
        self._seed_subjects()
        self._ensure_admin()
        self._seed_teachers()
        self._seed_students()
        self.stdout.write(self.style.SUCCESS("Seeding complete."))

    def _seed_subjects(self):
        all_subjects = CORE_SUBJECTS + SPECIALIZED_SUBJECTS + ENRICHMENT_SUBJECTS
        created = 0
        for data in all_subjects:
            _, was_created = Subject.objects.get_or_create(code=data["code"], defaults=data)
            if was_created:
                created += 1
        self.stdout.write(f"Subjects: {created} created, {len(all_subjects) - created} exist.")

    def _ensure_admin(self):
        if not CustomUser.objects.filter(is_superuser=True).exists():
            CustomUser.objects.create_superuser(
                email="admin@edusphere.edu", password="admin123",
                username="admin", mobile="1234567890",
            )

    def _seed_teachers(self):
        for t in TEACHER_DATA:
            user, created = CustomUser.objects.get_or_create(
                email=t["email"],
                defaults={
                    "first_name": t["first_name"], "last_name": t["last_name"],
                    "username": t["email"].split("@")[0],
                    "role": "teacher", "is_staff": True, "is_active": True,
                    "mobile": "1234567890",
                },
            )
            if created:
                user.set_password("teacher123")
                user.save()

            subject = Subject.objects.get(code=t["subject_code"])
            profile, _ = TeacherProfile.objects.get_or_create(
                user=user, defaults={"assigned_subject": subject},
            )
            if profile.assigned_subject != subject:
                profile.assigned_subject = subject
                profile.save()

            for class_name in t["classes"]:
                TeacherClassAssignment.objects.get_or_create(
                    teacher=profile, class_name=class_name,
                )
        self.stdout.write(f"Teachers: {len(TEACHER_DATA)} seeded.")

    def _seed_students(self):
        for s in STUDENT_DATA:
            user, created = CustomUser.objects.get_or_create(
                email=s["email"],
                defaults={
                    "first_name": s["first_name"], "last_name": s["last_name"],
                    "username": s["email"].split("@")[0],
                    "role": "student", "is_staff": False, "is_active": True,
                    "mobile": "1234567890",
                },
            )
            if created:
                user.set_password("student123")
                user.save()

            profile, _ = StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    "class_assigned": s["class"],
                    "roll_number": s["roll"],
                    "admission_number": s["roll"].replace("STU", "ADM"),
                },
            )

            core_subjects = Subject.objects.filter(tier="core")
            for subject in core_subjects:
                StudentSubject.objects.get_or_create(
                    student=profile, subject=subject,
                    defaults={"status": "approved", "assigned_by_admin": True},
                )
        self.stdout.write(f"Students: {len(STUDENT_DATA)} seeded.")
