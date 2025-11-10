from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.recipe import Recipe, RecipeTypeEnum
from schemas.recipe import RecipeCreate, RecipeUpdate
from typing import List, Optional
from datetime import datetime

class RecipeService:
    
    @staticmethod
    def create_recipe(db: Session, recipe: RecipeCreate) -> Recipe:
        """Create a new recipe"""
        db_recipe = Recipe(**recipe.model_dump())
        db.add(db_recipe)
        db.commit()
        db.refresh(db_recipe)
        return db_recipe
    
    @staticmethod
    def get_recipe(db: Session, recipe_id: int) -> Optional[Recipe]:
        """Get a recipe by ID"""
        return db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    @staticmethod
    def get_recipes(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        recipe_type: Optional[RecipeTypeEnum] = None,
        is_favorite: Optional[bool] = None,
        search: Optional[str] = None
    ) -> List[Recipe]:
        """Get all recipes with optional filtering"""
        query = db.query(Recipe)
        
        if recipe_type:
            query = query.filter(Recipe.recipe_type == recipe_type)
        
        if is_favorite is not None:
            query = query.filter(Recipe.is_favorite == is_favorite)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Recipe.name.ilike(search_term)) |
                (Recipe.description.ilike(search_term)) |
                (Recipe.tags.ilike(search_term))
            )
        
        return query.order_by(desc(Recipe.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_recipe(
        db: Session,
        recipe_id: int,
        recipe_update: RecipeUpdate
    ) -> Optional[Recipe]:
        """Update a recipe"""
        db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        
        if not db_recipe:
            return None
        
        update_data = recipe_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_recipe, field, value)
        
        db.commit()
        db.refresh(db_recipe)
        return db_recipe
    
    @staticmethod
    def delete_recipe(db: Session, recipe_id: int) -> bool:
        """Delete a recipe"""
        db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        
        if not db_recipe:
            return False
        
        db.delete(db_recipe)
        db.commit()
        return True
    
    @staticmethod
    def toggle_favorite(db: Session, recipe_id: int) -> Optional[Recipe]:
        """Toggle favorite status of a recipe"""
        db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        
        if not db_recipe:
            return None
        
        db_recipe.is_favorite = not db_recipe.is_favorite
        db.commit()
        db.refresh(db_recipe)
        return db_recipe
    
    @staticmethod
    def mark_as_cooked(db: Session, recipe_id: int) -> Optional[Recipe]:
        """Mark a recipe as cooked (update last_cooked timestamp)"""
        db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        
        if not db_recipe:
            return None
        
        db_recipe.last_cooked = datetime.utcnow()
        db.commit()
        db.refresh(db_recipe)
        return db_recipe
    
    @staticmethod
    def get_recently_cooked(db: Session, limit: int = 10) -> List[Recipe]:
        """Get recently cooked recipes"""
        return db.query(Recipe)\
            .filter(Recipe.last_cooked.isnot(None))\
            .order_by(desc(Recipe.last_cooked))\
            .limit(limit)\
            .all()