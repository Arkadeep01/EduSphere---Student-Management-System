import uuid
import secrets
from django.db import transaction
from django.utils import timezone
from administration.models import AnswerScriptUpload
from administration.models.audit_log import AuditLog
from notification.services.notification_service import NotificationService
from notification.models import NotificationType, Priority, TargetAudience
from notification.services.email_service import EmailService


def create_upload_batch(exam, subject, script_data_list, uploaded_by):
    batch_id = f"BATCH-{uuid.uuid4().hex[:8].upper()}"
    now = timezone.now()
    scripts = []
    for data in script_data_list:
        script, created = AnswerScriptUpload.objects.get_or_create(
            exam=exam,
            subject=subject,
            student=data["student"],
            defaults={
                "script_file": data.get("script_file"),
                "section": data.get("section", ""),
                "roll_number": data.get("roll_number", ""),
                "registration_number": data.get("registration_number", ""),
                "script_number": data.get("script_number", ""),
                "batch_id": batch_id,
                "uploaded_by": uploaded_by,
                "uploaded_at": now,
                "upload_status": "uploaded",
            },
        )
        if not created:
            script.script_file = data.get("script_file", script.script_file)
            script.section = data.get("section", script.section)
            script.roll_number = data.get("roll_number", script.roll_number)
            script.registration_number = data.get("registration_number", script.registration_number)
            script.script_number = data.get("script_number", script.script_number)
            script.batch_id = batch_id
            script.uploaded_by = uploaded_by
            script.uploaded_at = now
            script.upload_status = "uploaded"
            script.save()
        scripts.append(script)
    AuditLog.objects.create(
        action="upload",
        model_name="AnswerScriptUpload",
        object_id=batch_id,
        user=uploaded_by,
        description=f"Staff batch upload {batch_id} with {len(scripts)} scripts for {exam.name} - {subject.name}",
    )
    try:
        NotificationService.create_notification(
            notification_type=NotificationType.SCRIPTS_BULK_UPLOADED,
            title="New Answer Script Batch Uploaded",
            message=f"Staff {uploaded_by.email} uploaded batch {batch_id} for {exam.name}.",
            sender=uploaded_by,
            priority=Priority.MEDIUM,
            target_audience=TargetAudience.ALL_TEACHERS,
            send_email=False,
            send_realtime=True,
        )
    except Exception:
        pass
    return batch_id, scripts


def upload_answer_script(script, script_file, uploaded_by):
    now = timezone.now()
    script.script_file = script_file
    script.uploaded_by = uploaded_by
    script.uploaded_at = now
    script.upload_status = "uploaded"
    script.save()
    AuditLog.objects.create(
        action="upload",
        model_name="AnswerScriptUpload",
        object_id=str(script.id),
        user=uploaded_by,
        description=f"Staff uploaded script for {script.student.user.email} - {script.exam.name}",
    )
    return script


def replace_uploaded_file(script, new_file, uploaded_by):
    script.script_file = new_file
    script.uploaded_at = timezone.now()
    script.upload_status = "uploaded"
    script.save()
    AuditLog.objects.create(
        action="update",
        model_name="AnswerScriptUpload",
        object_id=str(script.id),
        user=uploaded_by,
        description=f"Staff replaced script for {script.student.user.email} - {script.exam.name}",
    )
    return script


def delete_upload(script, uploaded_by):
    script.script_file.delete()
    script.script_file = None
    script.upload_status = "pending_upload"
    script.uploaded_by = None
    script.uploaded_at = None
    script.save()
    AuditLog.objects.create(
        action="delete",
        model_name="AnswerScriptUpload",
        object_id=str(script.id),
        user=uploaded_by,
        description=f"Staff deleted script upload for {script.student.user.email} - {script.exam.name}",
    )
    return script


# ── Staff Student Creation Service ────────────────────────────────────


@transaction.atomic
def staff_create_student(data):
    from student.provisioning import StudentProvisioningService
    user, profile = StudentProvisioningService.create_student(data)
    return user, profile


# ── Staff Teacher Management Services ─────────────────────────────────

from authentication.models import CustomUser


@transaction.atomic
def staff_create_teacher(data):
    from teacher.provisioning import TeacherProvisioningService
    user, profile = TeacherProvisioningService.create_teacher(data)
    return user


def staff_list_teachers():
    return TeacherProfile.objects.select_related("user", "assigned_subject").all()


def staff_get_teacher(teacher_id):
    return TeacherProfile.objects.select_related("user", "assigned_subject").get(id=teacher_id)


@transaction.atomic
def staff_update_teacher(teacher_id, data):
    profile = TeacherProfile.objects.get(id=teacher_id)
    allowed_fields = [
        "employee_id", "date_of_birth", "gender", "phone",
        "address", "department", "designation", "personal_email",
        "qualification", "experience", "profile_photo",
    ]
    for field in allowed_fields:
        if field in data:
            setattr(profile, field, data[field])
    profile.save()
    return profile
