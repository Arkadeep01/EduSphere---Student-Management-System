import os
import logging
import requests
from django.template import Engine, Context
from django.conf import settings
from ..models import EmailTemplate, InstitutionSettings, DeliveryLog, Notification, NotificationRecipient

logger = logging.getLogger(__name__)


class EmailService:
    RESEND_API_URL = "https://api.resend.com/emails"

    @classmethod
    def _get_resend_api_key(cls):
        return os.getenv("RESEND_API_KEY", "")

    @classmethod
    def _get_from_email(cls):
        return os.getenv("EMAIL_FROM", "noreply@resend.com")

    @classmethod
    def _get_from_name(cls):
        return os.getenv("EMAIL_FROM_NAME", "EduSphere")

    @classmethod
    def render_template(cls, template_name: str, context: dict) -> dict:
        try:
            tmpl = EmailTemplate.objects.get(name=template_name, is_active=True)
        except EmailTemplate.DoesNotExist:
            logger.warning(f"Email template '{template_name}' not found, using fallback")
            return {"subject": context.get("subject", ""), "html": context.get("message", ""), "text": context.get("message", "")}

        engine = Engine.get_default()
        subject_template = engine.from_string(tmpl.subject)
        html_template = engine.from_string(tmpl.body_html)

        enriched = cls._enrich_context(context)

        subject = subject_template.render(Context(enriched))
        html = html_template.render(Context(enriched))

        text = tmpl.body_text
        if text:
            text_template = engine.from_string(text)
            text = text_template.render(Context(enriched))

        return {"subject": subject, "html": html, "text": text}

    @classmethod
    def _enrich_context(cls, context: dict) -> dict:
        inst = InstitutionSettings.get_settings()
        enriched = {
            "institution_name": inst.institution_name,
            "institution_address": inst.address,
            "institution_phone": inst.phone,
            "institution_email": inst.email,
            "institution_website": inst.website,
            "principal_name": inst.principal_name,
            "email_footer": inst.email_footer,
            "facebook": inst.facebook,
            "twitter": inst.twitter,
            "instagram": inst.instagram,
            "linkedin": inst.linkedin,
            "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:5173"),
            "current_year": "2026",
        }
        if inst.logo:
            enriched["institution_logo"] = inst.logo.url
        enriched.update(context)
        return enriched

    @classmethod
    def send_email(cls, to_email: str, subject: str, html: str, text: str = "",
                   notification: Notification = None, recipient: NotificationRecipient = None) -> bool:
        api_key = cls._get_resend_api_key()
        if not api_key:
            logger.warning("RESEND_API_KEY not configured, logging email instead")
            logger.info(f"EMAIL TO: {to_email} | SUBJECT: {subject}")
            return True

        payload = {
            "from": f"{cls._get_from_name()} <{cls._get_from_email()}>",
            "to": [to_email],
            "subject": subject,
            "html": html,
        }
        if text:
            payload["text"] = text

        try:
            resp = requests.post(
                cls.RESEND_API_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                timeout=15,
            )
            if resp.status_code in (200, 201):
                if notification and recipient:
                    DeliveryLog.objects.create(
                        notification=notification,
                        recipient=recipient,
                        channel="email",
                        status="delivered",
                    )
                logger.info(f"Email sent to {to_email}: {subject}")
                return True
            else:
                error = resp.text
                logger.error(f"Resend API error for {to_email}: {resp.status_code} - {error}")
                if notification and recipient:
                    DeliveryLog.objects.create(
                        notification=notification,
                        recipient=recipient,
                        channel="email",
                        status="failed",
                        error_message=error[:500],
                    )
                return False
        except requests.RequestException as e:
            logger.error(f"Email send request failed for {to_email}: {str(e)}")
            if notification and recipient:
                DeliveryLog.objects.create(
                    notification=notification,
                    recipient=recipient,
                    channel="email",
                    status="failed",
                    error_message=str(e)[:500],
                )
            return False

    @classmethod
    def send_templated_email(cls, to_email: str, template_name: str, context: dict,
                             notification: Notification = None, recipient: NotificationRecipient = None) -> bool:
        rendered = cls.render_template(template_name, context)
        return cls.send_email(
            to_email=to_email,
            subject=rendered["subject"],
            html=rendered["html"],
            text=rendered.get("text", ""),
            notification=notification,
            recipient=recipient,
        )