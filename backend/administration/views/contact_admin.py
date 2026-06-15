from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.contact_admin import ContactAdminService
from administration.serializers.contact import ContactSubmissionSerializer


class ContactSubmissionListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        filters = {}
        if request.query_params.get("status"):
            filters["status"] = request.query_params["status"]
        if request.query_params.get("search"):
            filters["search"] = request.query_params["search"]
        submissions = ContactAdminService.list_submissions(filters)
        serializer = ContactSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


class ContactSubmissionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, submission_id):
        status_val = request.data.get("status")
        submission = ContactAdminService.update_status(submission_id, status_val, request.user)
        serializer = ContactSubmissionSerializer(submission)
        return Response(serializer.data)

    def delete(self, request, submission_id):
        ContactAdminService.delete_submission(submission_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
