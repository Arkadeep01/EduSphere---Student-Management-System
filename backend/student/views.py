from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .permissions import IsStudent
from .models import (
    Subject, StudentProfile, StudentSubject, AdmissionDocument,
    AssignmentSubmission, Attendance, Result, Timetable, Notification,
)
from .serializers import (
    SubjectSerializer, StudentProfileSerializer, StudentSubjectSerializer,
    AdmissionDocumentSerializer, AssignmentSubmissionSerializer,
    AttendanceSerializer, ResultSerializer, TimetableSerializer,
    NotificationSerializer,
)
from .services import (
    add_student_subject_selection, submit_assignment,
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
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assignment_id = request.data.get("assignment")
        file = request.FILES.get("file")
        if not assignment_id or not file:
            return Response(
                {"error": "assignment and file are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from student.models import Assignment
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        submission = submit_assignment(assignment, profile, file)
        serializer = AssignmentSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        submissions = get_submissions_for_student(profile)
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


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
