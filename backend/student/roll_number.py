import re


def generate_roll_number(class_name, section=""):
    prefix = _extract_prefix(class_name)
    last = StudentProfile.objects.filter(
        roll_number__startswith=prefix
    ).order_by("roll_number").values_list("roll_number", flat=True).last()
    seq = 1
    if last:
        match = re.search(r"(\d+)$", last)
        if match:
            seq = int(match.group(1)) + 1
    return f"{prefix}{seq:04d}"


def generate_admission_number():
    from .models import StudentProfile
    last = StudentProfile.objects.order_by("admission_number").values_list(
        "admission_number", flat=True
    ).last()
    seq = 1
    if last:
        match = re.search(r"(\d+)$", last)
        if match:
            seq = int(match.group(1)) + 1
    return f"ADM{seq:04d}"


def _extract_prefix(class_name):
    base = class_name.split("-")[0] if "-" in class_name else class_name
    base = base.strip().upper()
    return f"STU{base}"


from .models import StudentProfile
