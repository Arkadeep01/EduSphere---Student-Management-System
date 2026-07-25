from django.core.management.base import BaseCommand
from notification.services.notification_service import ExpiryManager


class Command(BaseCommand):
    help = "Process expired notifications and clean up old ones"

    def handle(self, *args, **options):
        expired = ExpiryManager.process_expired()
        self.stdout.write(f"Expired {expired} notifications")
        cleaned = ExpiryManager.cleanup_expired()
        self.stdout.write(f"Cleaned up {cleaned} old expired notifications")