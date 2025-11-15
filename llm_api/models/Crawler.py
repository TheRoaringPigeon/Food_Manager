from sqlalchemy import Column, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base
from datetime import datetime
from typing import Optional
from enum import Enum

class CrawlLock(Base):
  __tablename__ = "crawl_lock"

  id = Column(Integer, primary_key=True, index=True)
  is_locked = Column(Boolean, default=False, nullable=False)
  locked_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

  def __repr__(self):
    return f"<CrawlLock(id={self.id} is_locked={self.is_locked}, locked_at='{self.locked_at}')>"

class CrawlStatus(str, Enum):
  IDLE = "idle"
  RUNNING = "running"
  COMPLETED = "completed"
  FAILED = "failed"


class CrawlerState:
  def __init__(self):
    self.status: CrawlStatus = CrawlStatus.IDLE
    self.start_time: Optional[datetime] = None
    self.end_time: Optional[datetime] = None
    self.total_urls: int = 0
    self.processed_urls: int = 0
    self.success_count: int = 0
    self.fail_count: int = 0
    self.error_message: Optional[str] = None
