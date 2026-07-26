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
