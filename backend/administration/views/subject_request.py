from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.models.subject_request import SubjectRequestControl
from administration.serializers.subject_request import SubjectRequestControlSerializer


class SubjectRequestControlView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        obj, _ = SubjectRequestControl.objects.get_or_create(pk=1)
        serializer = SubjectRequestControlSerializer(obj)
        return Response(serializer.data)

    def patch(self, request):
        obj, _ = SubjectRequestControl.objects.get_or_create(pk=1)
        enabled = request.data.get("enabled", obj.enabled)
        obj.enabled = enabled
        obj.save()
        serializer = SubjectRequestControlSerializer(obj)
        return Response(serializer.data)
