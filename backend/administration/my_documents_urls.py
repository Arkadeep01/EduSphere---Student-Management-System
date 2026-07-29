from django.urls import path

from administration.views.template_admin import MyDocumentListView

urlpatterns = [
    path("", MyDocumentListView.as_view(), name="my-document-list"),
]
