from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from student.models import StudentProfile, Subject
from teacher.models import TeacherProfile

from administration.models.faq import FAQ
from administration.models.leadership import Leadership
from administration.models.announcement import PublicAnnouncement
from administration.models.cms import AboutPageContent, AdmissionPageContent
from administration.models.results import StudentResult, ResultPublication
from administration.models.academic import AcademicSession, Class
from administration.serializers.faq import FAQPublicSerializer
from administration.serializers.leadership import LeadershipPublicSerializer
from administration.serializers.announcement import PublicAnnouncementPublicSerializer
from administration.serializers.cms import AboutPageContentSerializer, AdmissionPageContentSerializer

from notification.models import InstitutionSettings
from administration.models.event import Event


class PublicFAQView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        faqs = FAQ.objects.filter(is_active=True).order_by("order", "created_at")
        serializer = FAQPublicSerializer(faqs, many=True)
        return Response(serializer.data)


class PublicLeadershipView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        leaders = Leadership.objects.filter(is_active=True).order_by("order", "created_at")
        serializer = LeadershipPublicSerializer(leaders, many=True, context={"request": request})
        return Response(serializer.data)


class PublicAnnouncementsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        announcements = PublicAnnouncement.objects.filter(is_active=True).order_by("-published_at", "-created_at")
        serializer = PublicAnnouncementPublicSerializer(announcements, many=True)
        return Response(serializer.data)


class PublicAboutPageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        obj, _ = AboutPageContent.objects.get_or_create(pk=1)
        serializer = AboutPageContentSerializer(obj)
        return Response(serializer.data)


class PublicAdmissionPageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        obj, _ = AdmissionPageContent.objects.get_or_create(pk=1)
        serializer = AdmissionPageContentSerializer(obj)
        return Response(serializer.data)


class PublicStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        total_students = StudentProfile.objects.count()
        total_teachers = TeacherProfile.objects.count()
        total_subjects = Subject.objects.count()

        classes_set = set()
        for s in StudentProfile.objects.values_list("class_assigned", flat=True):
            if s:
                classes_set.add(s.split("-")[0] if "-" in s else s)
        total_classes = len(classes_set)

        return Response({
            "students": total_students,
            "teachers": total_teachers,
            "subjects": total_subjects,
            "classes": total_classes,
        })


class PublicMeritView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        current_session = AcademicSession.objects.filter(is_current=True).first()
        if not current_session:
            return Response({"classes": []})

        active_classes = Class.objects.filter(academic_session=current_session)
        published_publications = ResultPublication.objects.filter(
            academic_session=current_session,
            workflow_status="published",
        )

        if not published_publications.exists():
            return Response({"classes": []})

        latest_publication = published_publications.latest("published_at")

        result = []
        for cls in active_classes:
            class_name = cls.name
            top_students = StudentResult.objects.filter(
                publication=latest_publication,
                student__class_assigned__startswith=class_name,
            ).order_by("class_rank")[:3]

            entries = []
            for s in top_students:
                profile = s.student
                entries.append({
                    "rank": s.class_rank,
                    "name": profile.user.get_full_name() or profile.user.email,
                    "class": class_name,
                    "percentage": float(s.percentage) if s.percentage else 0,
                    "grade": s.grade or "",
                })
            if entries:
                result.append({
                    "class": class_name,
                    "students": entries,
                })

        return Response({"classes": result})


class PublicInstitutionSettingsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings = InstitutionSettings.get_settings()
        return Response({
            "institution_name": settings.institution_name,
            "address": settings.public_address or settings.address,
            "phone": settings.public_phone or settings.phone,
            "email": settings.public_email or settings.email,
            "website": settings.website,
            "facebook": settings.facebook,
            "twitter": settings.twitter,
            "instagram": settings.instagram,
            "linkedin": settings.linkedin,
            "director_message": settings.director_message or "",
            "principal_name": settings.principal_name,
            "public_website_data_mode": settings.public_website_data_mode,
        })


class PublicSubjectsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        subjects = Subject.objects.filter(is_active=True).order_by("name")
        from student.serializers import SubjectSerializer
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)


class PublicEventsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        events = Event.objects.filter(is_active=True).order_by("date", "start_time")
        data = []
        for e in events:
            data.append({
                "id": e.id,
                "title": e.title,
                "description": e.description,
                "event_type": e.event_type,
                "location": e.location,
                "date": e.date.isoformat() if e.date else None,
                "start_time": e.start_time.isoformat() if e.start_time else None,
            })
        return Response(data)


class PublicTeacherListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        teachers = TeacherProfile.objects.filter(status="active").select_related("user", "assigned_subject")
        data = []
        for t in teachers:
            data.append({
                "id": t.id,
                "name": t.user.get_full_name() or t.user.email,
                "email": t.user.email,
                "subject": t.assigned_subject.name if t.assigned_subject else "",
                "subject_code": t.assigned_subject.code if t.assigned_subject else "",
                "experience": t.experience_years or 0,
                "bio": t.bio or "",
            })
        return Response(data)
