from sqlalchemy import Column, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from models import Base


class CrawlLock(Base):
    __tablename__ = "crawl_lock"

    id = Column(Integer, primary_key=True, index=True)
    is_locked = Column(Boolean, default=False, nullable=False)
    locked_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<CrawlLock(id={self.id} is_locked={self.is_locked}, locked_at='{self.locked_at}')>"
