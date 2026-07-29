from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from administration.permissions import IsDirector
from administration.services.cms_admin import CMSService
from administration.serializers.cms import AboutPageContentSerializer, AdmissionPageContentSerializer


class DirectorAboutPageView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request):
        obj = CMSService.get_about()
        serializer = AboutPageContentSerializer(obj)
        return Response(serializer.data)

    def patch(self, request):
        obj = CMSService.update_about(request.data)
        serializer = AboutPageContentSerializer(obj)
        return Response(serializer.data)


class DirectorAdmissionPageView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request):
        obj = CMSService.get_admission_page()
        serializer = AdmissionPageContentSerializer(obj)
        return Response(serializer.data)

    def patch(self, request):
        obj = CMSService.update_admission_page(request.data)
        serializer = AdmissionPageContentSerializer(obj)
        return Response(serializer.data)
