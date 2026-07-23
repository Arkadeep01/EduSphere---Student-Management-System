from decimal import Decimal
from datetime import date
from collections import defaultdict

from django.db import transaction
from django.db.models import Sum, Q

from administration.models.fee import FeeStructure, FeeComponent, StudentFeePayment, StudentScholarship, FinanceActivityLog
from student.models import StudentProfile


class FeeAdminService:
    # Fee Structure
    @staticmethod
    def list_structures():
        return FeeStructure.objects.prefetch_related("components").all()

    @staticmethod
    def create_structure(data, user):
        from datetime import date
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
            total = sum(
                float(c["amount"])
                for c in data.get("components", [])
                if c.get("frequency") == "monthly" and not c.get("is_optional")
            )
            total += sum(
                float(c["amount"])
                for c in data.get("components", [])
                if c.get("frequency") == "annual" and not c.get("is_optional")
            )
            monthly = sum(
                float(c["amount"])
                for c in data.get("components", [])
                if c.get("frequency") == "monthly" and not c.get("is_optional")
            )
            today = date.today()
            students = StudentProfile.objects.filter(class_assigned=data["class_name"])
            for month_num in range(1, 13):
                month_str = f"{today.year}-{month_num:02d}"
                for student in students:
                    StudentFeePayment.objects.get_or_create(
                        student=student,
                        month=month_str,
                        academic_session=fs.academic_session,
                        defaults={
                            "total_fee": total,
                            "due_date": date(today.year, month_num, 15),
                        },
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

    # Payments
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
    def verify_payment(payment_id, user, receipt_number=None):
        from datetime import timedelta
        payment = StudentFeePayment.objects.get(id=payment_id)
        today = date.today()
        if payment.due_date and today > payment.due_date:
            days_overdue = (today - payment.due_date).days
            structure = FeeStructure.objects.filter(
                class_name=payment.student.class_assigned,
                is_active=True,
            ).first()
            fine_per_day = structure.late_fine_per_day if structure else 0
            computed_fine = float(fine_per_day) * days_overdue
            payment.fine = max(payment.fine, computed_fine)
        payment.status = "paid"
        payment.verified_by = user
        payment.verified_at = today
        payment.receipt_number = receipt_number or f"RCP{payment.id}{today.strftime('%Y%m%d')}"
        payment.save()
        FinanceActivityLog.objects.create(
            action="payment_verified", admin=user,
            student=payment.student, amount=payment.paid_amount,
            description=f"Payment verified for {payment.month}",
        )
        return payment

    @staticmethod
    def reject_payment(payment_id, user):
        payment = StudentFeePayment.objects.get(id=payment_id)
        payment.status = "rejected"
        payment.verified_by = user
        payment.verified_at = date.today()
        payment.save()
        FinanceActivityLog.objects.create(
            action="payment_rejected", admin=user,
            student=payment.student, amount=payment.paid_amount,
        )
        return payment

    @staticmethod
    def initiate_refund(payment_id, user):
        payment = StudentFeePayment.objects.get(id=payment_id)
        payment.refund_status = "initiated"
        payment.refund_initiated_at = date.today()
        payment.save()
        FinanceActivityLog.objects.create(
            action="refund_initiated", admin=user,
            student=payment.student, amount=payment.advance_payment,
        )
        return payment

    @staticmethod
    def complete_refund(payment_id, user):
        payment = StudentFeePayment.objects.get(id=payment_id)
        payment.refund_status = "completed"
        payment.refund_completed_at = date.today()
        payment.advance_payment = 0
        payment.save()
        FinanceActivityLog.objects.create(
            action="refund_completed", admin=user,
            student=payment.student,
        )
        return payment

    # Record offline payment (student-side)
    @staticmethod
    def record_offline_payment(student_id, month, amount, payment_method, transaction_ref=None):
        payment = StudentFeePayment.objects.filter(
            student_id=student_id, month=month
        ).first()
        if not payment:
            raise ValueError("No fee payment record found")
        payment.paid_amount = amount
        payment.advance_payment = max(amount - payment.total_fee, 0)
        payment.status = "pending_verification"
        payment.payment_method = payment_method
        payment.transaction_ref = transaction_ref
        payment.paid_at = date.today()
        payment.save()
        FinanceActivityLog.objects.create(
            action="offline_payment", student=payment.student,
            amount=amount,
            description=f"Offline payment for {month} via {payment_method}",
        )
        return payment

    # Scholarships
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
        sch.revoked_at = date.today()
        sch.save()
        FinanceActivityLog.objects.create(
            action="scholarship_revoked", admin=user,
            student=sch.student, amount=sch.value,
        )
        return sch

    # Analytics
    @staticmethod
    def get_summary():
        paid = StudentFeePayment.objects.filter(status="paid")
        total_collection = paid.aggregate(s=Sum("paid_amount"))["s"] or 0
        pending = StudentFeePayment.objects.exclude(status="paid")
        pending_fees = pending.aggregate(s=Sum("total_fee"))["s"] or 0
        return {
            "total_collection": float(total_collection),
            "pending_fees": float(pending_fees),
            "monthly_collection": float(
                paid.filter(paid_at__month=date.today().month)
                    .aggregate(s=Sum("paid_amount"))["s"] or 0
            ),
        }

    @staticmethod
    def get_monthly_collection():
        data = defaultdict(lambda: {"collection": 0, "pending": 0})
        for p in StudentFeePayment.objects.all():
            if p.status == "paid":
                data[p.month]["collection"] += float(p.paid_amount)
            else:
                data[p.month]["pending"] += float(p.total_fee)
        return [{"month": k, **v} for k, v in sorted(data.items())]

    @staticmethod
    def get_class_wise_collection():
        data = defaultdict(lambda: {"total": 0, "collection": 0, "pending": 0})
        for p in StudentFeePayment.objects.select_related("student").all():
            cls = p.student.class_assigned or "Unknown"
            data[cls]["total"] += float(p.total_fee)
            if p.status == "paid":
                data[cls]["collection"] += float(p.paid_amount)
            else:
                data[cls]["pending"] += float(p.total_fee)
        return [{"class_name": k, **v} for k, v in sorted(data.items())]

    @staticmethod
    def get_activity_log():
        return FinanceActivityLog.objects.select_related("admin", "student__user").all()

    @staticmethod
    def get_student_ledger(student_id):
        payments = StudentFeePayment.objects.filter(student_id=student_id)
        total = payments.aggregate(
            total_fee=Sum("total_fee"), paid=Sum("paid_amount"),
        )
        return {
            "payments": list(payments.values()),
            "summary": {
                "total_fee": float(total["total_fee"] or 0),
                "paid": float(total["paid"] or 0),
                "pending": float((total["total_fee"] or 0) - (total["paid"] or 0)),
                "advance": float(
                    payments.filter(refund_status="none")
                        .aggregate(s=Sum("advance_payment"))["s"] or 0
                ),
            },
        }
