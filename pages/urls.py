# from django.urls import path
# from django.views.generic import TemplateView

# urlpatterns = [
#     # Profile & Inbox
#     path('profile/', TemplateView.as_view(template_name='pages/profile.html'), name='profile'),
#     path('inbox/', TemplateView.as_view(template_name='pages/inbox.html'), name='inbox'),

#     # Students
#     path('student-details/', TemplateView.as_view(template_name='pages/student-details.html'), name='student-details'),
#     path('edit-student/', TemplateView.as_view(template_name='pages/edit-student.html'), name='edit-student'),

#     # Teachers
#     path('teachers/', TemplateView.as_view(template_name='teachers/teachers.html'), name='teachers'),
#     path('teacher-details/', TemplateView.as_view(template_name='teachers/teacher-details.html'), name='teacher-details'),
#     path('add-teacher/', TemplateView.as_view(template_name='teachers/add-teacher.html'), name='add-teacher'),
#     path('edit-teacher/', TemplateView.as_view(template_name='teachers/edit-teacher.html'), name='edit-teacher'),

#     # Departments
#     path('departments/', TemplateView.as_view(template_name='pages/departments.html'), name='departments'),
#     path('add-department/', TemplateView.as_view(template_name='pages/add-department.html'), name='add-department'),
#     path('edit-department/', TemplateView.as_view(template_name='pages/edit-department.html'), name='edit-department'),

#     # Subjects
#     path('subjects/', TemplateView.as_view(template_name='pages/subjects.html'), name='subjects'),
#     path('add-subject/', TemplateView.as_view(template_name='pages/add-subject.html'), name='add-subject'),
#     path('edit-subject/', TemplateView.as_view(template_name='pages/edit-subject.html'), name='edit-subject'),

#     # Accounts / Finance
#     path('fees-collections/', TemplateView.as_view(template_name='pages/fees-collections.html'), name='fees-collections'),
#     path('expenses/', TemplateView.as_view(template_name='pages/expenses.html'), name='expenses'),
#     path('salary/', TemplateView.as_view(template_name='pages/salary.html'), name='salary'),
#     path('add-fees-collection/', TemplateView.as_view(template_name='pages/add-fees-collection.html'), name='add-fees-collection'),
#     path('add-expenses/', TemplateView.as_view(template_name='pages/add-expenses.html'), name='add-expenses'),
#     path('add-salary/', TemplateView.as_view(template_name='pages/add-salary.html'), name='add-salary'),

#     # Management
#     path('holiday/', TemplateView.as_view(template_name='pages/holiday.html'), name='holiday'),
#     path('fees/', TemplateView.as_view(template_name='pages/fees.html'), name='fees'),
#     path('exam/', TemplateView.as_view(template_name='pages/exam.html'), name='exam'),
#     path('event/', TemplateView.as_view(template_name='pages/event.html'), name='event'),
#     path('time-table/', TemplateView.as_view(template_name='pages/time-table.html'), name='time-table'),
#     path('library/', TemplateView.as_view(template_name='pages/library.html'), name='library'),

#     # Pages
#     path('blank-page/', TemplateView.as_view(template_name='pages/blank-page.html'), name='blank-page'),
#     path('error-404/', TemplateView.as_view(template_name='pages/error-404.html'), name='error-404'),

#     # Others
#     path('sports/', TemplateView.as_view(template_name='pages/sports.html'), name='sports'),
#     path('hostel/', TemplateView.as_view(template_name='pages/hostel.html'), name='hostel'),
#     path('transport/', TemplateView.as_view(template_name='pages/transport.html'), name='transport'),
# ]
