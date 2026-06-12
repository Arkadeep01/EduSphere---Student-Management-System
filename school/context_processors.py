# from django.conf import settings

# def unread_notifications(request):
#     if request.user.is_authenticated:
#         qs = request.user.notification_set.filter(is_read=False)
#         return {
#             "unread_notification_count": qs.count(),
#             "unread_notification": qs,
#         }
#     return {}
