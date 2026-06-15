from django.contrib import admin

from .models import (
    SubjectRequestControl,
    ClassTeacherAssignment,
    TeacherSubjectAllocation,
    FacultyAttendance,
    Exam,
    ExamSchedule,
    AnswerScriptUpload,
    EvaluationTracking,
    PublishedResult,
    Event,
    ContactSubmission,
    AdmissionApplication,
    AdmissionVerification,
    StudentRegistrationLog,
    GalleryImage,
    HomepageFeaturedImage,
    AboutPageContent,
    AdmissionPageContent,
    ExportLog,
    DocumentStorage,
    NotificationBroadcast,
)

admin.site.register(SubjectRequestControl)
admin.site.register(ClassTeacherAssignment)
admin.site.register(TeacherSubjectAllocation)
admin.site.register(FacultyAttendance)
admin.site.register(Exam)
admin.site.register(ExamSchedule)
admin.site.register(AnswerScriptUpload)
admin.site.register(EvaluationTracking)
admin.site.register(PublishedResult)
admin.site.register(Event)
admin.site.register(ContactSubmission)
admin.site.register(AdmissionApplication)
admin.site.register(AdmissionVerification)
admin.site.register(StudentRegistrationLog)
admin.site.register(GalleryImage)
admin.site.register(HomepageFeaturedImage)
admin.site.register(AboutPageContent)
admin.site.register(AdmissionPageContent)
admin.site.register(ExportLog)
admin.site.register(DocumentStorage)
admin.site.register(NotificationBroadcast)
