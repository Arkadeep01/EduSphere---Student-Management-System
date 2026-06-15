from django.db import models
from django.utils import timezone

from administration.models.contact import ContactSubmission


class ContactAdminService:
    @staticmethod
    def list_submissions(filters=None):
        qs = ContactSubmission.objects.all()
        if filters:
            if filters.get("status"):
                qs = qs.filter(status=filters["status"])
            if filters.get("search"):
                qs = qs.filter(
                    models.Q(name__icontains=filters["search"])
                    | models.Q(email__icontains=filters["search"])
                    | models.Q(subject__icontains=filters["search"])
                )
        return qs.order_by("-submitted_at")

    @staticmethod
    def update_status(submission_id, status, user):
        submission = ContactSubmission.objects.get(id=submission_id)
        submission.status = status
        if status == "resolved":
            submission.resolved_at = timezone.now()
            submission.resolved_by = user
        submission.save()
        return submission

    @staticmethod
    def delete_submission(submission_id):
        ContactSubmission.objects.get(id=submission_id).delete()
