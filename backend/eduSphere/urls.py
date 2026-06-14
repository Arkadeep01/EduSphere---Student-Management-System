from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("authentication/", include('allauth.urls')),
    path("", include("authentication.urls")),
    path("api/student/", include("student.urls")),
    path("api/student/", include("student.urls")),
    path("api/teacher/", include("teacher.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
