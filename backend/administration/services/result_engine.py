import io
import math
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.db.models import Count, Q, Sum, Avg, F, Window
from django.db.models.functions import Rank
from django.template.loader import render_to_string

from administration.models.exam import AnswerScriptUpload, PublishedResult
from administration.models.results import GradeBoundary, ResultPublication, StudentResult
from administration.models.academic import AcademicSession
from administration.models.letterhead import Letterhead
from administration.models.audit_log import AuditLog
from administration.models.notification import NotificationBroadcast
from student.models import StudentProfile


RANK_FIELDS = ["merit_rank", "class_rank"]


# ---------------------------------------------------------------------------
# Grade Calculation
# ---------------------------------------------------------------------------

def get_grade_boundaries():
    boundaries = GradeBoundary.objects.all()
    if not boundaries.exists():
        for b in GradeBoundary.default_boundaries():
            b.save()
        boundaries = GradeBoundary.objects.all()
    return list(boundaries)


def calculate_grade(percentage):
    boundaries = get_grade_boundaries()
    for b in boundaries:
        if b.min_percentage <= percentage <= b.max_percentage:
            return {
                "grade": b.name,
                "grade_point": b.grade_point,
                "is_pass": b.is_pass,
                "remarks": b.remarks,
            }
    return {"grade": "F", "grade_point": Decimal("0.00"), "is_pass": False, "remarks": "Fail"}


def calculate_percentage(marks_obtained, total_marks):
    if total_marks and total_marks > 0:
        return (Decimal(str(marks_obtained)) / Decimal(str(total_marks))) * Decimal("100")
    return Decimal("0")


# ---------------------------------------------------------------------------
# Student Result Computation from PublishedResults / AnswerScriptUploads
# ---------------------------------------------------------------------------

def compute_student_result(publication, student):
    published = PublishedResult.objects.filter(
        exam=publication.exam, student=student
    )
    script_results = AnswerScriptUpload.objects.filter(
        exam=publication.exam, student=student,
        evaluation_status="completed", marks_obtained__isnull=False,
    )
    subject_results = {}
    for pr in published:
        subject_results[pr.subject_id] = {
            "marks_obtained": pr.marks_obtained,
            "total_marks": pr.total_marks,
            "grade": pr.grade,
        }
    for sr in script_results:
        sid = sr.subject_id
        if sid not in subject_results:
            grade_info = calculate_grade(
                calculate_percentage(sr.marks_obtained, sr.total_marks)
            )
            subject_results[sid] = {
                "marks_obtained": sr.marks_obtained,
                "total_marks": sr.total_marks,
                "grade": grade_info["grade"],
            }

    total_obtained = Decimal("0")
    total_max = Decimal("0")
    passed = 0
    failed = 0
    for data in subject_results.values():
        total_obtained += Decimal(str(data["marks_obtained"]))
        total_max += Decimal(str(data["total_marks"]))

    pct = calculate_percentage(total_obtained, total_max)
    grade_info = calculate_grade(pct)
    subj_count = len(subject_results)

    sr, _ = StudentResult.objects.get_or_create(
        publication=publication, student=student,
        defaults={
            "percentage": pct,
            "total_marks_obtained": total_obtained,
            "total_marks_max": total_max,
            "grade": grade_info["grade"],
            "grade_point": grade_info["grade_point"],
            "is_pass": grade_info["is_pass"],
            "remarks": grade_info["remarks"],
            "subject_counts": subj_count,
            "passed_subjects": passed,
            "failed_subjects": failed,
        },
    )
    if not sr.locked:
        sr.percentage = pct
        sr.total_marks_obtained = total_obtained
        sr.total_marks_max = total_max
        sr.grade = grade_info["grade"]
        sr.grade_point = grade_info["grade_point"]
        sr.is_pass = grade_info["is_pass"]
        sr.remarks = grade_info["remarks"]
        sr.subject_counts = subj_count
        sr.passed_subjects = passed
        sr.failed_subjects = failed
        sr.save()
    return sr


@transaction.atomic
def generate_all_results(publication, user=None):
    scripts = AnswerScriptUpload.objects.filter(
        exam=publication.exam,
        evaluation_status="completed",
        marks_obtained__isnull=False,
    ).select_related("student").distinct()
    student_ids = set(scripts.values_list("student_id", flat=True))
    published = PublishedResult.objects.filter(
        exam=publication.exam
    ).select_related("student").distinct()
    student_ids.update(set(published.values_list("student_id", flat=True)))
    results = []
    for sid in student_ids:
        student = StudentProfile.objects.get(id=sid)
        results.append(compute_student_result(publication, student))
    compute_merit_rank(publication)
    compute_class_ranks(publication)
    assign_publication_dates(publication, user)
    return results


def assign_publication_dates(publication, user=None):
    if publication.workflow_status == "draft":
        publication.draft_at = timezone.now()
        publication.draft_by = user
    elif publication.workflow_status == "review":
        publication.review_at = timezone.now()
        publication.review_by = user
    elif publication.workflow_status == "approved":
        publication.approved_at = timezone.now()
        publication.approved_by = user
    elif publication.workflow_status == "published":
        publication.published_at = timezone.now()
        publication.published_by = user
    publication.save()


# ---------------------------------------------------------------------------
# Workflow
# ---------------------------------------------------------------------------

@transaction.atomic
def transition_workflow(publication, target_status, user=None):
    valid = {
        "draft": ["review"],
        "review": ["draft", "approved"],
        "approved": ["review", "published"],
        "published": [],
    }
    if publication.is_locked:
        raise ValueError("Publication is locked and cannot be modified.")
    current = publication.workflow_status
    if target_status not in valid.get(current, []):
        raise ValueError(
            f"Cannot transition from {current} to {target_status}. "
            f"Allowed: {valid.get(current, [])}"
        )
    publication.workflow_status = target_status
    assign_publication_dates(publication, user)
    if target_status == "published":
        publication.is_locked = True
        publication.locked_at = timezone.now()
        publication.locked_by = user
        lock_student_results(publication)
    notification_title = f"Results {target_status.title()}"
    notification_msg = f"Results for {publication.exam.name} are now {target_status}."
    NotificationBroadcast.objects.create(
        title=notification_title,
        message=notification_msg,
        sent_by=user,
        recipient_type="all_students",
        status="sent",
        sent_at=timezone.now(),
    )
    AuditLog.objects.create(
        action="update",
        model_name="ResultPublication",
        object_id=str(publication.id),
        user=user,
        description=f"Result publication {publication.id} transitioned to {target_status}",
    )
    return publication


def lock_student_results(publication):
    StudentResult.objects.filter(publication=publication).update(locked=True)


# ---------------------------------------------------------------------------
# Ranking
# ---------------------------------------------------------------------------

def compute_merit_rank(publication):
    results = StudentResult.objects.filter(publication=publication).order_by("-percentage")
    for idx, sr in enumerate(results, start=1):
        StudentResult.objects.filter(id=sr.id).update(merit_rank=idx)


def compute_class_ranks(publication):
    results = StudentResult.objects.filter(publication=publication).select_related("student")
    class_groups = {}
    for sr in results:
        cls = sr.student.class_assigned
        if cls not in class_groups:
            class_groups[cls] = []
        class_groups[cls].append(sr)
    for cls, group in class_groups.items():
        group.sort(key=lambda x: x.percentage or 0, reverse=True)
        for idx, sr in enumerate(group, start=1):
            StudentResult.objects.filter(id=sr.id).update(class_rank=idx)


def compute_subject_rank(publication):
    published = PublishedResult.objects.filter(
        exam=publication.exam,
        marks_obtained__isnull=False,
    ).select_related("student")
    subject_groups = {}
    for pr in published:
        sid = pr.subject_id
        if sid not in subject_groups:
            subject_groups[sid] = []
        subject_groups[sid].append(pr)
    result = {}
    for sid, group in subject_groups.items():
        group.sort(key=lambda x: x.marks_obtained, reverse=True)
        result[sid] = [
            {"student_id": pr.student_id, "rank": idx, "marks": pr.marks_obtained}
            for idx, pr in enumerate(group, start=1)
        ]
    return result


# ---------------------------------------------------------------------------
# Bulk Publish
# ---------------------------------------------------------------------------

@transaction.atomic
def bulk_publish_results(publication, user=None):
    results = StudentResult.objects.filter(publication=publication)
    published_count = 0
    for sr in results:
        scripts = AnswerScriptUpload.objects.filter(
            exam=publication.exam, student=sr.student,
            evaluation_status="completed", marks_obtained__isnull=False,
        )
        for sc in scripts:
            PublishedResult.objects.update_or_create(
                exam=publication.exam,
                student=sr.student,
                subject=sc.subject,
                defaults={
                    "marks_obtained": sc.marks_obtained,
                    "total_marks": sc.total_marks,
                    "grade": sr.grade,
                    "published_by": user,
                },
            )
            published_count += 1
    transition_workflow(publication, "published", user)
    return {"published_count": published_count}


# ---------------------------------------------------------------------------
# PDF Templates (rendered HTML for reportlab / weasyprint)
# ---------------------------------------------------------------------------

def get_letterhead_data():
    lh = Letterhead.objects.filter(is_default=True).first()
    if not lh:
        lh = Letterhead.objects.first()
    return lh


def render_report_card(student_result):
    sr = student_result
    pub = sr.publication
    exam = pub.exam
    student = sr.student
    lh = get_letterhead_data()
    scripts = AnswerScriptUpload.objects.filter(
        exam=exam, student=student,
        evaluation_status="completed",
    ).select_related("subject").order_by("subject__name")
    subjects = []
    for sc in scripts:
        pct = calculate_percentage(sc.marks_obtained, sc.total_marks)
        gi = calculate_grade(pct)
        subjects.append({
            "name": sc.subject.name,
            "marks_obtained": sc.marks_obtained,
            "total_marks": sc.total_marks,
            "percentage": round(pct, 2),
            "grade": gi["grade"],
            "grade_point": gi["grade_point"],
            "remarks": gi["remarks"],
        })
    return {
        "type": "report_card",
        "title": "Student Report Card",
        "letterhead": lh,
        "exam_name": exam.name,
        "exam_date": str(exam.date),
        "academic_year": exam.academic_year or "",
        "student_name": student.user.get_full_name() or student.user.email,
        "roll_number": student.roll_number or "",
        "class_assigned": student.class_assigned or "",
        "father_name": student.father_name or "",
        "mother_name": student.mother_name or "",
        "subjects": subjects,
        "total_marks_obtained": sr.total_marks_obtained,
        "total_marks_max": sr.total_marks_max,
        "percentage": round(sr.percentage, 2) if sr.percentage else 0,
        "grade": sr.grade,
        "grade_point": sr.grade_point,
        "is_pass": sr.is_pass,
        "remarks": sr.remarks,
        "merit_rank": sr.merit_rank,
        "class_rank": sr.class_rank,
        "signature": lh.signature_placeholder if lh else "",
        "school_seal": lh.school_seal_placeholder if lh else "",
    }


def render_marksheet(publication):
    exam = publication.exam
    lh = get_letterhead_data()
    results = StudentResult.objects.filter(publication=publication).select_related(
        "student__user"
    ).order_by("-percentage")
    scripts = AnswerScriptUpload.objects.filter(
        exam=exam, evaluation_status="completed",
    ).select_related("subject", "student").order_by("subject__name")
    subject_names = list(
        scripts.values_list("subject__name", flat=True).distinct()
    )
    rows = []
    for sr in results:
        student_scripts = {s.subject.name: s for s in scripts if s.student_id == sr.student_id}
        row_subjects = []
        for sname in subject_names:
            sc = student_scripts.get(sname)
            if sc:
                pct = calculate_percentage(sc.marks_obtained, sc.total_marks)
                gi = calculate_grade(pct)
                row_subjects.append({
                    "marks_obtained": sc.marks_obtained,
                    "total_marks": sc.total_marks,
                    "grade": gi["grade"],
                })
            else:
                row_subjects.append({"marks_obtained": "-", "total_marks": "-", "grade": "-"})
        rows.append({
            "student_name": sr.student.user.get_full_name() or sr.student.user.email,
            "roll_number": sr.student.roll_number or "",
            "class_assigned": sr.student.class_assigned or "",
            "subjects": row_subjects,
            "total_marks_obtained": sr.total_marks_obtained,
            "total_marks_max": sr.total_marks_max,
            "percentage": round(sr.percentage, 2) if sr.percentage else 0,
            "grade": sr.grade,
            "merit_rank": sr.merit_rank,
        })
    return {
        "type": "marksheet",
        "title": "Mark Sheet",
        "letterhead": lh,
        "exam_name": exam.name,
        "academic_year": exam.academic_year or "",
        "subject_names": subject_names,
        "rows": rows,
        "total_students": len(rows),
    }


def render_transcript(student_result):
    sr = student_result
    pub = sr.publication
    exam = pub.exam
    student = sr.student
    lh = get_letterhead_data()
    academic_sessions = AcademicSession.objects.filter(
        result_publications__exam__published_results__student=student,
    ).distinct().order_by("-start_date")
    session_data = []
    for sess in academic_sessions:
        pubs = ResultPublication.objects.filter(
            academic_session=sess,
            exam__published_results__student=student,
            workflow_status="published",
        ).distinct()
        for p in pubs:
            srs = StudentResult.objects.filter(
                publication=p, student=student
            ).first()
            p_results = PublishedResult.objects.filter(
                exam=p.exam, student=student
            ).select_related("subject")
            subjects = []
            for pr in p_results:
                subjects.append({
                    "name": pr.subject.name,
                    "marks_obtained": pr.marks_obtained,
                    "total_marks": pr.total_marks,
                    "grade": pr.grade,
                })
            session_data.append({
                "session": sess.name,
                "exam_name": p.exam.name,
                "subjects": subjects,
                "percentage": round(srs.percentage, 2) if srs and srs.percentage else "-",
                "grade": srs.grade if srs else "-",
            })
    return {
        "type": "transcript",
        "title": "Academic Transcript",
        "letterhead": lh,
        "student_name": student.user.get_full_name() or student.user.email,
        "roll_number": student.roll_number or "",
        "class_assigned": student.class_assigned or "",
        "father_name": student.father_name or "",
        "sessions": session_data,
        "signature": lh.signature_placeholder if lh else "",
        "school_seal": lh.school_seal_placeholder if lh else "",
    }


def render_printable_result(student_result):
    sr = student_result
    data = render_report_card(sr)
    data["type"] = "printable_result"
    data["title"] = "Printable Result"
    data["is_printable"] = True
    data["print_footer"] = "This is a computer-generated document."
    return data
