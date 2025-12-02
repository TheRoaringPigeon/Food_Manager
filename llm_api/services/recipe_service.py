from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models.Recipe import Recipe
from schemas.Recipe import RecipeCreate
from typing import List, Optional
from integrations.chromadb import ChromaRepository


class RecipeService:
  repo = ChromaRepository()

  @staticmethod
  async def create_recipe(db: AsyncSession, recipe: RecipeCreate) -> Recipe:
    """Create a new recipe"""
    db_recipe = Recipe(**recipe.model_dump())
    db.add(db_recipe)
    await db.commit()
    await db.refresh(db_recipe)
    return db_recipe

  @staticmethod
  async def get_recipe(db: AsyncSession, recipe_id: int) -> Optional[Recipe]:
    """Get a recipe by ID"""
    result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
    return result.scalar_one_or_none()

  @staticmethod
  async def get_recipes(
      db: AsyncSession,
      skip: int = 0,
      limit: int = 100,
  ) -> List[Recipe]:
    """Get all recipes with optional filtering"""
    query = select(Recipe)
    query = query.order_by(desc(Recipe.url)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

  @staticmethod
  async def delete_recipe(db: AsyncSession, recipe_id: int) -> bool:
    """Delete a recipe"""
    result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()
    if not db_recipe:
      return False

    await db.delete(db_recipe)
    await db.commit()
    return True

  @staticmethod
  async def query_recipes(query: str, n_results: int = 5):
    """
    Query ChromaDB for recipes based on text search.
    """
    try:
      results = RecipeService.repo.query(
          text=query,
          n_results=n_results
      )
    except Exception as e:
      print(f"Problem: {e}")

    # Chroma returns: { ids: [[]], documents: [[]], metadatas: [[]], ... }
    # Flatten & format it for API response
    formatted = []
    for i in range(len(results.get("ids", [[]])[0])):
      formatted.append({
          "id": results["ids"][0][i],
          "document": results["documents"][0][i],
          "metadata": results["metadatas"][0][i],
          "distance": (
              results["distances"][0][i]
              if "distances" in results and results["distances"] else None
          )
      })

    return formatted
