from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from student.permissions import IsTeacher
from student.models import Assignment, AssignmentSubmission
from student.serializers import AssignmentSubmissionSerializer
from student.services import evaluate_submission
from .models import (
    TeacherProfile, TeacherClassAssignment, TimetableEntry,
    LibrarySession, Resource, AnswerScript,
)
from .serializers import (
    TeacherProfileSerializer, TeacherClassAssignmentSerializer,
    TimetableEntrySerializer, LibrarySessionSerializer,
    ResourceSerializer, AnswerScriptSerializer,
)
from .services import (
    get_or_create_teacher_profile, assign_class_to_teacher,
    create_timetable_entry, convert_to_library_session,
    bulk_mark_attendance, save_draft_marks, submit_evaluation,
    upload_resource, replace_resource, delete_resource,
    increment_download_count,
)
from .selectors import (
    get_teacher_dashboard_data, get_assigned_classes,
    get_students_in_class, get_today_timetable,
    get_weekly_timetable, get_evaluation_queue,
    get_pending_evaluations, search_answer_scripts,
    get_library_bookings, get_teacher_resources,
    get_class_attendance_summary, get_class_student_performance,
)


class TeacherDashboard(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        profile = get_or_create_teacher_profile(request.user)
        data = get_teacher_dashboard_data(profile)
        return Response(data)


class TeacherProfileView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        profile = get_or_create_teacher_profile(request.user)
        serializer = TeacherProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = get_or_create_teacher_profile(request.user)
        serializer = TeacherProfileSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)


class TeacherClassView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        profile = get_or_create_teacher_profile(request.user)
        classes = get_assigned_classes(profile)
        serializer = TeacherClassAssignmentSerializer(classes, many=True)
        return Response(serializer.data)

    def post(self, request):
        profile = get_or_create_teacher_profile(request.user)
        class_name = request.data.get("class_name")
        if not class_name:
            return Response(
                {"error": "class_name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        assignment = assign_class_to_teacher(profile, class_name)
        serializer = TeacherClassAssignmentSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ClassStudentsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, class_name):
        profile = get_or_create_teacher_profile(request.user)
        students = get_students_in_class(profile, class_name)
        from student.serializers import StudentProfileSerializer
        serializer = StudentProfileSerializer(students, many=True)
        return Response(serializer.data)


class TimetableView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        profile = get_or_create_teacher_profile(request.user)
        day = request.query_params.get("day")
        if day:
            entries = TimetableEntry.objects.filter(
                teacher=profile, day_of_week=day
            ).order_by("start_time")
        else:
            entries = get_weekly_timetable(profile)
        serializer = TimetableEntrySerializer(entries, many=True)
        return Response(serializer.data)

    def post(self, request):
        profile = get_or_create_teacher_profile(request.user)
        try:
            entry = create_timetable_entry(profile, request.data)
            serializer = TimetableEntrySerializer(entry)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LibraryConversionView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request):
        timetable_id = request.data.get("timetable_entry_id")
        date = request.data.get("date")
        if not timetable_id or not date:
            return Response(
                {"error": "timetable_entry_id and date are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            entry = TimetableEntry.objects.get(id=timetable_id)
        except TimetableEntry.DoesNotExist:
            return Response(
                {"error": "Timetable entry not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            converted = convert_to_library_session(entry, date)
            serializer = TimetableEntrySerializer(converted)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LibraryBookingView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        profile = get_or_create_teacher_profile(request.user)
        bookings = get_library_bookings(profile)
        serializer = LibrarySessionSerializer(bookings, many=True)
        return Response(serializer.data)


class AttendanceMarkView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request):
        records = request.data.get("records", [])
        if not records:
            return Response(
                {"error": "records list is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            results = bulk_mark_attendance(records, request.user)
            return Response({"marked": len(results)})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ClassAttendanceSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, class_name):
        profile = get_or_create_teacher_profile(request.user)
        date = request.query_params.get("date")
        summary = get_class_attendance_summary(profile, class_name, date)
        return Response(summary)


class EvaluationQueueView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        profile = get_or_create_teacher_profile(request.user)
        status_filter = request.query_params.get("status", "pending")
        if status_filter == "pending":
            scripts = get_pending_evaluations(profile)
        else:
            scripts = get_evaluation_queue(profile)
        query = request.query_params.get("search")
        if query:
            scripts = search_answer_scripts(profile, query)
        serializer = AnswerScriptSerializer(scripts, many=True)
        return Response(serializer.data)


class DraftMarkView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request, script_id):
        try:
            script = AnswerScript.objects.get(id=script_id)
        except AnswerScript.DoesNotExist:
            return Response(
                {"error": "Answer script not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        marks = request.data.get("marks")
        remarks = request.data.get("remarks", "")
        if marks is None:
            return Response(
                {"error": "marks is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        script = save_draft_marks(script, marks, remarks)
        return Response({"message": "Draft saved.", "status": script.evaluation_status})


class EvaluationSubmitView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request, script_id):
        try:
            script = AnswerScript.objects.get(id=script_id)
        except AnswerScript.DoesNotExist:
            return Response(
                {"error": "Answer script not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        marks = request.data.get("marks")
        total_marks = request.data.get("total_marks")
        remarks = request.data.get("remarks", "")
        if marks is None or total_marks is None:
            return Response(
                {"error": "marks and total_marks are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        script = submit_evaluation(script, marks, total_marks, remarks)
        serializer = AnswerScriptSerializer(script)
        return Response(serializer.data)


class AssignmentSubmissionsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, assignment_id):
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        submissions = AssignmentSubmission.objects.filter(assignment=assignment)
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


class SubmissionMarksView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request, submission_id):
        try:
            submission = AssignmentSubmission.objects.get(id=submission_id)
        except AssignmentSubmission.DoesNotExist:
            return Response(
                {"error": "Submission not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        grade = request.data.get("grade")
        remarks = request.data.get("remarks", "")
        if grade is None:
            return Response(
                {"error": "grade is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        submission = evaluate_submission(submission, grade, remarks)
        serializer = AssignmentSubmissionSerializer(submission)
        return Response(serializer.data)


class ResourceView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        profile = get_or_create_teacher_profile(request.user)
        resources = get_teacher_resources(profile)
        serializer = ResourceSerializer(resources, many=True)
        return Response(serializer.data)

    def post(self, request):
        profile = get_or_create_teacher_profile(request.user)
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"error": "file is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            resource = upload_resource(profile, request.data, file)
            serializer = ResourceSerializer(resource)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ResourceDetailView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_object(self, request, resource_id):
        profile = get_or_create_teacher_profile(request.user)
        try:
            return Resource.objects.get(id=resource_id, teacher=profile)
        except Resource.DoesNotExist:
            return None

    def get(self, request, resource_id):
        resource = self.get_object(request, resource_id)
        if not resource:
            return Response({"error": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ResourceSerializer(resource)
        return Response(serializer.data)

    def put(self, request, resource_id):
        resource = self.get_object(request, resource_id)
        if not resource:
            return Response({"error": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)
        file = request.FILES.get("file")
        try:
            resource = replace_resource(resource, request.data, file)
            serializer = ResourceSerializer(resource)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, resource_id):
        resource = self.get_object(request, resource_id)
        if not resource:
            return Response({"error": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)
        delete_resource(resource)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResourceDownloadView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, resource_id):
        profile = get_or_create_teacher_profile(request.user)
        try:
            resource = Resource.objects.get(id=resource_id, teacher=profile)
        except Resource.DoesNotExist:
            return Response({"error": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)
        increment_download_count(resource)
        from django.http import FileResponse
        return FileResponse(resource.file, as_attachment=True, filename=resource.file.name.split("/")[-1])


class ClassStudentPerformanceView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, class_name):
        profile = get_or_create_teacher_profile(request.user)
        data = get_class_student_performance(profile, class_name)
        return Response(data)
