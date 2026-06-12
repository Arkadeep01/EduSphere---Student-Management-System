# from django.contrib import admin
# from django.urls import path,include
# from django.views.generic import RedirectView
# from . import views

# urlpatterns = [
#     path('',views.index, name="index"),
#     path('dashboard/', views.dashboard, name='dashboard'), 
#     path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
#     path('teacher/dashboard/', views.teacher_dashboard, name='teacher_dashboard'),
#     path('notification/mark-as-read/', views.mark_notification_as_read, name='mark_notification_as_read' ),
#     # path('notification/clear-all', views.clear_all_notification, name= "clear_all_notification")

#     # Legacy .html extension redirects (root level and under /dashboard/)
#     path('student-dashboard.html', RedirectView.as_view(pattern_name='dashboard', permanent=True), name='student-dashboard-redirect'),
#     path('dashboard/student-dashboard.html', RedirectView.as_view(pattern_name='dashboard', permanent=True)),
#     path('student-details.html', RedirectView.as_view(url='/students/', permanent=True), name='student-details-redirect'),
#     path('dashboard/student-details.html', RedirectView.as_view(url='/students/', permanent=True)),
#     path('edit-student.html', RedirectView.as_view(url='/students/', permanent=True), name='edit-student-redirect'),
#     path('dashboard/edit-student.html', RedirectView.as_view(url='/students/', permanent=True)),
#     path('index.html', RedirectView.as_view(pattern_name='admin_dashboard', permanent=True), name='index-redirect'),
#     path('dashboard/index.html', RedirectView.as_view(pattern_name='admin_dashboard', permanent=True)),
#     path('teacher-dashboard.html', RedirectView.as_view(pattern_name='teacher_dashboard', permanent=True), name='teacher-dashboard-redirect'),
#     path('dashboard/teacher-dashboard.html', RedirectView.as_view(pattern_name='teacher_dashboard', permanent=True)),
#     path('departments.html', RedirectView.as_view(url='/pages/departments/', permanent=True), name='departments-redirect'),
#     path('dashboard/departments.html', RedirectView.as_view(url='/pages/departments/', permanent=True)),
# ]
