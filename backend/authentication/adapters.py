import logging

from allauth.account.adapter import DefaultAccountAdapter
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialAccount
from django.conf import settings
from django.shortcuts import redirect

logger = logging.getLogger(__name__)


class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        return settings.LOGIN_REDIRECT_URL


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def get_login_redirect_url(self, request):
        return settings.LOGIN_REDIRECT_URL

    def pre_social_login(self, request, sociallogin):
        provider = sociallogin.account.provider

        # GitHub: identity binding by provider user ID (not email)
        if provider == "github":
            return self._handle_github_login(request, sociallogin)

        # Google (or other providers): email-based lookup
        return self._handle_email_login(request, sociallogin)

    def _handle_github_login(self, request, sociallogin):
        from administration.models.audit_log import AuditLog
        from authentication.models import CustomUser

        provider_id = sociallogin.account.uid
        if not provider_id:
            logger.warning("GitHub OAuth: no provider ID received")
            redirect_to = f"{settings.FRONTEND_URL}/login?error=oauth_failed"
            raise ImmediateHttpResponse(redirect(redirect_to))

        github_login = sociallogin.account.extra_data.get("login", "")

        # GitHub connect flow — user is binding a new GitHub account to their profile
        connect_user_id = request.session.pop("github_connect_user_id", None)
        if connect_user_id:
            try:
                user = CustomUser.objects.get(id=connect_user_id, is_active=True)
            except CustomUser.DoesNotExist:
                logger.warning("GitHub connect: user %s not found or inactive", connect_user_id)
                redirect_to = f"{settings.FRONTEND_URL}/login?error=oauth_failed"
                raise ImmediateHttpResponse(redirect(redirect_to))

            sociallogin.user = user

            # Handle Change: if a different GitHub account was previously bound,
            # remove the old binding first (one GitHub ID → one EduSphere account).
            existing = SocialAccount.objects.filter(user=user, provider="github").first()
            if existing:
                if existing.uid == provider_id:
                    # Same GitHub account — no change needed, still audit
                    if github_login:
                        if user.role == "student":
                            from student.models import StudentProfile
                            StudentProfile.objects.filter(user=user).update(github_username=github_login)
                        elif user.role == "teacher":
                            from teacher.models import TeacherProfile
                            TeacherProfile.objects.filter(user=user).update(github_username=github_login)
                    AuditLog.objects.create(
                        user=user,
                        action="github_linked",
                        model_name="SocialAccount",
                        description=f"GitHub account {github_login} ({provider_id}) re-confirmed for {user.email}",
                    )
                    return
                # Different GitHub account — replace binding
                old_uid = existing.uid
                existing.uid = provider_id
                existing.extra_data = sociallogin.account.extra_data
                existing.save()
                AuditLog.objects.create(
                    user=user,
                    action="github_linked",
                    model_name="SocialAccount",
                    description=f"GitHub account changed from {old_uid} to {provider_id} ({github_login}) for {user.email}",
                )
            else:
                SocialAccount.objects.create(
                    user=user,
                    provider="github",
                    uid=provider_id,
                )

                AuditLog.objects.create(
                    user=user,
                    action="github_linked",
                    model_name="SocialAccount",
                    description=f"GitHub account {github_login} ({provider_id}) linked to {user.email}",
                )

            if github_login:
                if user.role == "student":
                    from student.models import StudentProfile
                    StudentProfile.objects.filter(user=user).update(github_username=github_login)
                elif user.role == "teacher":
                    from teacher.models import TeacherProfile
                    TeacherProfile.objects.filter(user=user).update(github_username=github_login)

            logger.info("GitHub account %s linked to %s", github_login, user.email)
            return

        requested_role = request.session.get("oauth_role", "student")

        # Look up by SocialAccount provider uid (the bind must exist already)
        try:
            existing = SocialAccount.objects.get(
                provider="github",
                uid=provider_id,
            )
            user = existing.user
        except SocialAccount.DoesNotExist:
            AuditLog.objects.create(
                user=None,
                action="github_login_failed_unbound",
                model_name="SocialAccount",
                description=f"GitHub login attempt with unbound provider ID {provider_id} ({github_login})",
            )
            logger.warning("GitHub OAuth denied: provider ID %s is not bound to any EduSphere account", provider_id)
            if requested_role == "student":
                redirect_to = f"{settings.FRONTEND_URL}/login?error=github_not_bound"
            else:
                redirect_to = f"{settings.FRONTEND_URL}/login/faculty?error=github_not_bound"
            raise ImmediateHttpResponse(redirect(redirect_to))

        if not user.is_active:
            logger.warning("GitHub OAuth denied: account %s is inactive", user.email)
            if requested_role == "student":
                redirect_to = f"{settings.FRONTEND_URL}/login?error=account_inactive"
            else:
                redirect_to = f"{settings.FRONTEND_URL}/login/faculty?error=account_inactive"
            raise ImmediateHttpResponse(redirect(redirect_to))

        if user.role != requested_role:
            logger.warning("GitHub OAuth denied: role mismatch %s (req=%s actual=%s)", user.email, requested_role, user.role)
            role_label = dict(CustomUser.ROLE_CHOICES).get(user.role, user.role)
            if requested_role == "student":
                redirect_to = f"{settings.FRONTEND_URL}/login?error=role_mismatch&actual_role={user.role}&label={role_label}"
            else:
                redirect_to = f"{settings.FRONTEND_URL}/login/faculty?error=role_mismatch&actual_role={user.role}&label={role_label}"
            raise ImmediateHttpResponse(redirect(redirect_to))

        sociallogin.user = user

        # Sync github_username on profile if not set
        if github_login:
            if user.role == "student":
                from student.models import StudentProfile
                StudentProfile.objects.filter(user=user, github_username="").update(github_username=github_login)
            elif user.role == "teacher":
                from teacher.models import TeacherProfile
                TeacherProfile.objects.filter(user=user, github_username="").update(github_username=github_login)

    def _handle_email_login(self, request, sociallogin):
        email = sociallogin.user.email
        if not email:
            return

        requested_role = request.session.get("oauth_role", "student")

        from authentication.models import CustomUser

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            logger.warning("OAuth denied: no account for %s", email)
            if requested_role == "student":
                redirect_to = f"{settings.FRONTEND_URL}/login?error=account_not_found"
            else:
                redirect_to = f"{settings.FRONTEND_URL}/login/faculty?error=account_not_found"
            raise ImmediateHttpResponse(redirect(redirect_to))

        if not user.password_changed:
            logger.warning("OAuth denied: %s has not completed first-login activation", email)
            if requested_role == "student":
                redirect_to = f"{settings.FRONTEND_URL}/login?error=activation_required"
            else:
                redirect_to = f"{settings.FRONTEND_URL}/login/faculty?error=activation_required"
            raise ImmediateHttpResponse(redirect(redirect_to))

        if user.role != requested_role:
            logger.warning("OAuth denied: role mismatch %s (req=%s actual=%s)", email, requested_role, user.role)
            role_label = dict(CustomUser.ROLE_CHOICES).get(user.role, user.role)
            if requested_role == "student":
                redirect_to = f"{settings.FRONTEND_URL}/login?error=role_mismatch&actual_role={user.role}&label={role_label}"
            else:
                redirect_to = f"{settings.FRONTEND_URL}/login/faculty?error=role_mismatch&actual_role={user.role}&label={role_label}"
            raise ImmediateHttpResponse(redirect(redirect_to))

        sociallogin.user = user

        SocialAccount.objects.get_or_create(
            user=user,
            provider=sociallogin.account.provider,
            defaults={"uid": sociallogin.account.uid},
        )

    def populate_user(self, request, sociallogin, data):
        return super().populate_user(request, sociallogin, data)

    def save_user(self, request, sociallogin, form=None):
        logger.warning("OAuth save_user called unexpectedly for %s", sociallogin.user.email)
        request.session["oauth_new_user"] = False
        request.session.modified = True
        return sociallogin.user

    def on_authentication_error(self, request, provider, error=None, exception=None, extra_context=None):
        logger.error("OAuth authentication error: provider=%s error=%s exception=%s", provider, error, exception)
        requested_role = request.session.get("oauth_role", "student")
        if requested_role == "student":
            redirect_to = f"{settings.FRONTEND_URL}/login?error=oauth_failed"
        else:
            redirect_to = f"{settings.FRONTEND_URL}/login/faculty?error=oauth_failed"
        raise ImmediateHttpResponse(redirect(redirect_to))
