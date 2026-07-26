from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from administration.permissions import IsAdmin
from administration.services.fee_admin import FeeAdminService
from administration.serializers.fee import (
    FeeStructureSerializer,
    StudentFeePaymentSerializer,
    StudentScholarshipSerializer,
    FinanceActivityLogSerializer,
    PaymentRecordSerializer,
    CorrectionRequestSerializer,
    ClearanceDeadlineSerializer,
    ReminderSerializer,
    FeeGenerateSerializer,
)


# ── Fee Structure ──────────────────────────────────────────────────────────

class FeeStructureListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        structures = FeeAdminService.list_structures()
        serializer = FeeStructureSerializer(structures, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        fs = FeeAdminService.create_structure(data, request.user)
        serializer = FeeStructureSerializer(fs)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FeeStructureDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, structure_id):
        try:
            data = FeeAdminService.list_structures().get(id=structure_id)
        except:
            return Response({"error": "Not found"}, status=404)
        serializer = FeeStructureSerializer(data)
        return Response(serializer.data)

    def patch(self, request, structure_id):
        fs = FeeAdminService.update_structure(structure_id, request.data, request.user)
        serializer = FeeStructureSerializer(fs)
        return Response(serializer.data)

    def delete(self, request, structure_id):
        FeeAdminService.delete_structure(structure_id, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FeeStructureDuplicateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        fs = FeeAdminService.duplicate_structure(
            request.data["from_class"], request.data["to_class"], request.user
        )
        if not fs:
            return Response({"error": "Source structure not found"}, status=404)
        serializer = FeeStructureSerializer(fs)
        return Response(serializer.data)


# ── Fee Generation ─────────────────────────────────────────────────────────

class FeeGenerateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        ser = FeeGenerateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        try:
            result = FeeAdminService.generate_fees_for_class(
                ser.validated_data["class_name"],
                ser.validated_data.get("academic_session", "2026-27"),
                request.user,
            )
            return Response(result)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


# ── Payments ───────────────────────────────────────────────────────────────

class FeePaymentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        payments = FeeAdminService.list_payments(
            class_name=request.query_params.get("class_name"),
            month=request.query_params.get("month"),
            status=request.query_params.get("status"),
        )
        serializer = StudentFeePaymentSerializer(payments, many=True)
        return Response(serializer.data)


class FeePaymentRecordView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        ser = PaymentRecordSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        try:
            payment = FeeAdminService.record_payment(
                ser.validated_data["payment_id"],
                request.user,
                ser.validated_data,
            )
            serializer = StudentFeePaymentSerializer(payment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class FeePaymentVerifyView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, payment_id):
        try:
            payment = FeeAdminService.verify_payment(
                payment_id, request.user, request.data.get("receipt_number")
            )
            serializer = StudentFeePaymentSerializer(payment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class FeePaymentRejectView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, payment_id):
        payment = FeeAdminService.reject_payment(payment_id, request.user)
        serializer = StudentFeePaymentSerializer(payment)
        return Response(serializer.data)


# ── Correction / Refund ────────────────────────────────────────────────────

class FeeCorrectionRequestView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        ser = CorrectionRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        try:
            payment = FeeAdminService.request_correction(
                ser.validated_data["payment_id"],
                request.user,
                ser.validated_data["reason"],
            )
            serializer = StudentFeePaymentSerializer(payment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class FeeCorrectionApproveView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, payment_id):
        try:
            payment = FeeAdminService.approve_correction(payment_id, request.user)
            serializer = StudentFeePaymentSerializer(payment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class FeeRefundRequestView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        ser = CorrectionRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        try:
            payment = FeeAdminService.request_refund(
                ser.validated_data["payment_id"],
                request.user,
                ser.validated_data["reason"],
            )
            serializer = StudentFeePaymentSerializer(payment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class FeeRefundApproveView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, payment_id):
        try:
            payment = FeeAdminService.approve_refund(payment_id, request.user)
            serializer = StudentFeePaymentSerializer(payment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


# ── Backward-compat Refund views ──────────────────────────────────────────

class FeeRefundInitiateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, payment_id):
        try:
            payment = FeeAdminService.request_refund(
                payment_id, request.user,
                request.data.get("reason", "Admin initiated refund"),
            )
            serializer = StudentFeePaymentSerializer(payment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class FeeRefundCompleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, payment_id):
        try:
            payment = FeeAdminService.approve_refund(payment_id, request.user)
            serializer = StudentFeePaymentSerializer(payment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


# ── Scholarships ───────────────────────────────────────────────────────────

class ScholarshipListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        scholarships = FeeAdminService.list_scholarships()
        serializer = StudentScholarshipSerializer(scholarships, many=True)
        return Response(serializer.data)

    def post(self, request):
        sch = FeeAdminService.grant_scholarship(request.data, request.user)
        serializer = StudentScholarshipSerializer(sch)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ScholarshipRevokeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, scholarship_id):
        sch = FeeAdminService.revoke_scholarship(scholarship_id, request.user)
        serializer = StudentScholarshipSerializer(sch)
        return Response(serializer.data)


# ── Analytics ──────────────────────────────────────────────────────────────

class FeeAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            "summary": FeeAdminService.get_summary(),
            "monthly": FeeAdminService.get_monthly_collection(),
            "class_wise": FeeAdminService.get_class_wise_collection(),
        })


class FeeActivityLogView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        logs = FeeAdminService.get_activity_log()
        serializer = FinanceActivityLogSerializer(logs, many=True)
        return Response(serializer.data)


# ── Student Ledger ─────────────────────────────────────────────────────────

class StudentFeeLedgerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student_id = request.user.student_profile.id
        try:
            ledger = FeeAdminService.get_student_ledger(student_id, requesting_user=request.user)
            return Response(ledger)
        except PermissionError as e:
            return Response({"error": str(e)}, status=403)

    def post(self, request):
        student_id = request.user.student_profile.id
        FeeAdminService.record_offline_payment(
            student_id=student_id,
            month=request.data["month"],
            amount=request.data["amount"],
            payment_method=request.data["payment_method"],
            transaction_ref=request.data.get("transaction_ref"),
        )
        return Response({"status": "pending_verification"}, status=status.HTTP_201_CREATED)


# ── Receipt ────────────────────────────────────────────────────────────────

class FeeReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        from django.shortcuts import get_object_or_404
        from administration.models.fee import StudentFeePayment
        payment = get_object_or_404(StudentFeePayment, id=payment_id)

        if hasattr(request.user, "student_profile"):
            if payment.student_id != request.user.student_profile.id:
                return Response({"error": "Access denied"}, status=403)

        student = payment.student
        receipt_html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt</title>
<style>
body {{ font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; }}
.receipt {{ max-width: 700px; margin: auto; border: 1px solid #ddd; padding: 30px; }}
.header {{ text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }}
.header h1 {{ color: #2563eb; margin: 0; }}
.header p {{ color: #666; margin: 2px 0; }}
.row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }}
.label {{ color: #666; }}
.value {{ font-weight: 600; }}
.total {{ font-size: 1.2em; font-weight: 700; color: #2563eb; }}
.footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 0.9em; }}
</style></head><body>
<div class="receipt">
<div class="header"><h1>EduSphere Academy</h1><p>Fee Payment Receipt</p></div>
<div class="row"><span class="label">Receipt No</span><span class="value">{payment.receipt_number or 'N/A'}</span></div>
<div class="row"><span class="label">Student</span><span class="value">{student.user.get_full_name() or student.user.email}</span></div>
<div class="row"><span class="label">Admission No</span><span class="value">{student.admission_number or 'N/A'}</span></div>
<div class="row"><span class="label">Class</span><span class="value">{student.class_assigned or 'N/A'}</span></div>
<div class="row"><span class="label">Academic Session</span><span class="value">{payment.academic_session}</span></div>
<div class="row"><span class="label">Fee Component</span><span class="value">{payment.fee_component.name if payment.fee_component else payment.month or 'General'}</span></div>
<div class="row"><span class="label">Total Fee</span><span class="value">₹{payment.total_fee}</span></div>
<div class="row"><span class="label">Paid Amount</span><span class="value">₹{payment.paid_amount}</span></div>
<div class="row"><span class="label">Fine</span><span class="value">₹{payment.fine}</span></div>
<div class="row total"><span class="label">Total Paid</span><span class="value">₹{payment.paid_amount + payment.fine}</span></div>
<div class="row"><span class="label">Payment Method</span><span class="value">{payment.payment_method or 'N/A'}</span></div>
<div class="row"><span class="label">Transaction Ref</span><span class="value">{payment.transaction_ref or 'N/A'}</span></div>
<div class="row"><span class="label">Paid At</span><span class="value">{payment.paid_at.strftime('%d %b %Y') if payment.paid_at else 'N/A'}</span></div>
<div class="row"><span class="label">Verified By</span><span class="value">{payment.verified_by.get_full_name() if payment.verified_by else 'N/A'}</span></div>
<div class="footer">This is a computer-generated receipt.</div>
</div></body></html>"""
        from django.http import HttpResponse
        return HttpResponse(receipt_html)


# ── Clearance Deadline ─────────────────────────────────────────────────────

class FeeClearanceDeadlineView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        ser = ClearanceDeadlineSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        result = FeeAdminService.set_clearance_deadline(
            ser.validated_data["student_id"],
            ser.validated_data["deadline"],
            request.user,
        )
        return Response(result)


# ── Reminder ───────────────────────────────────────────────────────────────

class FeeReminderView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        ser = ReminderSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        result = FeeAdminService.send_reminder(
            ser.validated_data["student_ids"],
            request.user,
        )
        return Response(result)


# ── Outstanding Dues Check ────────────────────────────────────────────────

class FeeOutstandingCheckView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_id):
        has_dues = FeeAdminService.has_outstanding_dues(student_id)
        summary = FeeAdminService.get_outstanding_summary(student_id)
        return Response({"has_outstanding_dues": has_dues, **summary})


# ── Admission Fee ──────────────────────────────────────────────────────────

class FeeAdmissionRecordView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, student_id):
        payment = FeeAdminService.record_admission_fee(student_id, request.user)
        serializer = StudentFeePaymentSerializer(payment)
        return Response(serializer.data)


class FeeAdmissionPaymentView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, student_id):
        try:
            payment = FeeAdminService.record_admission_fee_payment(student_id, request.user)
            serializer = StudentFeePaymentSerializer(payment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
