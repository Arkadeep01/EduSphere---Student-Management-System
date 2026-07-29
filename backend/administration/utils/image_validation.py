import io
import os

from django.conf import settings
from django.core.exceptions import ValidationError
from PIL import Image

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}

MAX_IMAGE_SIZE_BYTES = getattr(settings, "MAX_IMAGE_UPLOAD_SIZE", 5 * 1024 * 1024)


def validate_uploaded_image(uploaded_file, field_name="image"):
    errors = []

    if not uploaded_file:
        errors.append("No file provided.")
        return errors

    if uploaded_file.size > MAX_IMAGE_SIZE_BYTES:
        max_mb = MAX_IMAGE_SIZE_BYTES // (1024 * 1024)
        errors.append(f"File exceeds maximum size of {max_mb} MB.")

    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        errors.append(f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}.")

    mime = uploaded_file.content_type or ""
    if mime not in ALLOWED_MIME_TYPES:
        errors.append(f"Unsupported MIME type '{mime}'. Allowed: {', '.join(sorted(ALLOWED_MIME_TYPES))}.")

    try:
        uploaded_file.seek(0)
        data = uploaded_file.read(MAX_IMAGE_SIZE_BYTES + 1)
        uploaded_file.seek(0)
        img = Image.open(io.BytesIO(data))
        img.verify()
        img_format = img.format
        if img_format and img_format.upper() not in {fmt.upper() for fmt in
                                                       ["JPEG", "PNG", "WEBP", "AVIF", "GIF", "JPEG2000"]}:
            errors.append(f"Decoded image format '{img_format}' is not allowed.")
    except (IOError, SyntaxError, ValueError, Exception) as e:
        errors.append(f"File is corrupt or not a valid image: {e}")

    return errors


def validate_and_get_errors(uploaded_file, field_name="image"):
    errs = validate_uploaded_image(uploaded_file, field_name)
    if errs:
        return errs
    return None