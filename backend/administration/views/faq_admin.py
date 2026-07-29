from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsDirector
from administration.services.faq import FAQService
from administration.serializers.faq import FAQSerializer


class FAQListView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request):
        faqs = FAQService.list_all()
        serializer = FAQSerializer(faqs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FAQSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        obj = FAQService.create(serializer.validated_data)
        result = FAQSerializer(obj)
        return Response(result.data, status=status.HTTP_201_CREATED)


class FAQDetailView(APIView):
    permission_classes = [IsAuthenticated, IsDirector]

    def get(self, request, faq_id):
        obj = FAQService.get(faq_id)
        serializer = FAQSerializer(obj)
        return Response(serializer.data)

    def patch(self, request, faq_id):
        serializer = FAQSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        obj = FAQService.update(faq_id, serializer.validated_data)
        result = FAQSerializer(obj)
        return Response(result.data)

    def delete(self, request, faq_id):
        FAQService.delete(faq_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
