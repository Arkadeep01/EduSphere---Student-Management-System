from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from administration.models.website import WebsiteImage
from administration.models.facility import FacilityImage
from administration.models.cms import GalleryImage
from administration.serializers.facility import FacilityImagePublicSerializer
from administration.serializers.cms import GalleryImagePublicSerializer


class PublicWebsiteSlotsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        slots = WebsiteImage.objects.filter(is_active=True)
        data = {}
        for slot in slots:
            data[slot.slot] = {
                "image_url": request.build_absolute_uri(slot.image.url) if slot.image else None,
                "alt_text": slot.alt_text,
            }
        return Response(data)


class PublicGalleryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        images = GalleryImage.objects.filter(is_active=True).order_by("order", "uploaded_at")
        serializer = GalleryImagePublicSerializer(images, many=True, context={"request": request})
        return Response(serializer.data)


class PublicFacilitiesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        facilities = FacilityImage.objects.filter(is_active=True).order_by("order", "uploaded_at")
        serializer = FacilityImagePublicSerializer(facilities, many=True, context={"request": request})
        return Response(serializer.data)