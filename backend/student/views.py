from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .permissions import IsStudent
from .models import (
    Subject, StudentProfile, StudentSubject, AdmissionDocument,
    Assignment, AssignmentSubmission, SubmissionFile, Attendance, Result, Timetable,
    Notification,
)
from .serializers import (
    SubjectSerializer, StudentProfileSerializer, StudentSubjectSerializer,
    AdmissionDocumentSerializer, AssignmentSubmissionSerializer,
    SubmissionFileSerializer,
    AttendanceSerializer, ResultSerializer, TimetableSerializer,
    NotificationSerializer,
)
from .services import (
    add_student_subject_selection, submit_assignment,
    add_submission_file, remove_submission_file,
)
from .selectors import (
    get_student_dashboard_data, get_assigned_subjects,
    get_pending_subject_requests, get_assignments_for_student,
    get_submissions_for_student, get_attendance_for_student,
    get_results_for_student, get_timetable_for_student,
    get_student_notifications, get_available_resources,
    get_student_attendance_summary,
)


class StudentDashboard(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        data = get_student_dashboard_data(profile)
        serializer = StudentProfileSerializer(profile)
        return Response({
            **data,
            "profile": serializer.data,
        })


class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)


class SubjectListView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        subjects = Subject.objects.all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)


class MySubjectsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assigned = get_assigned_subjects(profile)
        pending = get_pending_subject_requests(profile)
        return Response({
            "assigned": SubjectSerializer(assigned, many=True).data,
            "pending": StudentSubjectSerializer(pending, many=True).data,
        })


class SubjectSelectionView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        from administration.models.subject_request import SubjectRequestControl
        ctrl, _ = SubjectRequestControl.objects.get_or_create(pk=1)
        if not ctrl.enabled:
            return Response(
                {"error": "Subject enrollment requests are currently closed by the administration."},
                status=status.HTTP_403_FORBIDDEN,
            )
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        subject_ids = request.data.get("subject_ids", [])
        try:
            add_student_subject_selection(profile, subject_ids)
            return Response(
                {"message": "Subject selection submitted for approval."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AssignmentListView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assignments = get_assignments_for_student(profile)
        from .serializers import AssignmentSerializer
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class SubmissionView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assignment_id = request.data.get("assignment")
        if not assignment_id:
            return Response(
                {"error": "assignment is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if assignment.due_date < timezone.now():
            return Response(
                {"error": "Submission deadline has passed."},
                status=status.HTTP_403_FORBIDDEN,
            )
        uploaded_files = request.FILES.getlist("files")
        if not uploaded_files:
            return Response(
                {"error": "At least one file is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(uploaded_files) > 5:
            return Response(
                {"error": "Maximum 5 files per assignment."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        submission, _ = submit_assignment(assignment, profile)
        errors = []
        added = []
        for f in uploaded_files:
            try:
                sf = add_submission_file(submission, f)
                added.append(sf)
            except Exception as e:
                errors.append({"file": f.name, "error": str(e)})
        if not added and errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)
        submission.status = "submitted"
        submission.save(update_fields=["status"])
        serializer = AssignmentSubmissionSerializer(submission)
        result = serializer.data
        if errors:
            result["file_errors"] = errors
        return Response(result, status=status.HTTP_201_CREATED)

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assignment_id = request.query_params.get("assignment")
        if assignment_id:
            try:
                submission = AssignmentSubmission.objects.get(
                    assignment_id=assignment_id, student=profile
                )
                serializer = AssignmentSubmissionSerializer(submission)
                return Response(serializer.data)
            except AssignmentSubmission.DoesNotExist:
                return Response({"submission": None})
        submissions = get_submissions_for_student(profile)
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


class SubmissionFileView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def delete(self, request, file_id):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            sf = SubmissionFile.objects.get(id=file_id, submission__student=profile)
        except SubmissionFile.DoesNotExist:
            return Response(
                {"error": "File not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if sf.submission.assignment.due_date < timezone.now():
            return Response(
                {"error": "Cannot remove files after the due date."},
                status=status.HTTP_403_FORBIDDEN,
            )
        remove_submission_file(sf)
        return Response({"message": "File removed."})


class AttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        start = request.query_params.get("start_date")
        end = request.query_params.get("end_date")
        records = get_attendance_for_student(profile, start, end)
        serializer = AttendanceSerializer(records, many=True)
        summary = get_student_attendance_summary(profile)
        return Response({
            "records": serializer.data,
            "summary": summary,
        })


class ResultView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        results = get_results_for_student(profile)
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)


class TimetableView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        timetable = get_timetable_for_student(profile)
        serializer = TimetableSerializer(timetable, many=True)
        return Response(serializer.data)


class NotificationView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        unread_only = request.query_params.get("unread_only", "").lower() == "true"
        notifications = get_student_notifications(request.user, unread_only)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def post(self, request):
        notification_id = request.data.get("notification_id")
        if notification_id:
            try:
                notif = Notification.objects.get(id=notification_id, user=request.user)
                notif.is_read = True
                notif.save()
            except Notification.DoesNotExist:
                return Response(
                    {"error": "Notification not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        return Response({"message": "Notification marked as read."})


class ResourceListView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        resources = get_available_resources(profile)
        from teacher.serializers import ResourceSerializer
        serializer = ResourceSerializer(resources, many=True)
        return Response(serializer.data)


class SubjectRequestStatusView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        from administration.models.subject_request import SubjectRequestControl
        obj, _ = SubjectRequestControl.objects.get_or_create(pk=1)
        return Response({"enabled": obj.enabled})
