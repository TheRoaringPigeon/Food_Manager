import re

MIN_LENGTH = 8
MAX_AGE_DAYS = 90
HISTORY_LIMIT = 5

_RULES = [
    (r"[A-Z]", "at least one uppercase letter"),
    (r"[a-z]", "at least one lowercase letter"),
    (r"[0-9]", "at least one number"),
    (r"[^A-Za-z0-9]", "at least one special character"),
]


def validate_password_strength(password: str) -> None:
    errors = []
    if len(password) < MIN_LENGTH:
        errors.append(f"at least {MIN_LENGTH} characters")
    for pattern, message in _RULES:
        if not re.search(pattern, password):
            errors.append(message)
    if errors:
        raise ValueError(f"Password must contain {', '.join(errors)}")
