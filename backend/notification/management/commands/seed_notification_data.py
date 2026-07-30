from django.core.management.base import BaseCommand
from notification.models import EmailTemplate, InstitutionSettings


DEFAULT_TEMPLATES = {
    "email_verification": {
        "subject": "EduSphere - Verify Your Email Address",
        "body_html": """<p>Welcome to EduSphere! Please verify your email address by clicking the link below:</p>
<p><a href="{{ frontend_url }}/verify-email?token={{ verification_token }}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Verify Email Address</a></p>
<p>This link expires in 24 hours.</p>""",
        "body_text": "Welcome to EduSphere! Verify your email: {{ frontend_url }}/verify-email?token={{ verification_token }}",
    },
    "welcome": {
        "subject": "Welcome to {{ institution_name }} - EduSphere",
        "body_html": """<p>Welcome aboard! We are delighted to have you as part of the {{ institution_name }} community.</p>
<p>Your account has been successfully created. You can now log in to access your dashboard, view your subjects, assignments, and more.</p>
<p><a href="{{ frontend_url }}/login" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Login to EduSphere</a></p>""",
        "body_text": "Welcome to {{ institution_name }}! Your account has been created. Login at {{ frontend_url }}/login",
    },
    "assignment_notification": {
        "subject": "New Assignment: {{ title }}",
        "body_html": """<p>A new assignment has been posted:</p>
<p><strong>{{ title }}</strong></p>
<p>{{ message }}</p>
<p><a href="{{ frontend_url }}/student/assignments" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Assignment</a></p>""",
        "body_text": "New Assignment: {{ title }} - {{ message }}",
    },
    "assignment_reminder": {
        "subject": "Reminder: Assignment Due - {{ title }}",
        "body_html": """<p>This is a reminder that the following assignment is due soon:</p>
<p><strong>{{ title }}</strong></p>
<p>{{ message }}</p>
<p><a href="{{ frontend_url }}/student/assignments" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Assignment</a></p>""",
        "body_text": "Reminder: Assignment '{{ title }}' is due soon.",
    },
    "marks_published": {
        "subject": "Results Published - {{ title }}",
        "body_html": """<p>Your exam results have been published.</p>
<p><strong>{{ title }}</strong></p>
<p>{{ message }}</p>
<p><a href="{{ frontend_url }}/student/results" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Results</a></p>""",
        "body_text": "Results published: {{ title }}. Login to view your results.",
    },
    "rechecked_result": {
        "subject": "Updated Result Available - {{ title }}",
        "body_html": """<p>Your updated result after rechecking is now available.</p>
<p><strong>{{ title }}</strong></p>
<p>{{ message }}</p>
<p style="font-size:14px;color:#6b7280;">Please login to EduSphere to view your revised result.</p>
<p><a href="{{ frontend_url }}/student/results" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Revised Result</a></p>""",
        "body_text": "Your updated result after rechecking is available. Login to view.",
    },
    "fee_reminder": {
        "subject": "Fee Reminder - {{ title }}",
        "body_html": """<p>This is a reminder regarding your pending fees.</p>
<p><strong>{{ title }}</strong></p>
<p>{{ message }}</p>
<p><a href="{{ frontend_url }}/student/fees" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Pay Now</a></p>""",
        "body_text": "Fee Reminder: {{ title }} - {{ message }}",
    },
    "general_announcement": {
        "subject": "{{ title }}",
        "body_html": """<p>{{ message }}</p>
<p><a href="{{ frontend_url }}/notifications" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Details</a></p>""",
        "body_text": "{{ message }}",
    },
    "event_notification": {
        "subject": "Upcoming Event: {{ title }}",
        "body_html": """<p>We have an upcoming event at {{ institution_name }}:</p>
<p><strong>{{ title }}</strong></p>
<p>{{ message }}</p>
<p><a href="{{ frontend_url }}/events" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Event</a></p>""",
        "body_text": "Event: {{ title }} - {{ message }}",
    },
    "emergency_announcement": {
        "subject": "EMERGENCY: {{ title }}",
        "body_html": """<p><strong style="color:#dc2626;">IMPORTANT NOTICE</strong></p>
<p>{{ message }}</p>
<p>Please check the EduSphere portal for further updates.</p>""",
        "body_text": "EMERGENCY: {{ title }} - {{ message }}",
    },
    "promotion_promoted": {
        "subject": "Congratulations – You've Been Promoted!",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>Congratulations! You have been <strong>promoted</strong> from <strong>{{ from_class }}</strong> to <strong>{{ to_class }}</strong> for the academic year <strong>{{ academic_year }}</strong>.</p>
<p>We are proud of your hard work and dedication. Continue to strive for excellence in the new academic year!</p>
<p><a href="{{ frontend_url }}/student/dashboard" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Your Dashboard</a></p>""",
        "body_text": "Congratulations! You have been promoted from {{ from_class }} to {{ to_class }} for {{ academic_year }}.",
    },
    "promotion_repeated": {
        "subject": "Academic Decision – Repeat Notice",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>This is to inform you that you have been scheduled to <strong>repeat</strong> <strong>{{ class_name }}</strong> for the academic year <strong>{{ academic_year }}</strong>.</p>
<p>Reason: {{ reason }}</p>
<p>Please contact the academic office for further guidance and support.</p>
<p><a href="{{ frontend_url }}/student/dashboard" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Details</a></p>""",
        "body_text": "Academic Decision: You have been scheduled to repeat {{ class_name }} for {{ academic_year }}. Reason: {{ reason }}",
    },
    "promotion_detained": {
        "subject": "Important – Detention Notice",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>This is to inform you that you have been <strong>detained</strong> in <strong>{{ class_name }}</strong> for the academic year <strong>{{ academic_year }}</strong>.</p>
<p>Reason: {{ reason }}</p>
<p>Please contact the academic office to discuss the next steps and available support programs.</p>
<p><a href="{{ frontend_url }}/student/dashboard" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Details</a></p>""",
        "body_text": "Important: You have been detained in {{ class_name }} for {{ academic_year }}. Reason: {{ reason }}",
    },
    "promotion_bulk_complete": {
        "subject": "Promotion Results Published",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>Your promotion results have been published. You have been promoted to <strong>{{ new_class }}</strong> for the academic year <strong>{{ academic_year }}</strong>.</p>
<p>Please log in to the EduSphere portal to view your updated class and section information.</p>
<p><a href="{{ frontend_url }}/student/dashboard" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Dashboard</a></p>""",
        "body_text": "Promotion Results Published: You have been promoted to {{ new_class }} for {{ academic_year }}.",
    },
    "promotion_rollover_started": {
        "subject": "Session Rollover In Progress",
        "body_html": """<p>Dear Administrator,</p>
<p>An academic session rollover has been initiated from <strong>{{ from_session }}</strong> to <strong>{{ to_session }}</strong>.</p>
<p>The rollover process is now in progress. You will receive a notification once it completes.</p>
<p><a href="{{ frontend_url }}/admin/promotions/rollover" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Rollover Status</a></p>""",
        "body_text": "Session rollover from {{ from_session }} to {{ to_session }} has started.",
    },
    "promotion_rollover_complete": {
        "subject": "Session Rollover Complete",
        "body_html": """<p>Dear Administrator,</p>
<p>The academic session rollover from <strong>{{ from_session }}</strong> to <strong>{{ to_session }}</strong> has completed successfully.</p>
<p>All selected data has been carried forward to the new session.</p>
<p><a href="{{ frontend_url }}/admin/promotions/rollover" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Rollover Details</a></p>""",
        "body_text": "Session rollover from {{ from_session }} to {{ to_session }} completed successfully.",
    },
    "promotion_rollover_failed": {
        "subject": "Session Rollover Failed – Action Required",
        "body_html": """<p>Dear Administrator,</p>
<p>The academic session rollover from <strong>{{ from_session }}</strong> to <strong>{{ to_session }}</strong> has <strong style="color:#dc2626;">failed</strong>.</p>
<p>Error details: {{ error_details }}</p>
<p>Please review the error and retry the rollover process.</p>
<p><a href="{{ frontend_url }}/admin/promotions/rollover" style="display:inline-block;padding:10px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;">Review & Retry</a></p>""",
        "body_text": "Session rollover from {{ from_session }} to {{ to_session }} failed. Error: {{ error_details }}",
    },

    # -----------------------------------------------------------------------
    # Result Engine Templates
    # -----------------------------------------------------------------------
    "results_published": {
        "subject": "Results Published – {{ exam_name }}",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>The results for <strong>{{ exam_name }}</strong> have been published.</p>
<p>You can now view your performance, grades, and rankings on the EduSphere portal.</p>
<p><a href="{{ frontend_url }}/student/results" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Results</a></p>""",
        "body_text": "Results for {{ exam_name }} have been published. Login to view your results.",
    },
    "results_drafted": {
        "subject": "Results Drafted – {{ exam_name }}",
        "body_html": """<p>Results for <strong>{{ exam_name }}</strong> have been drafted and are ready for review.</p>
<p>Please review the results on the administrative portal.</p>""",
        "body_text": "Results for {{ exam_name }} have been drafted.",
    },
    "results_approved": {
        "subject": "Results Approved – {{ exam_name }}",
        "body_html": """<p>Results for <strong>{{ exam_name }}</strong> have been approved by the administration.</p>
<p>Final publication is pending.</p>""",
        "body_text": "Results for {{ exam_name }} have been approved.",
    },
    "results_generated": {
        "subject": "Results Generated – {{ exam_name }}",
        "body_html": """<p>Results for <strong>{{ exam_name }}</strong> have been generated.</p>
<p>Total student results computed: {{ student_count }}</p>
<p>You can review them on the EduSphere portal.</p>""",
        "body_text": "Results generated for {{ exam_name }}. Student count: {{ student_count }}",
    },
    "grades_updated": {
        "subject": "Grade Boundaries Updated",
        "body_html": """<p>Grade boundaries have been updated by the administration.</p>
<p>This will affect result calculations going forward.</p>""",
        "body_text": "Grade boundaries have been updated.",
    },
    "rank_computed": {
        "subject": "Ranks Computed – {{ exam_name }}",
        "body_html": """<p>Merit, class, and subject ranks have been computed for <strong>{{ exam_name }}</strong>.</p>
<p>View the rankings on the EduSphere portal.</p>""",
        "body_text": "Ranks computed for {{ exam_name }}.",
    },

    # -----------------------------------------------------------------------
    # Answer Script Processing Templates
    # -----------------------------------------------------------------------
    "scripts_uploaded": {
        "subject": "Script Uploaded – {{ exam_name }}",
        "body_html": """<p>A new answer script has been uploaded for <strong>{{ student_name }}</strong>.</p>
<p>Exam: {{ exam_name }}<br>Subject: {{ subject_name }}</p>
<p><a href="{{ frontend_url }}/staff/upload-tasks" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Upload Task</a></p>""",
        "body_text": "Script uploaded for {{ student_name }} - {{ exam_name }} / {{ subject_name }}.",
    },
    "scripts_bulk_uploaded": {
        "subject": "Bulk Script Upload Complete – {{ batch_id }}",
        "body_html": """<p>A bulk upload has been completed.</p>
<p>Batch: {{ batch_id }}<br>Exam: {{ exam_name }}<br>Subject: {{ subject_name }}<br>Total Scripts: {{ script_count }}</p>
<p><a href="{{ frontend_url }}/staff/upload-tasks" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Batch</a></p>""",
        "body_text": "Bulk upload complete for batch {{ batch_id }} - {{ script_count }} scripts.",
    },
    "scripts_assigned": {
        "subject": "Scripts Assigned for Evaluation",
        "body_html": """<p>Dear {{ teacher_name }},</p>
<p><strong>{{ script_count }}</strong> answer script(s) have been assigned to you for evaluation.</p>
<p>Exam: {{ exam_name }}<br>Subject: {{ subject_name }}</p>
<p><a href="{{ frontend_url }}/teacher/exams" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Evaluation Queue</a></p>""",
        "body_text": "{{ script_count }} scripts assigned to you for {{ exam_name }} / {{ subject_name }}.",
    },
    "scripts_bulk_assigned": {
        "subject": "Bulk Script Assignment Complete",
        "body_html": """<p>Bulk script assignment has been completed.</p>
<p>A total of <strong>{{ script_count }}</strong> scripts have been assigned across multiple teachers for {{ exam_name }}.</p>""",
        "body_text": "Bulk assignment complete: {{ script_count }} scripts assigned for {{ exam_name }}.",
    },
    "evaluation_complete": {
        "subject": "Evaluation Complete – {{ student_name }}",
        "body_html": """<p>Evaluation for <strong>{{ student_name }}</strong> has been completed.</p>
<p>Exam: {{ exam_name }}<br>Subject: {{ subject_name }}<br>Marks: {{ marks_obtained }} / {{ total_marks }}</p>
<p>The result is now ready for review and approval.</p>""",
        "body_text": "Evaluation complete for {{ student_name }} - {{ exam_name }} / {{ subject_name }}: {{ marks_obtained }}/{{ total_marks }}.",
    },
    "reevaluation_requested": {
        "subject": "Re-evaluation Requested – {{ student_name }}",
        "body_html": """<p>A re-evaluation has been requested for <strong>{{ student_name }}</strong>.</p>
<p>Exam: {{ exam_name }}<br>Subject: {{ subject_name }}</p>
<p>Please review the script on the EduSphere portal.</p>
<p><a href="{{ frontend_url }}/teacher/exams" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Review Script</a></p>""",
        "body_text": "Re-evaluation requested for {{ student_name }} - {{ exam_name }} / {{ subject_name }}.",
    },
    "scripts_approved": {
        "subject": "Scripts Approved – {{ exam_name }}",
        "body_html": """<p>The evaluated scripts for <strong>{{ exam_name }}</strong> have been approved.</p>
<p>Subject: {{ subject_name }}<br>Total Approved: {{ approved_count }}</p>
<p>The results are now ready for publication.</p>""",
        "body_text": "{{ approved_count }} scripts approved for {{ exam_name }} / {{ subject_name }}.",
    },
    "batch_complete": {
        "subject": "Batch Processing Complete – {{ batch_id }}",
        "body_html": """<p>Batch <strong>{{ batch_id }}</strong> has been fully processed.</p>
<p>Exam: {{ exam_name }}<br>Subject: {{ subject_name }}<br>Passed: {{ passed_count }}<br>Failed: {{ failed_count }}<br>Flagged: {{ flagged_count }}</p>
<p><a href="{{ frontend_url }}/staff/upload-tasks" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Batch Details</a></p>""",
        "body_text": "Batch {{ batch_id }} complete: {{ passed_count }} passed, {{ failed_count }} failed.",
    },
    # -----------------------------------------------------------------------
    # Rechecking Templates
    # -----------------------------------------------------------------------
    "rechecking_requested": {
        "subject": "Rechecking Request Received – {{ exam_name }}",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>Your request for rechecking has been received.</p>
<p><strong>Exam:</strong> {{ exam_name }}<br>
<strong>Subject:</strong> {{ subject_name }}<br>
<strong>Current Marks:</strong> {{ marks_obtained }} / {{ total_marks }}</p>
<p>Your request is now pending administrative approval. You will be notified once it is processed.</p>
<p><a href="{{ frontend_url }}/student/results" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Requests</a></p>""",
        "body_text": "Rechecking request received for {{ exam_name }} - {{ subject_name }}. Pending approval.",
    },
    "rechecking_approved": {
        "subject": "Rechecking Request Approved – {{ exam_name }}",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>Your rechecking request has been <strong style="color:#16a34a;">approved</strong>.</p>
<p><strong>Exam:</strong> {{ exam_name }}<br>
<strong>Subject:</strong> {{ subject_name }}</p>
<p>The script is now being forwarded for blind re-evaluation. The result for this subject has been temporarily unlocked for revision.</p>
<p><a href="{{ frontend_url }}/student/results" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Track Status</a></p>""",
        "body_text": "Your rechecking request for {{ exam_name }} - {{ subject_name }} has been approved.",
    },
    "rechecking_rejected": {
        "subject": "Rechecking Request Update – {{ exam_name }}",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>Your rechecking request for <strong>{{ exam_name }}</strong> – <strong>{{ subject_name }}</strong> has been reviewed.</p>
<p style="color:#dc2626;">Status: <strong>Not Approved</strong></p>
<p><strong>Reason:</strong> {{ reason }}</p>
<p>If you have further questions, please contact the academic office.</p>
<p><a href="{{ frontend_url }}/student/results" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Details</a></p>""",
        "body_text": "Your rechecking request for {{ exam_name }} - {{ subject_name }} was not approved. Reason: {{ reason }}",
    },
    "rechecking_assigned": {
        "subject": "Rechecking Assignment – {{ exam_name }}",
        "body_html": """<p>Dear {{ teacher_name }},</p>
<p>A blind re-evaluation script has been assigned to you.</p>
<p><strong>Exam:</strong> {{ exam_name }}<br>
<strong>Subject:</strong> {{ subject_name }}<br>
<strong>Script ID:</strong> {{ script_id }}</p>
<p>Please log in to the EduSphere portal to evaluate the script. Remember that this is a blind re-evaluation — you should not have access to the student's identity or previous marks.</p>
<p><a href="{{ frontend_url }}/teacher/rechecking" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Evaluate Script</a></p>""",
        "body_text": "Blind re-evaluation script {{ script_id }} assigned for {{ exam_name }} - {{ subject_name }}.",
    },
    "rechecking_evaluation_complete": {
        "subject": "Re-evaluation Submitted – {{ script_id }}",
        "body_html": """<p>Dear {{ teacher_name }},</p>
<p>Your blind re-evaluation for script <strong>{{ script_id }}</strong> has been submitted successfully.</p>
<p><strong>Exam:</strong> {{ exam_name }}<br>
<strong>Subject:</strong> {{ subject_name }}<br>
<strong>Marks Assigned:</strong> {{ marks_obtained }} / {{ total_marks }}</p>
<p>Thank you for your evaluation.</p>""",
        "body_text": "Re-evaluation for script {{ script_id }} submitted: {{ marks_obtained }}/{{ total_marks }}.",
    },
    "rechecking_completed": {
        "subject": "Rechecking Complete – {{ exam_name }}",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>The rechecking process for your request has been completed.</p>
<p><strong>Exam:</strong> {{ exam_name }}<br>
<strong>Subject:</strong> {{ subject_name }}</p>
<p><strong>Original Marks:</strong> {{ marks_obtained_original }} / {{ total_marks_original }}<br>
<strong>Revised Marks:</strong> {{ marks_obtained_revised }} / {{ total_marks_revised }}</p>
{% if is_revised %}<p style="color:#16a34a;">Your result has been <strong>updated</strong>.</p>{% else %}<p>There was <strong>no change</strong> to your result after re-evaluation.</p>{% endif %}
<p><a href="{{ frontend_url }}/student/results" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Revised Result</a></p>""",
        "body_text": "Rechecking complete for {{ exam_name }} - {{ subject_name }}. Original: {{ marks_obtained_original }}/{{ total_marks_original }}, Revised: {{ marks_obtained_revised }}/{{ total_marks_revised }}.",
    },
    "rechecking_window_closing": {
        "subject": "Rechecking Window Closing Soon",
        "body_html": """<p>Dear {{ student_name }},</p>
<p>This is a reminder that the rechecking window for <strong>{{ exam_name }}</strong> will close in <strong>{{ days_remaining }} day(s)</strong>.</p>
<p>If you wish to request a rechecking, please submit your request before the deadline.</p>
<p><a href="{{ frontend_url }}/student/results" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Request Rechecking</a></p>""",
        "body_text": "Rechecking window for {{ exam_name }} closes in {{ days_remaining }} day(s). Submit your request soon.",
    },
    "rechecking_window_closed": {
        "subject": "Rechecking Window Closed – {{ exam_name }}",
        "body_html": """<p>The rechecking window for <strong>{{ exam_name }}</strong> has now closed.</p>
<p>All pending requests have been processed. No further rechecking requests can be submitted for this examination.</p>
<p>If you have active requests, their status will be updated shortly.</p>""",
        "body_text": "Rechecking window closed for {{ exam_name }}. No further requests accepted.",
    },

    "batch_failed": {
        "subject": "Batch Processing Failed – {{ batch_id }}",
        "body_html": """<p>Batch <strong>{{ batch_id }}</strong> has <strong style="color:#dc2626;">failed</strong> processing.</p>
<p>Exam: {{ exam_name }}<br>Subject: {{ subject_name }}<br>Error: {{ error_details }}</p>
<p>Please review and retry the batch.</p>
<p><a href="{{ frontend_url }}/staff/upload-tasks" style="display:inline-block;padding:10px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;">Review Batch</a></p>""",
        "body_text": "Batch {{ batch_id }} failed: {{ error_details }}",
    },
}


class Command(BaseCommand):
    help = "Seed default email templates and institution settings"

    def handle(self, *args, **options):
        for name, data in DEFAULT_TEMPLATES.items():
            EmailTemplate.objects.update_or_create(
                name=name,
                defaults={
                    "subject": data["subject"],
                    "body_html": data["body_html"],
                    "body_text": data["body_text"],
                },
            )
            self.stdout.write(f"  Created/updated template: {name}")

        settings, created = InstitutionSettings.objects.get_or_create(id=1)
        if created:
            self.stdout.write("  Created default institution settings")
        else:
            self.stdout.write("  Institution settings already exist")

        self.stdout.write(self.style.SUCCESS("Successfully seeded notification data"))