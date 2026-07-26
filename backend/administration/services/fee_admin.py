from decimal import Decimal
from datetime import date, timedelta
from collections import defaultdict

from django.db import transaction
from django.db.models import Sum, Q, Prefetch
from django.utils.timezone import localdate

from administration.models.fee import (
    FeeStructure, FeeComponent, StudentFeePayment,
    StudentScholarship, FinanceActivityLog,
)
from student.models import StudentProfile
from notification.models import Notification, NotificationRecipient, NotificationType, Priority


FINE_PER_DAY = Decimal("10.00")
PAYMENT_METHODS = {"CASH", "BANK", "UPI"}


class FeeAdminService:

    # ── Fee Structure ──────────────────────────────────────────────────────

    @staticmethod
    def list_structures():
        return FeeStructure.objects.prefetch_related("components").all()

    @staticmethod
    def create_structure(data, user):
        with transaction.atomic():
            fs = FeeStructure.objects.create(
                class_name=data["class_name"],
                late_fine_per_day=data.get("late_fine_per_day", 50),
                gst_enabled=data.get("gst_enabled", False),
            )
            for comp in data.get("components", []):
                FeeComponent.objects.create(
                    structure=fs,
                    name=comp["name"],
                    amount=comp["amount"],
                    frequency=comp.get("frequency", "monthly"),
                    is_optional=comp.get("is_optional", False),
                )
            FinanceActivityLog.objects.create(
                action="structure_created",
                admin=user,
                description=f"Fee structure created for Class {data['class_name']}",
            )
        return fs

    @staticmethod
    def update_structure(structure_id, data, user):
        with transaction.atomic():
            fs = FeeStructure.objects.get(id=structure_id)
            for attr in ["class_name", "late_fine_per_day", "gst_enabled", "is_active"]:
                if attr in data:
                    setattr(fs, attr, data[attr])
            fs.save()
            if "components" in data:
                fs.components.all().delete()
                for comp in data["components"]:
                    FeeComponent.objects.create(structure=fs, **comp)
            FinanceActivityLog.objects.create(
                action="structure_updated", admin=user,
                description=f"Fee structure for Class {fs.class_name} updated",
            )
        return fs

    @staticmethod
    def delete_structure(structure_id, user):
        fs = FeeStructure.objects.get(id=structure_id)
        class_name = fs.class_name
        fs.delete()
        FinanceActivityLog.objects.create(
            action="structure_deleted", admin=user,
            description=f"Fee structure for Class {class_name} deleted",
        )

    @staticmethod
    def get_structure_by_class(class_name):
        return FeeStructure.objects.filter(
            class_name=class_name, is_active=True
        ).prefetch_related("components").first()

    @staticmethod
    def duplicate_structure(from_class, to_class, user):
        source = FeeStructure.objects.filter(
            class_name=from_class, is_active=True
        ).prefetch_related("components").first()
        if not source:
            return None
        with transaction.atomic():
            fs = FeeStructure.objects.create(
                class_name=to_class,
                academic_session=source.academic_session,
                late_fine_per_day=source.late_fine_per_day,
                gst_enabled=source.gst_enabled,
            )
            for comp in source.components.all():
                FeeComponent.objects.create(
                    structure=fs, name=comp.name, amount=comp.amount,
                    frequency=comp.frequency, is_optional=comp.is_optional,
                )
            FinanceActivityLog.objects.create(
                action="structure_created", admin=user,
                description=f"Fee structure for Class {to_class} duplicated from Class {from_class}",
            )
        return fs

    # ── Fee Generation ─────────────────────────────────────────────────────

    @staticmethod
    def generate_fees_for_class(class_name, academic_session, user):
        structure = FeeStructure.objects.filter(
            class_name=class_name, academic_session=academic_session, is_active=True
        ).prefetch_related("components").first()
        if not structure:
            raise ValueError(f"No active fee structure for Class {class_name} – {academic_session}")

        components = list(structure.components.filter(is_active=True))
        if not components:
            raise ValueError("Fee structure has no active components")

        students = list(StudentProfile.objects.filter(class_assigned=class_name))
        if not students:
            raise ValueError(f"No students found in Class {class_name}")

        today = localdate()
        created_count = 0

        with transaction.atomic():
            for student in students:
                for comp in components:
                    if comp.frequency == "monthly":
                        for month_num in range(1, 13):
                            month_str = f"{today.year}-{month_num:02d}"
                            due = date(today.year, month_num, 15)
                            _, created = StudentFeePayment.objects.get_or_create(
                                student=student,
                                month=month_str,
                                academic_session=academic_session,
                                fee_component=comp,
                                defaults={
                                    "total_fee": comp.amount,
                                    "due_date": due,
                                },
                            )
                            if created:
                                created_count += 1
                    elif comp.frequency == "annual":
                        _, created = StudentFeePayment.objects.get_or_create(
                            student=student,
                            month="",
                            academic_session=academic_session,
                            fee_component=comp,
                            defaults={
                                "total_fee": comp.amount,
                                "due_date": date(today.year, 4, 30),
                            },
                        )
                        if created:
                            created_count += 1
                    elif comp.frequency == "one-time":
                        _, created = StudentFeePayment.objects.get_or_create(
                            student=student,
                            month="",
                            academic_session=academic_session,
                            fee_component=comp,
                            defaults={
                                "total_fee": comp.amount,
                                "due_date": date(today.year, 4, 30),
                            },
                        )
                        if created:
                            created_count += 1

            FinanceActivityLog.objects.create(
                action="fees_generated", admin=user,
                description=f"Generated {created_count} fee entries for Class {class_name} – {academic_session}",
            )

        return {"created": created_count, "students": len(students), "components": len(components)}

    @staticmethod
    def generate_fees_for_student(student, user=None):
        class_name = student.class_assigned
        if not class_name:
            raise ValueError("Student has no class assigned")

        session_str = "2026-27"
        structure = FeeStructure.objects.filter(
            class_name=class_name, is_active=True
        ).prefetch_related("components").first()
        if not structure:
            return {"created": 0}

        components = list(structure.components.filter(is_active=True))
        today = localdate()
        created_count = 0

        with transaction.atomic():
            for comp in components:
                if comp.frequency == "monthly":
                    for month_num in range(today.month, 13):
                        month_str = f"{today.year}-{month_num:02d}"
                        due = date(today.year, month_num, 15)
                        _, created = StudentFeePayment.objects.get_or_create(
                            student=student,
                            month=month_str,
                            academic_session=session_str,
                            fee_component=comp,
                            defaults={
                                "total_fee": comp.amount,
                                "due_date": due,
                            },
                        )
                        if created:
                            created_count += 1
                elif comp.frequency == "annual":
                    _, created = StudentFeePayment.objects.get_or_create(
                        student=student,
                        month="",
                        academic_session=session_str,
                        fee_component=comp,
                        defaults={
                            "total_fee": comp.amount,
                            "due_date": date(today.year, 4, 30),
                        },
                    )
                    if created:
                        created_count += 1
                elif comp.frequency == "one-time":
                    _, created = StudentFeePayment.objects.get_or_create(
                        student=student,
                        month="",
                        academic_session=session_str,
                        fee_component=comp,
                        defaults={
                            "total_fee": comp.amount,
                            "due_date": date(today.year, 4, 30),
                        },
                    )
                    if created:
                        created_count += 1

        return {"created": created_count}

    # ── Fine Calculation ────────────────────────────────────────────────────

    @staticmethod
    def calculate_fine(payment, as_on_date=None):
        if as_on_date is None:
            as_on_date = localdate()
        if payment.status == "paid":
            return payment.paid_at_fine
        if not payment.due_date or as_on_date <= payment.due_date:
            return Decimal("0.00")
        days_overdue = (as_on_date - payment.due_date).days
        return Decimal(days_overdue) * FINE_PER_DAY

    # ── Payment ─────────────────────────────────────────────────────────────

    @staticmethod
    def list_payments(class_name=None, month=None, status=None):
        qs = StudentFeePayment.objects.select_related("student__user").all()
        if class_name:
            qs = qs.filter(student__class_assigned=class_name)
        if month:
            qs = qs.filter(month=month)
        if status:
            qs = qs.filter(status=status)
        return qs

    @staticmethod
    def _generate_receipt_number(payment):
        student = payment.student
        cls = student.class_assigned or "X"
        session = payment.academic_session
        comp_name = "Fee"
        if payment.fee_component:
            comp_name = payment.fee_component.name.replace(" ", "")
        adm = student.admission_number or f"STU{student.id:05d}"
        seq = f"{payment.id:04d}"
        return f"{comp_name}/{session}/{cls}/{adm}/{seq}"

    @staticmethod
    def record_payment(payment_id, user, data):
        payment = StudentFeePayment.objects.select_related("student__user", "fee_component").get(id=payment_id)

        if payment.status == "paid":
            raise ValueError("Payment already settled for this liability")
        if payment.status == "rejected":
            raise ValueError("Cannot record payment on a rejected entry")

        payment_method = data.get("payment_method", "CASH").upper()
        if payment_method not in PAYMENT_METHODS:
            raise ValueError(f"Invalid payment method: {payment_method}. Must be CASH, BANK, or UPI")

        if payment_method in ("BANK", "UPI") and not data.get("transaction_ref"):
            raise ValueError(f"Transaction reference is required for {payment_method} payments")

        today = localdate()
        fine = FeeAdminService.calculate_fine(payment, today)
        total_due = payment.total_fee + fine

        with transaction.atomic():
            payment.paid_amount = payment.total_fee
            payment.fine = fine
            payment.paid_at_fine = fine
            payment.status = "paid"
            payment.payment_method = payment_method
            payment.transaction_ref = data.get("transaction_ref", "")
            payment.paid_at = today
            payment.verified_by = user
            payment.verified_at = today
            payment.receipt_number = FeeAdminService._generate_receipt_number(payment)
            payment.save(update_fields=[
                "paid_amount", "fine", "paid_at_fine", "status",
                "payment_method", "transaction_ref", "paid_at",
                "verified_by", "verified_at", "receipt_number",
            ])

            FinanceActivityLog.objects.create(
                action="payment_recorded", admin=user,
                student=payment.student, amount=total_due,
                description=f"Payment recorded for {payment.month or payment.fee_component} via {payment_method}",
            )

        return payment

    @staticmethod
    def verify_payment(payment_id, user, receipt_number=None):
        payment = StudentFeePayment.objects.select_related("student__user").get(id=payment_id)
        if payment.status == "paid":
            raise ValueError("Payment already verified")

        today = localdate()
        fine = FeeAdminService.calculate_fine(payment, today)
        total_due = payment.total_fee + fine

        payment.paid_amount = payment.total_fee
        payment.fine = fine
        payment.paid_at_fine = fine
        payment.status = "paid"
        payment.verified_by = user
        payment.verified_at = today
        payment.receipt_number = receipt_number or FeeAdminService._generate_receipt_number(payment)
        payment.save()

        FinanceActivityLog.objects.create(
            action="payment_verified", admin=user,
            student=payment.student, amount=total_due,
            description=f"Payment verified for {payment.month or payment.fee_component}",
        )
        return payment

    @staticmethod
    def reject_payment(payment_id, user):
        payment = StudentFeePayment.objects.get(id=payment_id)
        payment.status = "rejected"
        payment.verified_by = user
        payment.verified_at = localdate()
        payment.save()
        FinanceActivityLog.objects.create(
            action="payment_rejected", admin=user,
            student=payment.student, amount=payment.paid_amount,
        )
        return payment

    # ── Correction / Refund ────────────────────────────────────────────────

    @staticmethod
    def request_correction(payment_id, user, reason):
        payment = StudentFeePayment.objects.get(id=payment_id)
        if payment.status != "paid":
            raise ValueError("Only paid payments can be corrected")
        if payment.correction_status != "none":
            raise ValueError("Correction already in progress")

        payment.correction_status = "correction_requested"
        payment.correction_reason = reason
        payment.save()

        FinanceActivityLog.objects.create(
            action="correction_requested", admin=user,
            student=payment.student, amount=payment.paid_amount,
            description=f"Correction requested: {reason}",
        )
        return payment

    @staticmethod
    def approve_correction(payment_id, user):
        payment = StudentFeePayment.objects.get(id=payment_id)
        if payment.correction_status != "correction_requested":
            raise ValueError("No pending correction request")

        original_amount = payment.paid_amount

        with transaction.atomic():
            payment.correction_status = "correction_approved"
            payment.correction_approved_by = user
            payment.correction_approved_at = localdate()
            payment.status = "not_paid"
            payment.paid_amount = Decimal("0.00")
            payment.fine = Decimal("0.00")
            payment.paid_at_fine = Decimal("0.00")
            payment.payment_method = ""
            payment.transaction_ref = ""
            payment.paid_at = None
            payment.verified_by = None
            payment.verified_at = None
            payment.receipt_number = ""
            payment.save()

            FinanceActivityLog.objects.create(
                action="correction_approved", admin=user,
                student=payment.student, amount=original_amount,
                description=f"Correction approved by {user.email}",
            )

        return payment

    @staticmethod
    def request_refund(payment_id, user, reason):
        payment = StudentFeePayment.objects.get(id=payment_id)
        if payment.status != "paid":
            raise ValueError("Cannot refund unpaid payment")
        if payment.refund_status != "none":
            raise ValueError("Refund already in progress")

        payment.correction_status = "refund_requested"
        payment.correction_reason = reason
        payment.refund_status = "initiated"
        payment.refund_initiated_at = localdate()
        payment.save()

        FinanceActivityLog.objects.create(
            action="refund_initiated", admin=user,
            student=payment.student, amount=payment.paid_amount,
            description=f"Refund requested: {reason}",
        )
        return payment

    @staticmethod
    def approve_refund(payment_id, user):
        payment = StudentFeePayment.objects.get(id=payment_id)
        if payment.refund_status != "initiated":
            raise ValueError("No pending refund request")

        with transaction.atomic():
            payment.correction_status = "refund_approved"
            payment.correction_approved_by = user
            payment.correction_approved_at = localdate()
            payment.refund_status = "completed"
            payment.refund_completed_at = localdate()
            payment.status = "not_paid"
            payment.paid_amount = Decimal("0.00")
            payment.fine = Decimal("0.00")
            payment.paid_at_fine = Decimal("0.00")
            payment.payment_method = ""
            payment.transaction_ref = ""
            payment.paid_at = None
            payment.verified_by = None
            payment.verified_at = None
            payment.receipt_number = ""
            payment.save()

            FinanceActivityLog.objects.create(
                action="refund_completed", admin=user,
                student=payment.student, amount=payment.paid_amount,
                description=f"Refund approved by {user.email}",
            )

        return payment

    # ── Clearance Deadline ────────────────────────────────────────────────

    @staticmethod
    def set_clearance_deadline(student_id, deadline_date, user):
        payments = StudentFeePayment.objects.filter(
            student_id=student_id,
        ).exclude(status="paid")

        with transaction.atomic():
            count = payments.update(clearance_deadline=deadline_date)

            student = StudentProfile.objects.get(id=student_id)
            notification = Notification.objects.create(
                notification_type=NotificationType.FEE_REMINDER,
                title="Clearance Deadline – Outstanding Dues",
                message=(
                    f"Your outstanding fees must be cleared by {deadline_date}. "
                    f"Please clear all dues before the deadline to avoid further action."
                ),
                priority=Priority.CRITICAL,
                status="active",
                target_audience="specific_students",
                sender=user,
            )
            NotificationRecipient.objects.create(
                notification=notification,
                user=student.user,
            )

            FinanceActivityLog.objects.create(
                action="clearance_deadline_set", admin=user,
                student=student,
                description=f"Clearance deadline set to {deadline_date} for {count} outstanding entries",
            )

        return {"updated": count, "deadline": str(deadline_date)}

    # ── Overdue Notification ──────────────────────────────────────────────

    @staticmethod
    def send_overdue_notification(payment):
        today = localdate()
        if payment.status == "paid":
            return
        if payment.due_date and today > payment.due_date and payment.status != "overdue":
            payment.status = "overdue"
            payment.save(update_fields=["status"])

            fine = FeeAdminService.calculate_fine(payment, today)
            notification = Notification.objects.create(
                notification_type=NotificationType.FEE_REMINDER,
                title="Fee Payment Overdue",
                message=(
                    f"Your {payment.fee_component or 'fee'} payment of ₹{payment.total_fee} "
                    f"was due on {payment.due_date}. A late fine of ₹{fine} has accrued. "
                    f"Please clear the dues immediately."
                ),
                priority=Priority.HIGH,
                status="active",
                target_audience="specific_students",
            )
            NotificationRecipient.objects.create(
                notification=notification,
                user=payment.student.user,
            )

            FinanceActivityLog.objects.create(
                action="overdue_notification", student=payment.student,
                amount=fine,
                description=f"Overdue notification sent for {payment.month or payment.fee_component}",
            )
            return True
        return False

    @staticmethod
    def check_and_notify_overdue():
        today = localdate()
        overdue_payments = StudentFeePayment.objects.filter(
            status__in=["not_paid", "not_due"],
            due_date__lt=today,
        ).select_related("student__user", "fee_component")
        count = 0
        for payment in overdue_payments:
            if FeeAdminService.send_overdue_notification(payment):
                count += 1
        return count

    @staticmethod
    def send_reminder(student_ids, user):
        payments = StudentFeePayment.objects.filter(
            student_id__in=student_ids,
        ).exclude(status="paid").select_related("student__user")

        students_map = {}
        for p in payments:
            students_map.setdefault(p.student_id, []).append(p)

        sent = 0
        for sid, entries in students_map.items():
            total_outstanding = sum(e.total_fee for e in entries)
            student = entries[0].student
            notification = Notification.objects.create(
                notification_type=NotificationType.FEE_REMINDER,
                title="Fee Reminder – Outstanding Dues",
                message=(
                    f"You have ₹{total_outstanding} in outstanding fees. "
                    f"Please clear your dues at the earliest."
                ),
                priority=Priority.MEDIUM,
                status="active",
                target_audience="specific_students",
                sender=user,
            )
            NotificationRecipient.objects.create(
                notification=notification,
                user=student.user,
            )
            sent += 1

        return {"sent": sent}

    # ── Admission Fee ──────────────────────────────────────────────────────

    @staticmethod
    def record_admission_fee(student_id, user):
        student = StudentProfile.objects.get(id=student_id)
        session_str = "2026-27"

        comp = FeeComponent.objects.filter(
            structure__class_name=student.class_assigned,
            structure__is_active=True,
            name__icontains="admission",
            frequency="one-time",
        ).first()

        if not comp:
            existing = StudentFeePayment.objects.filter(
                student=student, month="", academic_session=session_str,
                fee_component__isnull=True,
                total_fee=0,
            ).first()
            if existing:
                return existing

            payment = StudentFeePayment.objects.create(
                student=student,
                month="",
                academic_session=session_str,
                total_fee=Decimal("0.00"),
                due_date=localdate() + timedelta(days=3),
                status="not_paid",
                fine=Decimal("0.00"),
                paid_at_fine=Decimal("0.00"),
            )
        else:
            existing = StudentFeePayment.objects.filter(
                student=student, fee_component=comp, academic_session=session_str,
            ).first()
            if existing:
                return existing
            payment = StudentFeePayment.objects.create(
                student=student,
                fee_component=comp,
                month="",
                academic_session=session_str,
                total_fee=comp.amount,
                due_date=localdate() + timedelta(days=3),
                status="not_paid",
                fine=Decimal("0.00"),
                paid_at_fine=Decimal("0.00"),
            )

        FinanceActivityLog.objects.create(
            action="admission_fee_recorded", admin=user,
            student=student, amount=payment.total_fee,
            description=f"Admission fee recorded for {student.user.email}",
        )
        return payment

    @staticmethod
    def record_admission_fee_payment(student_id, user):
        student = StudentProfile.objects.get(id=student_id)
        session_str = "2026-27"

        payment = StudentFeePayment.objects.filter(
            student=student, month="", academic_session=session_str,
            fee_component__name__icontains="admission",
        ).first()

        if not payment:
            payment = StudentFeePayment.objects.filter(
                student=student, month="", academic_session=session_str,
                total_fee=0,
            ).first()

        if not payment:
            raise ValueError("No admission fee record found")

        if payment.status == "paid":
            return payment

        with transaction.atomic():
            payment.paid_amount = payment.total_fee
            payment.status = "paid"
            payment.payment_method = "CASH"
            payment.paid_at = localdate()
            payment.verified_by = user
            payment.verified_at = localdate()
            payment.receipt_number = FeeAdminService._generate_receipt_number(payment)
            payment.save()

            FinanceActivityLog.objects.create(
                action="admission_fee_recorded", admin=user,
                student=student, amount=payment.total_fee,
                description=f"Admission fee paid for {student.user.email}",
            )

        return payment

    # ── Student Ledger ─────────────────────────────────────────────────────

    @staticmethod
    def get_student_ledger(student_id, requesting_user=None):
        if requesting_user and hasattr(requesting_user, "student_profile"):
            if requesting_user.student_profile.id != student_id:
                raise PermissionError("Access denied: cannot view another student's ledger")

        payments = StudentFeePayment.objects.filter(student_id=student_id).order_by("due_date")
        today = localdate()

        ledger_entries = []
        for p in payments:
            current_fine = FeeAdminService.calculate_fine(p, today)
            if p.status == "not_paid" and p.due_date and today > p.due_date:
                if p.status != "overdue":
                    p.status = "overdue"
                    p.save(update_fields=["status"])

            ledger_entries.append({
                "id": p.id,
                "fee_component": p.fee_component.name if p.fee_component else None,
                "month": p.month,
                "academic_session": p.academic_session,
                "total_fee": str(p.total_fee),
                "paid_amount": str(p.paid_amount),
                "fine": str(current_fine),
                "paid_at_fine": str(p.paid_at_fine),
                "due_date": p.due_date.isoformat() if p.due_date else None,
                "status": p.status,
                "payment_method": p.payment_method,
                "transaction_ref": p.transaction_ref,
                "paid_at": p.paid_at.isoformat() if p.paid_at else None,
                "receipt_number": p.receipt_number,
                "correction_status": p.correction_status,
                "refund_status": p.refund_status,
                "clearance_deadline": p.clearance_deadline.isoformat() if p.clearance_deadline else None,
                "outstanding": str(max(Decimal("0.00"), p.total_fee - p.paid_amount)),
                "payable_now": str(p.total_fee + current_fine - p.paid_amount),
            })

        total_fee = sum(p.total_fee for p in payments)
        total_paid = sum(p.paid_amount for p in payments if p.status == "paid")
        total_fine = sum(
            FeeAdminService.calculate_fine(p, today) for p in payments if p.status != "paid"
        )

        return {
            "payments": ledger_entries,
            "summary": {
                "total_fee": str(total_fee),
                "paid": str(total_paid),
                "pending": str(max(Decimal("0.00"), total_fee - total_paid)),
                "total_fine": str(total_fine),
                "advance": str(
                    sum(p.advance_payment for p in payments if p.refund_status == "none")
                ),
            },
        }

    # ── Scholarships ───────────────────────────────────────────────────────

    @staticmethod
    def list_scholarships():
        return StudentScholarship.objects.select_related("student__user").all()

    @staticmethod
    def grant_scholarship(data, user):
        sch = StudentScholarship.objects.create(
            student_id=data["student_id"],
            type=data["type"],
            value=data["value"],
            reason=data.get("reason", ""),
            approved_by=user,
        )
        FinanceActivityLog.objects.create(
            action="scholarship_granted", admin=user,
            student=sch.student, amount=sch.value,
        )
        return sch

    @staticmethod
    def revoke_scholarship(scholarship_id, user):
        sch = StudentScholarship.objects.get(id=scholarship_id)
        sch.is_active = False
        sch.revoked_at = localdate()
        sch.save()
        FinanceActivityLog.objects.create(
            action="scholarship_revoked", admin=user,
            student=sch.student, amount=sch.value,
        )
        return sch

    # ── Analytics ──────────────────────────────────────────────────────────

    @staticmethod
    def get_summary():
        paid = StudentFeePayment.objects.filter(status="paid")
        total_collection = paid.aggregate(s=Sum("paid_amount"))["s"] or Decimal("0.00")
        pending = StudentFeePayment.objects.exclude(status="paid")
        pending_fees = pending.aggregate(s=Sum("total_fee"))["s"] or Decimal("0.00")
        return {
            "total_collection": str(total_collection),
            "pending_fees": str(pending_fees),
            "monthly_collection": str(
                paid.filter(paid_at__month=localdate().month)
                    .aggregate(s=Sum("paid_amount"))["s"] or Decimal("0.00")
            ),
        }

    @staticmethod
    def get_monthly_collection():
        data = defaultdict(lambda: {"collection": Decimal("0.00"), "pending": Decimal("0.00")})
        for p in StudentFeePayment.objects.all():
            if p.status == "paid":
                data[p.month or "one-time"]["collection"] += p.paid_amount
            else:
                data[p.month or "one-time"]["pending"] += p.total_fee
        return [{"month": k, "collection": str(v["collection"]), "pending": str(v["pending"])} for k, v in sorted(data.items())]

    @staticmethod
    def get_class_wise_collection():
        data = defaultdict(lambda: {"total": Decimal("0.00"), "collection": Decimal("0.00"), "pending": Decimal("0.00")})
        for p in StudentFeePayment.objects.select_related("student").all():
            cls = p.student.class_assigned or "Unknown"
            data[cls]["total"] += p.total_fee
            if p.status == "paid":
                data[cls]["collection"] += p.paid_amount
            else:
                data[cls]["pending"] += p.total_fee
        return [{"class_name": k, "total": str(v["total"]), "collection": str(v["collection"]), "pending": str(v["pending"])} for k, v in sorted(data.items())]

    @staticmethod
    def get_activity_log():
        return FinanceActivityLog.objects.select_related("admin", "student__user").all()

    # ── Account Deactivation Check ─────────────────────────────────────────

    @staticmethod
    def has_outstanding_dues(student_id):
        return StudentFeePayment.objects.filter(
            student_id=student_id,
        ).exclude(status="paid").exists()

    @staticmethod
    def get_outstanding_summary(student_id):
        payments = StudentFeePayment.objects.filter(student_id=student_id).exclude(status="paid")
        total = payments.aggregate(s=Sum("total_fee"))["s"] or Decimal("0.00")
        return {
            "count": payments.count(),
            "total_outstanding": str(total),
        }
