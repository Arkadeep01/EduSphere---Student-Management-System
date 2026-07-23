from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.models.letterhead import Letterhead
from administration.serializers.letterhead import LetterheadSerializer


class LetterheadListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        letterheads = Letterhead.objects.all()
        serializer = LetterheadSerializer(letterheads, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        if data.get("is_default"):
            Letterhead.objects.filter(is_default=True).update(is_default=False)
        letterhead = Letterhead.objects.create(
            name=data["name"],
            branding=data.get("branding", {}),
            header_spacing=data.get("header_spacing", 40),
            footer_spacing=data.get("footer_spacing", 40),
            left_margin=data.get("left_margin", 20),
            right_margin=data.get("right_margin", 20),
            primary_color=data.get("primary_color", "#1e40af"),
            secondary_color=data.get("secondary_color", "#64748b"),
            footer_text=data.get("footer_text", ""),
            watermark_text=data.get("watermark_text", ""),
            signature_placeholder=data.get("signature_placeholder", ""),
            school_seal_placeholder=data.get("school_seal_placeholder", ""),
            created_by=request.user,
        )
        if data.get("logo"):
            letterhead.logo = data["logo"]
        if data.get("banner"):
            letterhead.banner = data["banner"]
        letterhead.save()
        serializer = LetterheadSerializer(letterhead)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LetterheadDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, letterhead_id):
        lh = Letterhead.objects.get(id=letterhead_id)
        if request.data.get("is_default") and not lh.is_default:
            Letterhead.objects.filter(is_default=True).update(is_default=False)
        for attr in ["name", "status", "is_default", "branding", "header_spacing",
                     "footer_spacing", "left_margin", "right_margin", "primary_color",
                     "secondary_color", "footer_text", "watermark_text",
                     "signature_placeholder", "school_seal_placeholder"]:
            if attr in request.data:
                setattr(lh, attr, request.data[attr])
        if request.FILES.get("logo"):
            lh.logo = request.FILES["logo"]
        if request.FILES.get("banner"):
            lh.banner = request.FILES["banner"]
        lh.save()
        serializer = LetterheadSerializer(lh)
        return Response(serializer.data)

    def delete(self, request, letterhead_id):
        Letterhead.objects.filter(id=letterhead_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
