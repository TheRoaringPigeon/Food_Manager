from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class FamilyRecipeStatus(Base):
    __tablename__ = "family_recipe_statuses"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id", ondelete="CASCADE"), nullable=False, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_favorite = Column(Boolean, default=False, nullable=False)
    last_cooked = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    family = relationship("Family", back_populates="recipe_statuses")
    recipe = relationship("Recipe", back_populates="family_statuses")
    user = relationship("User", back_populates="recipe_statuses")

    __table_args__ = (
        UniqueConstraint("family_id", "recipe_id", name="uq_family_recipe"),
    )

    def __repr__(self):
        return f"<FamilyRecipeStatus(family_id={self.family_id}, recipe_id={self.recipe_id}, is_favorite={self.is_favorite})>"
