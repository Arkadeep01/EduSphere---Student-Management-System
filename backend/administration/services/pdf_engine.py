import io
import os
from decimal import Decimal
from datetime import datetime

from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, HRFlowable, KeepTogether,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from administration.models.letterhead import Letterhead


def _hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 6:
        r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
        return r / 255.0, g / 255.0, b / 255.0
    return 0, 0, 0


def _build_styles(lh):
    pc = _hex_to_rgb(lh.primary_color) if lh else (0.12, 0.25, 0.63)
    sc = _hex_to_rgb(lh.secondary_color) if lh else (0.39, 0.42, 0.51)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "SchoolName", parent=styles["Title"],
        fontSize=18, textColor=colors.Color(*pc), spaceAfter=2, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "SchoolSub", parent=styles["Normal"],
        fontSize=10, textColor=colors.Color(*sc), spaceAfter=10, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "DocTitle", parent=styles["Title"],
        fontSize=14, textColor=colors.Color(*pc), spaceAfter=12, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "FieldLabel", parent=styles["Normal"],
        fontSize=9, textColor=colors.Color(*sc),
    ))
    styles.add(ParagraphStyle(
        "FieldValue", parent=styles["Normal"],
        fontSize=10, spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        "TableHeader", parent=styles["Normal"],
        fontSize=9, textColor=colors.white, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "TableCell", parent=styles["Normal"],
        fontSize=9, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "Signature", parent=styles["Normal"],
        fontSize=10, spaceBefore=20,
    ))
    styles.add(ParagraphStyle(
        "FooterText", parent=styles["Normal"],
        fontSize=8, textColor=colors.grey, alignment=TA_CENTER,
    ))
    return styles


def _build_school_header(flow, lh, styles, exam_info=None):
    if lh and lh.logo:
        logo_path = lh.logo.path if hasattr(lh.logo, "path") else str(lh.logo)
        if os.path.exists(logo_path):
            flow.append(Image(logo_path, width=60, height=60))
        flow.append(Spacer(1, 4))
    branding = lh.branding if lh else {}
    school_name = branding.get("school_name", "EduSphere")
    flow.append(Paragraph(school_name, styles["SchoolName"]))
    addr = branding.get("address", "")
    if addr:
        flow.append(Paragraph(addr, styles["SchoolSub"]))
    if lh and lh.banner:
        banner_path = lh.banner.path if hasattr(lh.banner, "path") else str(lh.banner)
        if os.path.exists(banner_path):
            flow.append(Image(banner_path, width=460, height=20))
            flow.append(Spacer(1, 6))
    flow.append(HRFlowable(width="100%", color=colors.Color(*_hex_to_rgb(lh.primary_color)) if lh else colors.blue))
    flow.append(Spacer(1, 8))


def _build_table_header_style(lh):
    pc = _hex_to_rgb(lh.primary_color) if lh else (0.12, 0.25, 0.63)
    return TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.Color(*pc)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.Color(0.8, 0.8, 0.8)),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.Color(0.95, 0.97, 1.0)]),
    ])


def _build_footer(flow, lh, styles):
    flow.append(Spacer(1, 10))
    flow.append(HRFlowable(width="100%", color=colors.grey))
    if lh and lh.footer_text:
        flow.append(Paragraph(lh.footer_text, styles["FooterText"]))


def generate_report_card_pdf(data):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    lh = data.get("letterhead")
    styles = _build_styles(lh)
    flow = []
    _build_school_header(flow, lh, styles)
    flow.append(Paragraph("Student Report Card", styles["DocTitle"]))
    flow.append(Spacer(1, 6))

    info_data = [
        ["Exam", data.get("exam_name", "")],
        ["Academic Year", data.get("academic_year", "")],
        ["Student Name", data.get("student_name", "")],
        ["Roll Number", data.get("roll_number", "")],
        ["Class", data.get("class_assigned", "")],
        ["Father's Name", data.get("father_name", "")],
    ]
    info_table = Table(info_data, colWidths=[100, 300])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ALIGN", (0, 0), (0, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    flow.append(info_table)
    flow.append(Spacer(1, 8))

    subjects = data.get("subjects", [])
    table_data = [["Subject", "Marks Obtained", "Total Marks", "Percentage", "Grade", "GP", "Remarks"]]
    for s in subjects:
        table_data.append([
            s["name"],
            str(s["marks_obtained"]),
            str(s["total_marks"]),
            f'{s["percentage"]:.2f}%',
            s["grade"],
            str(s["grade_point"]),
            s["remarks"],
        ])
    col_widths = [80, 60, 60, 60, 40, 30, 80]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(_build_table_header_style(lh))
    flow.append(t)
    flow.append(Spacer(1, 8))

    total_data = [
        ["Total", str(data.get("total_marks_obtained", "")), str(data.get("total_marks_max", "")),
         f'{data.get("percentage", 0):.2f}%', data.get("grade", ""),
         str(data.get("grade_point", "")), data.get("remarks", "")],
    ]
    total_table = Table(total_data, colWidths=col_widths)
    total_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.Color(0.9, 0.92, 0.95)),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.Color(0.8, 0.8, 0.8)),
    ]))
    flow.append(total_table)
    flow.append(Spacer(1, 6))

    rank_data = [
        ["Merit Rank", str(data.get("merit_rank", "-"))],
        ["Class Rank", str(data.get("class_rank", "-"))],
    ]
    rank_table = Table(rank_data, colWidths=[100, 100])
    rank_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    flow.append(rank_table)
    flow.append(Spacer(1, 10))

    sig = data.get("signature", "")
    if sig:
        flow.append(Paragraph(sig, styles["Signature"]))
    seal = data.get("school_seal", "")
    if seal:
        flow.append(Paragraph(seal, styles["Signature"]))
    _build_footer(flow, lh, styles)
    doc.build(flow)
    buf.seek(0)
    return buf


def generate_marksheet_pdf(data):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4), topMargin=15 * mm, bottomMargin=15 * mm)
    lh = data.get("letterhead")
    styles = _build_styles(lh)
    flow = []
    _build_school_header(flow, lh, styles)
    flow.append(Paragraph("Mark Sheet", styles["DocTitle"]))
    flow.append(Paragraph(
        f'{data.get("exam_name", "")} - {data.get("academic_year", "")}',
        styles["SchoolSub"],
    ))
    flow.append(Spacer(1, 6))

    subject_names = data.get("subject_names", [])
    header = ["#", "Student Name", "Roll No", "Class"] + subject_names + [
        "Total", "Percentage", "Grade", "Rank",
    ]
    table_data = [header]
    for i, row in enumerate(data.get("rows", []), start=1):
        srow = [
            i,
            row.get("student_name", ""),
            row.get("roll_number", ""),
            row.get("class_assigned", ""),
        ]
        for s in row.get("subjects", []):
            srow.append(f'{s.get("marks_obtained", "-")}/{s.get("total_marks", "-")} ({s.get("grade", "-")})')
        srow += [
            str(row.get("total_marks_obtained", "")),
            f'{row.get("percentage", 0):.2f}%',
            row.get("grade", ""),
            str(row.get("merit_rank", "")),
        ]
        table_data.append(srow)

    col_widths = [20, 120, 50, 50] + [70] * len(subject_names) + [50, 60, 40, 30]
    t = Table(table_data, colWidths=col_widths[:len(header)], repeatRows=1)
    ts = _build_table_header_style(lh)
    ts.add("FONTSIZE", (0, 1), (-1, -1), 7)
    t.setStyle(ts)
    flow.append(t)
    flow.append(Spacer(1, 6))
    flow.append(Paragraph(f'Total Students: {data.get("total_students", 0)}', styles["FieldLabel"]))
    _build_footer(flow, lh, styles)
    doc.build(flow)
    buf.seek(0)
    return buf


def generate_transcript_pdf(data):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    lh = data.get("letterhead")
    styles = _build_styles(lh)
    flow = []
    _build_school_header(flow, lh, styles)
    flow.append(Paragraph("Academic Transcript", styles["DocTitle"]))
    flow.append(Spacer(1, 6))

    info_data = [
        ["Student Name", data.get("student_name", "")],
        ["Roll Number", data.get("roll_number", "")],
        ["Class", data.get("class_assigned", "")],
        ["Father's Name", data.get("father_name", "")],
    ]
    info_table = Table(info_data, colWidths=[100, 300])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    flow.append(info_table)
    flow.append(Spacer(1, 10))

    for session in data.get("sessions", []):
        flow.append(Paragraph(
            f'{session.get("session", "")} - {session.get("exam_name", "")}',
            styles["DocTitle"],
        ))
        subj_data = [["Subject", "Marks Obtained", "Total Marks", "Grade"]]
        for s in session.get("subjects", []):
            subj_data.append([
                s.get("name", ""), str(s.get("marks_obtained", "")),
                str(s.get("total_marks", "")), s.get("grade", ""),
            ])
        t = Table(subj_data, colWidths=[120, 80, 80, 50], repeatRows=1)
        t.setStyle(_build_table_header_style(lh))
        flow.append(t)
        flow.append(Paragraph(
            f'Overall: {session.get("percentage", "-")}% - Grade: {session.get("grade", "-")}',
            styles["FieldValue"],
        ))
        flow.append(Spacer(1, 8))

    sig = data.get("signature", "")
    if sig:
        flow.append(Paragraph(sig, styles["Signature"]))
    seal = data.get("school_seal", "")
    if seal:
        flow.append(Paragraph(seal, styles["Signature"]))
    _build_footer(flow, lh, styles)
    doc.build(flow)
    buf.seek(0)
    return buf


def generate_printable_result_pdf(data):
    return generate_report_card_pdf(data)
