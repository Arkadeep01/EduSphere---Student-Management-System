from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


ALLOWED_ASSIGNMENT_EXTENSIONS = [".pdf", ".ppt", ".pptx"]
ASSIGNMENT_MAX_SIZE_MB = 10
ASSIGNMENT_MAX_SIZE_BYTES = ASSIGNMENT_MAX_SIZE_MB * 1024 * 1024


@deconstructible
class FileExtensionValidator:
    extensions: list[str]

    def __init__(self, extensions: list[str]) -> None:
        self.extensions = [ext.lower() if ext.startswith(".") else f".{ext.lower()}" for ext in extensions]

    def __call__(self, value) -> None:
        import os
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in self.extensions:
            raise ValidationError(
                f"Unsupported file extension '{ext}'. Allowed: {', '.join(self.extensions)}"
            )

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, FileExtensionValidator):
            return NotImplemented
        return self.extensions == other.extensions


@deconstructible
class FileSizeValidator:
    max_size_bytes: int

    def __init__(self, max_size_bytes: int) -> None:
        self.max_size_bytes = max_size_bytes

    def __call__(self, value) -> None:
        if value.size > self.max_size_bytes:
            raise ValidationError(
                f"File size exceeds {self.max_size_bytes // (1024 * 1024)} MB limit."
            )

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, FileSizeValidator):
            return NotImplemented
        return self.max_size_bytes == other.max_size_bytes


validate_assignment_file_extension = FileExtensionValidator(ALLOWED_ASSIGNMENT_EXTENSIONS)
validate_assignment_file_size = FileSizeValidator(ASSIGNMENT_MAX_SIZE_BYTES)
