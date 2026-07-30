import os

from .settings import *  # noqa: F403

# Prevent EmailService from making real HTTP calls to Resend during tests
os.environ["RESEND_API_KEY"] = ""

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

DEFAULT_FILE_STORAGE = "django.core.files.storage.InMemoryStorage"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}

FILE_UPLOAD_HANDLERS = [
    "django.core.files.uploadhandler.MemoryFileUploadHandler",
]
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
MEDIA_ROOT = ""