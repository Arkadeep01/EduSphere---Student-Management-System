from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from administration.views.public_website import (
    PublicWebsiteSlotsView,
    PublicGalleryView,
    PublicFacilitiesView,
)
from administration.views.public_read import (
    PublicFAQView,
    PublicLeadershipView,
    PublicAnnouncementsView,
    PublicAboutPageView,
    PublicAdmissionPageView,
    PublicStatsView,
    PublicMeritView,
    PublicInstitutionSettingsView,
    PublicSubjectsView,
    PublicEventsView,
    PublicTeacherListView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("authentication/", include('allauth.urls')),
    path("", include("authentication.urls")),
    path("api/student/", include("student.urls")),
    path("api/teacher/", include("teacher.urls")),
    path("api/admin/", include("administration.urls")),
    path("api/staff/", include("staff.urls")),
    path("api/notifications/", include("notification.urls")),
    path("api/my-documents/", include("administration.my_documents_urls")),

    # Public website media
    path("api/public/website/slots/", PublicWebsiteSlotsView.as_view(), name="public-website-slots"),
    path("api/public/website/gallery/", PublicGalleryView.as_view(), name="public-website-gallery"),
    path("api/public/website/facilities/", PublicFacilitiesView.as_view(), name="public-website-facilities"),

    # Public CMS content
    path("api/public/website/faq/", PublicFAQView.as_view(), name="public-faq"),
    path("api/public/website/leadership/", PublicLeadershipView.as_view(), name="public-leadership"),
    path("api/public/website/announcements/", PublicAnnouncementsView.as_view(), name="public-announcements"),
    path("api/public/website/about/", PublicAboutPageView.as_view(), name="public-about"),
    path("api/public/website/admission/", PublicAdmissionPageView.as_view(), name="public-admission"),
    path("api/public/website/stats/", PublicStatsView.as_view(), name="public-stats"),
    path("api/public/website/merit/", PublicMeritView.as_view(), name="public-merit"),
    path("api/public/website/institution/", PublicInstitutionSettingsView.as_view(), name="public-institution"),
    path("api/public/website/subjects/", PublicSubjectsView.as_view(), name="public-subjects"),
    path("api/public/website/events/", PublicEventsView.as_view(), name="public-events"),
    path("api/public/website/teachers/", PublicTeacherListView.as_view(), name="public-teachers"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
