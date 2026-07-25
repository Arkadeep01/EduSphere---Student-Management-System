from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from student.models import StudentProfile, Subject, StudentSubject
from teacher.models import TeacherProfile
from administration.models import (
    AcademicSession, PromotionLog, StudentPromotionHistory,
    Class, ClassTeacherAssignment, TeacherSubjectAllocation,
    PromotionRule, AcademicSessionRollover
)
from administration.models.results import StudentResult
from administration.models.fee import FeeStructure
from administration.models.teacher import FacultyAttendance
from administration.models.exam import Exam
from administration.models.audit_log import AuditLog

from .promotion_service import PromotionService, RepeatDetainService, BulkPromotionService


# These services are now centralized in promotion_service.py
# This file exists for backwards compatibility with any imports
# Use: from administration.services.promotion_service import PromotionService, RepeatDetainService, BulkPromotionService