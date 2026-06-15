from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.cms_admin import CMSService
from administration.serializers.cms import (
    AboutPageContentSerializer,
    GalleryImageSerializer,
    HomepageFeaturedImageSerializer,
    AdmissionPageContentSerializer,
)


class AboutPageView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        obj = CMSService.get_about()
        serializer = AboutPageContentSerializer(obj)
        return Response(serializer.data)

    def patch(self, request):
        obj = CMSService.update_about(request.data)
        serializer = AboutPageContentSerializer(obj)
        return Response(serializer.data)


class GalleryImageView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        images = CMSService.list_gallery()
        serializer = GalleryImageSerializer(images, many=True)
        return Response(serializer.data)

    def post(self, request):
        image = request.FILES.get("image")
        label = request.data.get("label", "")
        obj = CMSService.add_gallery_image(image, label)
        serializer = GalleryImageSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GalleryImageDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, image_id):
        CMSService.delete_gallery_image(image_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class HomepageFeaturedImageView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        images = CMSService.list_homepage_images()
        serializer = HomepageFeaturedImageSerializer(images, many=True)
        return Response(serializer.data)

    def post(self, request):
        image = request.FILES.get("image")
        label = request.data.get("label", "")
        obj = CMSService.add_homepage_image(image, label)
        serializer = HomepageFeaturedImageSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HomepageFeaturedImageDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, image_id):
        CMSService.delete_homepage_image(image_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdmissionPageView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        obj = CMSService.get_admission_page()
        serializer = AdmissionPageContentSerializer(obj)
        return Response(serializer.data)

    def patch(self, request):
        obj = CMSService.update_admission_page(request.data)
        serializer = AdmissionPageContentSerializer(obj)
        return Response(serializer.data)
