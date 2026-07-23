from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from administration.permissions import IsAdmin
from administration.models import AcademicSession
from administration.services.promotion_service import PromotionService, RepeatDetainService, SessionRolloverService, BulkPromotionService


class StudentPromotionView(APIView):
    """API View for student promotion operations."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        """Promote a single student."""
        data = request.data
        student_id = data.get("student_id")
        target_class = data.get("target_class")
        target_section = data.get("section", "")
        action = data.get("action", "promote")
        reason = data.get("reason", "")

        if not student_id or not target_class:
            return Response(
                {"detail": "student_id and target_class are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = PromotionService.promote_student(
            student_id=student_id,
            target_class=target_class,
            target_section=target_section,
            action=action,
            reason=reason,
            processed_by=request.user
        )

        return Response({
            "promotion_log": {
                "id": result["promotion_log"].id,
                "student": result["promotion_log"].student.id,
                "from_class": result["promotion_log"].from_class,
                "to_class": result["promotion_log"].to_class,
                "action": result["promotion_log"].action,
            },
            "previous_class": result["previous_class"],
        }, status=status.HTTP_201_CREATED)

    def patch(self, request, student_id):
        """Repeat or detain a student."""
        data = request.data
        action = data.get("action")
        reason = data.get("reason", "")

        if action not in ["repeat", "detain"]:
            return Response(
                {"detail": "Action must be 'repeat' or 'detain'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = RepeatDetainService.create_repeat_or_detain(
            student_id=student_id,
            action=action,
            reason=reason,
            processed_by=request.user
        )

        return Response({
            "promotion_log": {
                "id": result.id,
                "student": result.student.id,
                "from_class": result.from_class,
                "to_class": result.to_class,
                "action": result.action,
            },
        }, status=status.HTTP_201_CREATED)


class StudentRepeatDetainView(APIView):
    """API View for repeat and detain operations."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        """Create a repeat or detain operation."""
        data = request.data
        student_id = data.get("student_id")
        action = data.get("action")
        reason = data.get("reason", "")

        if action not in ["repeat", "detain"]:
            return Response(
                {"detail": "Action must be 'repeat' or 'detain'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = RepeatDetainService.create_repeat_or_detain(
            student_id=student_id,
            action=action,
            reason=reason,
            processed_by=request.user
        )

        return Response({
            "promotion_log": {
                "id": result.id,
                "student": result.student.id,
                "from_class": result.from_class,
                "to_class": result.to_class,
                "action": result.action,
            },
        }, status=status.HTTP_201_CREATED)


class StudentRollbackView(APIView):
    """API View for rollback operations."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        """Rollback a promotion operation."""
        data = request.data
        promotion_log_id = data.get("promotion_log_id")
        reason = data.get("reason", "")

        if not promotion_log_id:
            return Response(
                {"detail": "promotion_log_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = RepeatDetainService.rollback(
            promotion_log_id=promotion_log_id,
            reason=reason,
            processed_by=request.user
        )

        return Response({
            "promotion_log": {
                "id": result.id,
                "student": result.student.id,
                "from_class": result.from_class,
                "to_class": result.to_class,
                "action": result.action,
                "rollback_of": result.rollback_of.id if result.rollback_of else None,
            },
        }, status=status.HTTP_201_CREATED)


class BulkPromotionView(APIView):
    """API View for bulk promotion operations."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        """Perform bulk promotion of multiple students."""
        data = request.data
        student_ids = data.get("student_ids", [])
        target_class = data.get("target_class")
        action = data.get("action", "promote")
        reason = data.get("reason", "")

        if not student_ids:
            return Response(
                {"detail": "student_ids is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not target_class:
            return Response(
                {"detail": "target_class is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = BulkPromotionService.process_bulk_promotion({
            "student_ids": student_ids,
            "target_class": target_class,
            "action": action,
            "reason": reason,
            "processed_by": request.user,
        })

        return Response({
            "bulk_promotion": result,
        }, status=status.HTTP_201_CREATED)


class AcademicSessionRolloverView(APIView):
    """API View for academic session rollover operations."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        """Create an academic session rollover."""
        data = request.data
        from_session_id = data.get("from_session_id")
        to_session_id = data.get("to_session_id")
        copy_options = data.get("copy_options", ["subjects", "teachers", "timetables", "fee_structures", "classes"])

        if not from_session_id or not to_session_id:
            return Response(
                {"detail": "from_session_id and to_session_id are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = SessionRolloverService.create_rollover(
            from_session_id=from_session_id,
            to_session_id=to_session_id,
            copy_options=copy_options,
            processed_by=request.user
        )

        return Response({
            "rollover": {
                "id": result.id,
                "from_session": result.from_session.id,
                "to_session": result.to_session.id,
                "status": result.status,
            },
        }, status=status.HTTP_201_CREATED)


class StudentHistoryView(APIView):
    """API View for student promotion history."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_id):
        """Get promotion history for a student."""
        from administration.models import StudentPromotionHistory

        history = StudentPromotionHistory.objects.filter(
            student_id=student_id
        ).select_related("academic_session").order_by("-academic_session__start_date")

        data = []
        for entry in history:
            data.append({
                "id": entry.id,
                "academic_session": entry.academic_session.id,
                "session_name": entry.academic_session.name,
                "class_name": entry.class_name,
                "section": entry.section,
                "status": entry.status,
                "percentage": entry.percentage,
                "rank": entry.rank,
                "remarks": entry.remarks,
                "created_at": entry.created_at,
            })

        return Response({"history": data})


class PromotionLogView(APIView):
    """API View for promotion logs."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """List all promotion logs."""
        from administration.models import PromotionLog

        logs = PromotionLog.objects.select_related(
            "student__user", "processed_by", "academic_session_from", "academic_session_to"
        ).order_by("-created_at")

        data = []
        for log in logs:
            data.append({
                "id": log.id,
                "student": {
                    "id": log.student.id,
                    "name": log.student.user.get_full_name(),
                    "email": log.student.user.email,
                },
                "from_class": log.from_class,
                "from_section": log.from_section,
                "to_class": log.to_class,
                "to_section": log.to_section,
                "action": log.action,
                "academic_session_from": log.academic_session_from.id if log.academic_session_from else None,
                "academic_session_to": log.academic_session_to.id if log.academic_session_to else None,
                "reason": log.reason,
                "processed_by": {
                    "id": log.processed_by.id if log.processed_by else None,
                    "name": log.processed_by.get_full_name() if log.processed_by else None,
                },
                "rollback_of": log.rollback_of.id if log.rollback_of else None,
                "created_at": log.created_at,
            })

        return Response({"logs": data})


class PromotionRuleView(APIView):
    """API View for promotion rules."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """List all promotion rules."""
        from administration.models import PromotionRule

        rules = PromotionRule.objects.all()

        data = []
        for rule in rules:
            data.append({
                "id": rule.id,
                "name": rule.name,
                "from_class": rule.from_class,
                "min_percentage": rule.min_percentage,
                "min_attendance_percentage": rule.min_attendance_percentage,
                "max_failed_subjects": rule.max_failed_subjects,
                "is_active": rule.is_active,
                "created_at": rule.created_at,
                "updated_at": rule.updated_at,
            })

        return Response({"rules": data})

    def post(self, request):
        """Create a new promotion rule."""
        from administration.models import PromotionRule

        data = request.data
        rule = PromotionRule.objects.create(
            name=data.get("name"),
            from_class=data.get("from_class"),
            min_percentage=data.get("min_percentage", 40),
            min_attendance_percentage=data.get("min_attendance_percentage", 75),
            max_failed_subjects=data.get("max_failed_subjects", 0),
            is_active=data.get("is_active", True),
        )

        return Response({
            "rule": {
                "id": rule.id,
                "name": rule.name,
                "from_class": rule.from_class,
                "min_percentage": rule.min_percentage,
                "min_attendance_percentage": rule.min_attendance_percentage,
                "max_failed_subjects": rule.max_failed_subjects,
                "is_active": rule.is_active,
            },
        }, status=status.HTTP_201_CREATED)

    def patch(self, request, rule_id):
        """Update a promotion rule."""
        from administration.models import PromotionRule

        rule = get_object_or_404(PromotionRule, id=rule_id)
        data = request.data

        for field in ["name", "from_class", "min_percentage", "min_attendance_percentage", "max_failed_subjects", "is_active"]:
            if field in data:
                setattr(rule, field, data[field])

        rule.save()

        return Response({
            "rule": {
                "id": rule.id,
                "name": rule.name,
                "from_class": rule.from_class,
                "min_percentage": rule.min_percentage,
                "min_attendance_percentage": rule.min_attendance_percentage,
                "max_failed_subjects": rule.max_failed_subjects,
                "is_active": rule.is_active,
            },
        })

    def delete(self, request, rule_id):
        """Delete a promotion rule."""
        from administration.models import PromotionRule

        rule = get_object_or_404(PromotionRule, id=rule_id)
        rule.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class SessionRolloverDetailView(APIView):
    """API View for academic session rollover details."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, rollover_id):
        """Get details of a session rollover."""
        from administration.models import AcademicSessionRollover

        rollover = get_object_or_404(
            AcademicSessionRollover.objects.select_related(
                "from_session", "to_session", "processed_by"
            ),
            id=rollover_id
        )

        data = {
            "id": rollover.id,
            "from_session": {
                "id": rollover.from_session.id,
                "name": rollover.from_session.name,
            },
            "to_session": {
                "id": rollover.to_session.id,
                "name": rollover.to_session.name,
            },
            "status": rollover.status,
            "copy_options": rollover.copy_options,
            "processed_by": {
                "id": rollover.processed_by.id if rollover.processed_by else None,
                "name": rollover.processed_by.get_full_name() if rollover.processed_by else None,
            },
            "created_at": rollover.created_at,
            "completed_at": rollover.completed_at,
            "error_log": rollover.error_log,
        }

        return Response({"rollover": data})