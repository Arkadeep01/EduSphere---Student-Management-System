from django.core.management.base import BaseCommand, CommandError
from authentication.models import CustomUser


class Command(BaseCommand):
    help = "Bootstrap the single Director account. Idempotent — errors if already exists."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Director email address")
        parser.add_argument("--password", required=True, help="Director password")
        parser.add_argument("--first-name", default="Director", help="First name")
        parser.add_argument("--last-name", default="", help="Last name")
        parser.add_argument("--mobile", default="", help="Mobile number")

    def handle(self, *args, **options):
        email = options["email"].strip().lower()

        if CustomUser.objects.filter(role="director").exists():
            existing = CustomUser.objects.get(role="director")
            raise CommandError(
                f"Director already exists: {existing.email}. "
                "Only one Director account is permitted."
            )

        if CustomUser.objects.filter(email=email).exists():
            raise CommandError(
                f"A user with email {email} already exists with a different role. "
                "Use a unique email for the Director."
            )

        user = CustomUser.objects.create_user(
            email=email,
            password=options["password"],
            username=email.split("@")[0],
            mobile=options["mobile"],
            first_name=options.get("first_name", "Director"),
            last_name=options.get("last_name", ""),
            role="director",
            is_staff=True,
            is_superuser=True,
            is_active=True,
            password_changed=True,
            needs_activation=False,
        )

        self.stdout.write(self.style.SUCCESS(f"Director account created: {user.email}"))