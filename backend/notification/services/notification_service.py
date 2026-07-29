import json
import logging
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.db.models import Q, Count, Sum
from django.conf import settings

from ..models import (
    Notification, NotificationRecipient, NotificationAuditLog,
    NotificationSchedule, DeliveryLog, NotificationType, Priority,
    NotificationStatus, ReadStatus, DeliveryStatus, TargetAudience,
)
from authentication.models import CustomUser
from student.models import StudentProfile
from teacher.models import TeacherProfile
from .email_service import EmailService
from .realtime_manager import RealtimeManager

logger = logging.getLogger(__name__)


class PriorityManager:
    OVERRIDE_PERMITTED_ROLES = ["admin"]

    @classmethod
    def validate_priority(cls, priority: str) -> bool:
        return priority in dict(Priority.choices)

    @classmethod
    def can_override(cls, user) -> bool:
        return user.role in cls.OVERRIDE_PERMITTED_ROLES or user.is_superuser

    @classmethod
    def override_priority(cls, notification: Notification, new_priority: str, performed_by) -> Notification:
        if not cls.can_override(performed_by):
            raise PermissionError("Only admins can override priorities")

        old_priority = notification.priority
        notification.priority = new_priority
        notification.save()

        NotificationAuditLog.objects.create(
            notification=notification,
            action="priority_overridden",
            performed_by=performed_by,
            description=f"Priority changed from {old_priority} to {new_priority}",
            metadata={"old_priority": old_priority, "new_priority": new_priority},
        )
        return notification


class ExpiryManager:
    @classmethod
    def expire_notification(cls, notification: Notification):
        notification.status = NotificationStatus.EXPIRED
        notification.save()
        NotificationAuditLog.objects.create(
            notification=notification,
            action="expired",
            description="Notification auto-expired",
        )

    @classmethod
    def process_expired(cls):
        now = timezone.now()
        expired = Notification.objects.filter(
            expires_at__lte=now,
            status=NotificationStatus.ACTIVE,
        )
        count = 0
        for n in expired:
            cls.expire_notification(n)
            count += 1
        if count:
            logger.info(f"Expired {count} notifications")
        return count

    @classmethod
    def cleanup_expired(cls):
        cutoff = timezone.now() - timedelta(days=30)
        deleted, _ = Notification.objects.filter(
            status=NotificationStatus.EXPIRED,
            created_at__lte=cutoff,
        ).delete()
        if deleted:
            logger.info(f"Cleaned up {deleted} expired notifications")
        return deleted


class ReadTracker:
    @classmethod
    def mark_read(cls, notification_id: int, user_id: int) -> NotificationRecipient:
        recipient = NotificationRecipient.objects.get(
            notification_id=notification_id,
            user_id=user_id,
        )
        recipient.read_status = ReadStatus.READ
        recipient.read_at = timezone.now()
        recipient.save()

        NotificationAuditLog.objects.create(
            notification_id=notification_id,
            action="read",
            description=f"Read by user {user_id}",
        )
        return recipient

    @classmethod
    def mark_all_read(cls, user_id: int) -> int:
        count = NotificationRecipient.objects.filter(
            user_id=user_id,
            read_status=ReadStatus.UNREAD,
        ).update(
            read_status=ReadStatus.READ,
            read_at=timezone.now(),
        )
        return count

    @classmethod
    def bulk_mark_read(cls, notification_ids: list, user_id: int) -> int:
        count = NotificationRecipient.objects.filter(
            notification_id__in=notification_ids,
            user_id=user_id,
            read_status=ReadStatus.UNREAD,
        ).update(
            read_status=ReadStatus.READ,
            read_at=timezone.now(),
        )
        return count

    @classmethod
    def unread_count(cls, user_id: int) -> int:
        return NotificationRecipient.objects.filter(
            user_id=user_id,
            read_status=ReadStatus.UNREAD,
            notification__status=NotificationStatus.ACTIVE,
        ).count()


class DeliveryTracker:
    @classmethod
    def mark_delivered(cls, recipient: NotificationRecipient):
        recipient.delivery_status = DeliveryStatus.DELIVERED
        recipient.delivered_at = timezone.now()
        recipient.save()

    @classmethod
    def mark_failed(cls, recipient: NotificationRecipient, reason: str = ""):
        recipient.delivery_status = DeliveryStatus.FAILED
        recipient.failure_reason = reason[:500]
        recipient.save()
        DeliveryLog.objects.create(
            notification=recipient.notification,
            recipient=recipient,
            channel="system",
            status=DeliveryStatus.FAILED,
            error_message=reason[:500],
        )

    @classmethod
    def retry(cls, recipient: NotificationRecipient) -> bool:
        if recipient.retry_count >= 3:
            return False

        recipient.retry_count += 1
        recipient.delivery_status = DeliveryStatus.RETRY
        recipient.save()

        DeliveryLog.objects.create(
            notification=recipient.notification,
            recipient=recipient,
            channel="system",
            status=DeliveryStatus.RETRY,
            retry_count=recipient.retry_count,
        )

        success = NotificationService._deliver_to_single_recipient(recipient)
        if success:
            cls.mark_delivered(recipient)
        else:
            recipient.delivery_status = DeliveryStatus.FAILED
            recipient.save()
        return success

    @classmethod
    def get_stats(cls):
        return {
            "delivered": NotificationRecipient.objects.filter(delivery_status=DeliveryStatus.DELIVERED).count(),
            "failed": NotificationRecipient.objects.filter(delivery_status=DeliveryStatus.FAILED).count(),
            "pending": NotificationRecipient.objects.filter(delivery_status=DeliveryStatus.PENDING).count(),
            "retry": NotificationRecipient.objects.filter(delivery_status=DeliveryStatus.RETRY).count(),
        }


class TemplateEngine:
    @classmethod
    def get_email_templates(cls):
        from ..models import EmailTemplate
        return EmailTemplate.objects.filter(is_active=True)

    @classmethod
    def preview_template(cls, template_id: int, context: dict = None) -> dict:
        from ..models import EmailTemplate
        from .email_service import EmailService

        tmpl = EmailTemplate.objects.get(id=template_id)
        ctx = context or {}
        result = EmailService.render_template(tmpl.name, ctx)
        return {
            "id": tmpl.id,
            "name": tmpl.name,
            "subject": result["subject"],
            "html": result["html"],
            "text": result.get("text", ""),
        }




class NotificationService:
    @classmethod
    def create_notification(cls, notification_type: str, title: str, message: str,
                            sender=None, priority=Priority.MEDIUM,
                            target_audience="", target_class="", target_section="",
                            target_subject="", target_user_ids=None,
                            metadata=None, activation_at=None, expires_at=None,
                            send_email=True, send_realtime=True) -> Notification:
        notification = Notification.objects.create(
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
            status=NotificationStatus.ACTIVE,
            target_audience=target_audience,
            target_class=target_class,
            target_section=target_section,
            target_subject=target_subject,
            target_user_ids=target_user_ids or [],
            sender=sender,
            metadata=metadata or {},
            activation_at=activation_at,
            expires_at=expires_at,
        )

        NotificationAuditLog.objects.create(
            notification=notification,
            action="created",
            performed_by=sender,
            description=f"Notification '{title}' created",
        )

        recipients = cls._resolve_recipients(notification)
        for user in recipients:
            if isinstance(user, dict):
                user_obj = user.get("user")
            else:
                user_obj = user
            if user_obj:
                NotificationRecipient.objects.create(
                    notification=notification,
                    user=user_obj,
                )

        if send_email:
            cls._send_email_notification(notification)
        if send_realtime:
            cls._send_realtime_notification(notification)

        return notification

    @classmethod
    def _resolve_recipients(cls, notification: Notification):
        users = []
        audience = notification.target_audience
        target_ids = notification.target_user_ids or []

        if audience == TargetAudience.ALL_STUDENTS:
            profiles = StudentProfile.objects.select_related("user").all()
            users = [p.user for p in profiles]
        elif audience == TargetAudience.ALL_TEACHERS:
            profiles = TeacherProfile.objects.select_related("user").all()
            users = [p.user for p in profiles]
        elif audience == TargetAudience.ALL_STAFF:
            users = list(CustomUser.objects.filter(role="staff"))
        elif audience == TargetAudience.ENTIRE_SCHOOL:
            users = list(CustomUser.objects.filter(is_active=True))
        elif audience == TargetAudience.SPECIFIC_CLASS and notification.target_class:
            profiles = StudentProfile.objects.filter(
                class_assigned=notification.target_class
            ).select_related("user")
            users = [p.user for p in profiles]
        elif audience == TargetAudience.SPECIFIC_SUBJECT and notification.target_subject:
            from student.models import StudentSubject
            allocations = StudentSubject.objects.filter(
                subject__name=notification.target_subject,
                status="approved",
            ).select_related("student__user")
            users = [a.student.user for a in allocations]
        elif target_ids:
            users = list(CustomUser.objects.filter(id__in=target_ids, is_active=True))
        return users

    @classmethod
    def _send_email_notification(cls, notification: Notification):
        recipients = NotificationRecipient.objects.filter(
            notification=notification,
        ).select_related("user")

        template_map = {
            NotificationType.EMAIL_VERIFICATION: "email_verification",
            NotificationType.WELCOME: "welcome",
            NotificationType.ASSIGNMENT_CREATED: "assignment_notification",
            NotificationType.ASSIGNMENT_DEADLINE: "assignment_reminder",
            NotificationType.RESULTS_PUBLISHED: "results_published",
            NotificationType.RESULTS_DRAFTED: "results_drafted",
            NotificationType.RESULTS_APPROVED: "results_approved",
            NotificationType.RESULTS_GENERATED: "results_generated",
            NotificationType.RESULTS_GRADES_UPDATED: "grades_updated",
            NotificationType.RESULTS_RANK_COMPUTED: "rank_computed",
            NotificationType.RECHCKED_RESULT: "rechecked_result",
            NotificationType.FEE_REMINDER: "fee_reminder",
            NotificationType.EVENT: "event_notification",
            NotificationType.SCHOOL_ANNOUNCEMENT: "general_announcement",
            NotificationType.EMERGENCY: "emergency_announcement",
            NotificationType.SCRIPTS_UPLOADED: "scripts_uploaded",
            NotificationType.SCRIPTS_BULK_UPLOADED: "scripts_bulk_uploaded",
            NotificationType.SCRIPTS_ASSIGNED: "scripts_assigned",
            NotificationType.SCRIPTS_BULK_ASSIGNED: "scripts_bulk_assigned",
            NotificationType.SCRIPTS_EVALUATION_COMPLETE: "evaluation_complete",
            NotificationType.SCRIPTS_REEVALUATION_REQUESTED: "reevaluation_requested",
            NotificationType.SCRIPTS_APPROVED: "scripts_approved",
            NotificationType.SCRIPTS_BATCH_COMPLETE: "batch_complete",
            NotificationType.SCRIPTS_BATCH_FAILED: "batch_failed",
            NotificationType.RECHECKING_REQUESTED: "rechecking_requested",
            NotificationType.RECHECKING_APPROVED: "rechecking_approved",
            NotificationType.RECHECKING_REJECTED: "rechecking_rejected",
            NotificationType.RECHECKING_ASSIGNED: "rechecking_assigned",
            NotificationType.RECHECKING_EVALUATION_COMPLETE: "rechecking_evaluation_complete",
            NotificationType.RECHECKING_COMPLETED: "rechecking_completed",
            NotificationType.RECHECKING_WINDOW_CLOSING: "rechecking_window_closing",
            NotificationType.RECHECKING_WINDOW_CLOSED: "rechecking_window_closed",
        }

        template_name = template_map.get(notification.notification_type, "general_announcement")

        for recipient in recipients:
            context = {
                "user_name": f"{recipient.user.first_name} {recipient.user.last_name}".strip() or recipient.user.email,
                "user_email": recipient.user.email,
                "title": notification.title,
                "message": notification.message,
                "notification_type": notification.get_notification_type_display(),
                "action_url": f"{settings.FRONTEND_URL or 'http://localhost:5173'}/student/notifications",
            }

            success = EmailService.send_templated_email(
                to_email=recipient.user.email,
                template_name=template_name,
                context=context,
                notification=notification,
                recipient=recipient,
            )
            if success:
                recipient.email_sent = True
                recipient.email_sent_at = timezone.now()
                recipient.save()

    @classmethod
    def _send_realtime_notification(cls, notification: Notification):
        recipients = NotificationRecipient.objects.filter(notification=notification)
        data = {
            "id": notification.id,
            "type": notification.notification_type,
            "title": notification.title,
            "message": notification.message,
            "priority": notification.priority,
            "created_at": notification.created_at.isoformat(),
        }
        for r in recipients:
            RealtimeManager.send_notification(r.user_id, data)

        audience = notification.target_audience
        if audience in (TargetAudience.ALL_STUDENTS, TargetAudience.ENTIRE_SCHOOL):
            RealtimeManager.broadcast_to_role("student", data)
        if audience in (TargetAudience.ALL_TEACHERS, TargetAudience.ENTIRE_SCHOOL):
            RealtimeManager.broadcast_to_role("teacher", data)

    @classmethod
    def _deliver_to_single_recipient(cls, recipient: NotificationRecipient) -> bool:
        try:
            notification = recipient.notification
            cls._send_email_notification(notification)
            return True
        except Exception as e:
            recipient.failure_reason = str(e)[:500]
            recipient.save()
            return False

    @classmethod
    def delete_notification(cls, notification_id: int, user) -> bool:
        try:
            notification = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            return False
        NotificationAuditLog.objects.create(
            notification=notification,
            action="deleted",
            performed_by=user,
        )
        notification.delete()
        return True

    @classmethod
    def delete_read_notifications(cls, user_id: int) -> int:
        count, _ = NotificationRecipient.objects.filter(
            user_id=user_id,
            read_status=ReadStatus.READ,
        ).delete()
        return count

    @classmethod
    def get_user_notifications(cls, user_id: int, notification_type=None, read_status=None,
                                priority=None, page=1, page_size=20, search=""):
        qs = NotificationRecipient.objects.filter(
            user_id=user_id,
            notification__status=NotificationStatus.ACTIVE,
        ).select_related("notification").order_by("-notification__created_at")

        if notification_type:
            qs = qs.filter(notification__notification_type=notification_type)
        if read_status:
            qs = qs.filter(read_status=read_status)
        if priority:
            qs = qs.filter(notification__priority=priority)
        if search:
            qs = qs.filter(
                Q(notification__title__icontains=search) |
                Q(notification__message__icontains=search)
            )

        total = qs.count()
        offset = (page - 1) * page_size
        items = qs[offset:offset + page_size]

        results = []
        for r in items:
            n = r.notification
            results.append({
                "recipient_id": r.id,
                "id": n.id,
                "type": n.notification_type,
                "type_display": n.get_notification_type_display(),
                "title": n.title,
                "message": n.message,
                "priority": n.priority,
                "priority_display": n.get_priority_display(),
                "read_status": r.read_status,
                "read_at": r.read_at.isoformat() if r.read_at else None,
                "delivery_status": r.delivery_status,
                "sender": f"{n.sender.first_name} {n.sender.last_name}".strip() if n.sender else None,
                "created_at": n.created_at.isoformat(),
                "expires_at": n.expires_at.isoformat() if n.expires_at else None,
            })

        return {
            "results": results,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    @classmethod
    def get_analytics(cls):
        total = Notification.objects.count()
        active = Notification.objects.filter(status=NotificationStatus.ACTIVE).count()
        expired = Notification.objects.filter(status=NotificationStatus.EXPIRED).count()

        delivery = DeliveryTracker.get_stats()

        priority_dist = Notification.objects.values("priority").annotate(count=Count("id"))

        type_stats = NotificationRecipient.objects.values(
            "notification__notification_type"
        ).annotate(
            total=Count("id"),
            read=Count("id", filter=Q(read_status=ReadStatus.READ)),
            unread=Count("id", filter=Q(read_status=ReadStatus.UNREAD)),
        )

        recent_failures = DeliveryLog.objects.filter(
            status=DeliveryStatus.FAILED
        ).select_related("notification")[:10]

        return {
            "total_notifications": total,
            "active": active,
            "expired": expired,
            "delivery_stats": delivery,
            "priority_distribution": list(priority_dist),
            "type_statistics": list(type_stats),
            "recent_failures": [
                {
                    "id": f.id,
                    "notification": f.notification.title if f.notification else "N/A",
                    "channel": f.channel,
                    "error": f.error_message[:200],
                    "created_at": f.created_at.isoformat(),
                }
                for f in recent_failures
            ],
        }