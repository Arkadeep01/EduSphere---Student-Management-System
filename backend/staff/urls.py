from django.urls import path
from . import views
from . import processing_views

urlpatterns = [
    path("dashboard/", views.StaffDashboardView.as_view(), name="staff-dashboard"),
    path("upload-tasks/", views.StaffUploadTasksView.as_view(), name="staff-upload-tasks"),
    path("upload/", views.StaffUploadView.as_view(), name="staff-upload"),
    path("upload/<int:pk>/", views.StaffUploadDetailView.as_view(), name="staff-upload-detail"),
    path("history/", views.StaffUploadHistoryView.as_view(), name="staff-history"),
    path("rejected/", views.StaffRejectedUploadsView.as_view(), name="staff-rejected"),
    path("profile/", views.StaffProfileView.as_view(), name="staff-profile"),
    path("processing/init/<int:script_id>/", processing_views.ScriptProcessingInitView.as_view(), name="processing-init"),
    path("processing/<int:script_id>/", processing_views.ScriptProcessingDetailView.as_view(), name="processing-detail"),
    path("processing/<int:script_id>/page-count/", processing_views.ScriptProcessingPageCountView.as_view(), name="processing-page-count"),
    path("processing/<int:script_id>/expected-pages/", processing_views.ScriptProcessingExpectedPagesView.as_view(), name="processing-expected-pages"),
    path("processing/<int:script_id>/metadata/", processing_views.ScriptProcessingMetadataView.as_view(), name="processing-metadata"),
    path("processing/<int:script_id>/match-student/", processing_views.ScriptProcessingMatchView.as_view(), name="processing-match"),
    path("processing/<int:script_id>/verify-roll/", processing_views.ScriptProcessingRollVerifyView.as_view(), name="processing-verify-roll"),
    path("processing/<int:script_id>/duplicate-pages/", processing_views.ScriptProcessingDuplicatePagesView.as_view(), name="processing-duplicate-pages"),
    path("processing/<int:script_id>/finalize/", processing_views.ScriptProcessingFinalizeView.as_view(), name="processing-finalize"),
    path("processing/<int:script_id>/flag/", processing_views.ScriptProcessingFlagView.as_view(), name="processing-flag"),
    path("processing/<int:script_id>/fail/", processing_views.ScriptProcessingFailView.as_view(), name="processing-fail"),
    path("processing/<int:script_id>/pipeline/", processing_views.ScriptProcessingPipelineView.as_view(), name="processing-pipeline"),
    path("processing/list/", processing_views.ScriptProcessingListView.as_view(), name="processing-list"),
    path("processing/stats/", processing_views.ScriptProcessingStatsView.as_view(), name="processing-stats"),
    path("batch-processing/init/", processing_views.BatchProcessingInitView.as_view(), name="batch-processing-init"),
    path("batch-processing/<str:batch_id>/", processing_views.BatchProcessingDetailView.as_view(), name="batch-processing-detail"),
    path("batch-processing/<str:batch_id>/finalize/", processing_views.BatchProcessingFinalizeView.as_view(), name="batch-processing-finalize"),
    path("batch-processing/list/", processing_views.BatchProcessingListView.as_view(), name="batch-processing-list"),
]
