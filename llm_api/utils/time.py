import re


def iso8601_to_minutes(duration: str | None) -> int | None:
  """Convert ISO 8601 duration (PT1H30M) to total minutes as an integer."""
  if not duration or not duration.startswith("P"):
    return None
  time_part = duration[1:]
  hours = minutes = 0
  if "T" in time_part:
    _, time_part = time_part.split("T")
  hours_match = re.search(r"(\d+)H", time_part)
  minutes_match = re.search(r"(\d+)M", time_part)
  if hours_match:
    hours = int(hours_match.group(1))
  if minutes_match:
    minutes = int(minutes_match.group(1))
  total = hours * 60 + minutes
  return total if total > 0 else None


def iso8601_to_text(duration):
  """Convert ISO 8601 duration (PT1H30M) to human-readable string."""
  if not duration or not duration.startswith("P"):
    return duration
  time_part = duration[1:]
  hours = minutes = seconds = 0
  if "T" in time_part:
    _, time_part = time_part.split("T")
  hours_match = re.search(r"(\d+)H", time_part)
  minutes_match = re.search(r"(\d+)M", time_part)
  seconds_match = re.search(r"(\d+)S", time_part)
  if hours_match:
    hours = int(hours_match.group(1))
  if minutes_match:
    minutes = int(minutes_match.group(1))
  if seconds_match:
    seconds = int(seconds_match.group(1))
  parts = []
  if hours > 0:
    parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
  if minutes > 0:
    parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
  if seconds > 0:
    parts.append(f"{seconds} second{'s' if seconds != 1 else ''}")
  return " ".join(parts) if parts else "0 minutes"
