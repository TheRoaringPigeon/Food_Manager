from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.ingredient import Ingredient, IngredientTypeEnum
from schemas.ingredient import IngredientCreate, IngredientUpdate
from typing import List, Optional


class IngredientService:

  @staticmethod
  def create_ingredient(db: Session, ingredient: IngredientCreate) -> Ingredient:
    """Create a new ingredient"""
    db_ingredient = Ingredient(**ingredient.model_dump())
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

  @staticmethod
  def get_ingredient(db: Session, ingredient_id: int) -> Optional[Ingredient]:
    """Get an ingredient by ID"""
    return db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()

  @staticmethod
  def get_ingredients(
      db: Session,
      skip: int = 0,
      limit: int = 100,
      ingredient_type: Optional[IngredientTypeEnum] = None,
      is_available: Optional[bool] = None,
      search: Optional[str] = None
  ) -> List[Ingredient]:
    """Get all ingredients with optional filtering"""
    query = db.query(Ingredient)

    if ingredient_type:
      query = query.filter(Ingredient.ingredient_type == ingredient_type)

    if is_available is not None:
      query = query.filter(Ingredient.is_available == is_available)

    if search:
      search_term = f"%{search}%"
      query = query.filter(
          (Ingredient.name.ilike(search_term)) |
          (Ingredient.description.ilike(search_term)) |
          (Ingredient.tags.ilike(search_term))
      )

    return query.order_by(desc(Ingredient.created_at)).offset(skip).limit(limit).all()

  @staticmethod
  def update_ingredient(
      db: Session,
      ingredient_id: int,
      ingredient_update: IngredientUpdate
  ) -> Optional[Ingredient]:
    """Update an ingredient"""
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()

    if not db_ingredient:
      return None

    update_data = ingredient_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
      setattr(db_ingredient, field, value)

    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

  @staticmethod
  def delete_ingredient(db: Session, ingredient_id: int) -> bool:
    """Delete an ingredient"""
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()

    if not db_ingredient:
      return False

    db.delete(db_ingredient)
    db.commit()
    return True

  @staticmethod
  def toggle_availability(db: Session, ingredient_id: int) -> Optional[Ingredient]:
    """Toggle availability status of an ingredient"""
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()

    if not db_ingredient:
      return None

    db_ingredient.is_available = not db_ingredient.is_available
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient
