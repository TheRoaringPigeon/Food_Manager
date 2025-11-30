"""HTML utility functions."""
import html


def html_unescape_recursive(obj):
  """Recursively unescape HTML entities in strings within nested data structures."""
  if isinstance(obj, dict):
    return {k: html_unescape_recursive(v) for k, v in obj.items()}
  elif isinstance(obj, list):
    return [html_unescape_recursive(i) for i in obj]
  elif isinstance(obj, str):
    return html.unescape(obj)
  else:
    return obj
