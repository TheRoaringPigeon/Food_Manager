
from pydantic import BaseModel
from typing import Optional

class StatusResponse(BaseModel):
  status: str
  start_time: Optional[str] = None
  end_time: Optional[str] = None
  total_urls: int = 0
  processed_urls: int = 0
  success_count: int = 0
  fail_count: int = 0
  error_message: Optional[str] = None
  duration_seconds: Optional[float] = None
  is_locked: bool = False