import os

from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.models.website import WebsiteImage
from administration.serializers.website import WebsiteImageSerializer
from administration.utils.image_validation import validate_and_get_errors


class SlotListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        slots = WebsiteImage.objects.all()
        serializer = WebsiteImageSerializer(slots, many=True)
        all_slots = []
        for slot_choice in WebsiteImage.Slot.choices:
            key = slot_choice[0]
            existing = next((s for s in serializer.data if s["slot"] == key), None)
            all_slots.append({
                "slot": key,
                "slot_display": slot_choice[1],
                "image": existing["image"] if existing else None,
                "alt_text": existing["alt_text"] if existing else "",
                "is_active": existing["is_active"] if existing else False,
                "id": existing["id"] if existing else None,
            })
        return Response(all_slots)


class SlotUploadView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, slot):
        if slot not in dict(WebsiteImage.Slot.choices):
            return Response({"error": f"Invalid slot: {slot}"}, status=status.HTTP_400_BAD_REQUEST)
        image = request.FILES.get("image")
        errs = validate_and_get_errors(image)
        if errs:
            return Response({"error": errs[0]}, status=status.HTTP_400_BAD_REQUEST)
        alt_text = request.data.get("alt_text", "")

        existing = WebsiteImage.objects.filter(slot=slot).first()
        old_path = None
        if existing and existing.image:
            old_path = existing.image.path

        with transaction.atomic():
            obj, created = WebsiteImage.objects.update_or_create(
                slot=slot,
                defaults={
                    "image": image,
                    "alt_text": alt_text,
                    "is_active": True,
                    "uploaded_by": request.user,
                },
            )

        if old_path and os.path.exists(old_path):
            os.remove(old_path)

        serializer = WebsiteImageSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, slot):
        if slot not in dict(WebsiteImage.Slot.choices):
            return Response({"error": f"Invalid slot: {slot}"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            obj = WebsiteImage.objects.get(slot=slot)
            obj.is_active = False
            obj.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except WebsiteImage.DoesNotExist:
            return Response({"error": "No image for this slot."}, status=status.HTTP_404_NOT_FOUND)


class SlotDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, slot):
        if slot not in dict(WebsiteImage.Slot.choices):
            return Response({"error": f"Invalid slot: {slot}"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            obj = WebsiteImage.objects.get(slot=slot)
        except WebsiteImage.DoesNotExist:
            return Response({"error": "No image for this slot."}, status=status.HTTP_404_NOT_FOUND)
        if "alt_text" in request.data:
            obj.alt_text = request.data["alt_text"]
        if "is_active" in request.data:
            obj.is_active = request.data["is_active"]
        obj.save()
        serializer = WebsiteImageSerializer(obj)
        return Response(serializer.data)