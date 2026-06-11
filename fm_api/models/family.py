from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class Family(Base):
    __tablename__ = "families"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    users = relationship("User", back_populates="family")
    recipe_statuses = relationship("FamilyRecipeStatus", back_populates="family", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Family(id={self.id}, name='{self.name}')>"
