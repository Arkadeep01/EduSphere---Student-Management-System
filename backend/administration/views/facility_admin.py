import os

from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.models.facility import FacilityImage
from administration.serializers.facility import FacilityImageSerializer
from administration.utils.image_validation import validate_and_get_errors


class FacilityListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        facilities = FacilityImage.objects.all().order_by("order", "uploaded_at")
        serializer = FacilityImageSerializer(facilities, many=True)
        return Response(serializer.data)


class FacilityUploadView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        image = request.FILES.get("image")
        errs = validate_and_get_errors(image)
        if errs:
            return Response({"error": errs[0]}, status=status.HTTP_400_BAD_REQUEST)
        name = request.data.get("name", "")
        if not name:
            return Response({"error": "Name is required."}, status=status.HTTP_400_BAD_REQUEST)
        description = request.data.get("description", "")
        obj = FacilityImage.objects.create(
            name=name,
            image=image,
            description=description,
            uploaded_by=request.user,
        )
        serializer = FacilityImageSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FacilityDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, facility_id):
        try:
            obj = FacilityImage.objects.get(id=facility_id)
        except FacilityImage.DoesNotExist:
            return Response({"error": "Facility not found."}, status=status.HTTP_404_NOT_FOUND)
        for field in ["name", "description", "order", "is_active"]:
            if field in request.data:
                setattr(obj, field, request.data[field])
        if request.FILES.get("image"):
            image = request.FILES["image"]
            errs = validate_and_get_errors(image)
            if errs:
                return Response({"error": errs[0]}, status=status.HTTP_400_BAD_REQUEST)
            old_path = obj.image.path if obj.image else None
            with transaction.atomic():
                obj.image = image
                obj.save()
            if old_path and os.path.exists(old_path):
                os.remove(old_path)
        else:
            obj.save()
        serializer = FacilityImageSerializer(obj)
        return Response(serializer.data)

    def delete(self, request, facility_id):
        try:
            obj = FacilityImage.objects.get(id=facility_id)
        except FacilityImage.DoesNotExist:
            return Response({"error": "Facility not found."}, status=status.HTTP_404_NOT_FOUND)
        if obj.image:
            obj.image.delete(save=False)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)