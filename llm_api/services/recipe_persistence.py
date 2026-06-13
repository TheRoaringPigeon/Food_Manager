"""Service for persisting recipe data to database and ChromaDB."""
import asyncio
from typing import List
from urllib.parse import urlparse, urlunparse
from database import AsyncSessionLocal
from integrations.chromadb import ChromaRepository
from integrations.fm_api import FMApiClientAsync
from integrations.llm import OllamaLLM
from schemas.Recipe import RecipeCreate
from services.recipe_service import RecipeService
from utils.html_utils import html_unescape_recursive
from utils.logger import get_logger

logger = get_logger(__name__)


class RecipePersistence:
  """Handles saving recipe data to database and vector store."""

  def __init__(
          self,
          fm_api_client: FMApiClientAsync = None,
          chroma_repo: ChromaRepository = None,
          llm_client: OllamaLLM = None
  ):
    """
    Initialize the persistence service.

    Args:
        fm_api_client: FM API client for creating recipes (optional, creates default)
        chroma_repo: ChromaDB repository (optional, creates default)
    """
    self.fm_api_client = fm_api_client or FMApiClientAsync()
    self.chroma = chroma_repo or ChromaRepository()
    self.llm_client = llm_client or OllamaLLM()

  async def prepare_semantic_data(self, recipe_data: dict) -> tuple[str, dict]:
    text, pre_processed_metadata = await asyncio.gather(
        self.llm_client.build_document(recipe=recipe_data),
        self.llm_client.build_metadata(recipe=recipe_data)
    )
    processed_metadata = self.chroma.process_json_for_vector_db(pre_processed_metadata)
    return (text, processed_metadata)

  async def save_recipe(self, result: dict):
    """Save recipe to FM API, ChromaDB, and local database."""
    recipe_data = html_unescape_recursive(result)

    # 1. Parse ingredients asynchronously alongside LLM metadata compilation
    raw_ingredients = recipe_data.get("recipeIngredient", [])

    text, pre_processed_metadata, structured_ingredients = await asyncio.gather(
        self.llm_client.build_document(recipe=recipe_data),
        self.llm_client.build_metadata(recipe=recipe_data),
        self.llm_client.parse_ingredients(raw_ingredients)
    )

    # 2. Inject the newly structured ingredients into the payload sent to FM API
    recipe_data["recipeIngredient"] = structured_ingredients

    processed_metadata = self.chroma.process_json_for_vector_db(pre_processed_metadata)

    # 3. Track URL first — prevents re-processing this URL if downstream saves fail
    async with AsyncSessionLocal() as db:
      save_url_response = await RecipeService.create_recipe(
          db=db,
          recipe=RecipeCreate(url=result.get("url"))
      )
      logger.debug(f"Saved URL to database: {save_url_response}")

    # 4. Save to fm_api then ChromaDB; roll back both if ChromaDB fails
    response = await self.fm_api_client.create_recipe(recipe_data)
    fm_recipe_id = response.get("id")
    try:
      await self.chroma.add(
          ids=[str(fm_recipe_id)],
          documents=[text],
          metadatas=[processed_metadata],
      )
    except Exception as chroma_error:
      logger.error(f"ChromaDB add failed for recipe_id={fm_recipe_id}, rolling back: {chroma_error}")
      fm_api_rolled_back = False
      try:
        await self.fm_api_client.delete_recipe(fm_recipe_id)
        fm_api_rolled_back = True
      except Exception as rollback_error:
        logger.error(f"fm_api rollback failed for recipe_id={fm_recipe_id}: {rollback_error}")

      if fm_api_rolled_back:
        async with AsyncSessionLocal() as db:
          await RecipeService.delete_recipe(db=db, recipe_id=save_url_response.id)
      else:
        logger.warning(
            f"URL tracking kept for recipe_id={fm_recipe_id} — fm_api rollback failed, "
            f"recipe exists in postgres without a ChromaDB entry"
        )
      raise chroma_error

  @staticmethod
  def normalize_url(url: str) -> str:
    """
    Normalize a URL for comparison.

    Args:
        url: URL to normalize

    Returns:
        Normalized URL string
    """
    parsed = urlparse(url.strip())
    return urlunparse((
        parsed.scheme.lower(),
        parsed.netloc.lower(),
        parsed.path.rstrip('/'),
        parsed.params,
        parsed.query,
        ''
    ))

  @staticmethod
  async def check_recipe_urls_against_db(urls: List[str]) -> List[str]:
    """
    Filter out URLs that already exist in the database.

    Args:
        urls: List of URLs to check

    Returns:
        List of URLs that don't exist in the database
    """
    saved_urls: List[str] = []
    skip = 0
    limit = 500

    async with AsyncSessionLocal() as db:
      while True:
        batch = await RecipeService.get_recipes(db=db, skip=skip, limit=limit)
        if not batch:
          break
        batch_urls = [recipe.url for recipe in batch]
        saved_urls.extend(batch_urls)
        if len(batch) < limit:
          break
        skip += limit

    saved_url_set = {RecipePersistence.normalize_url(u) for u in saved_urls}
    input_urls_norm = {RecipePersistence.normalize_url(u): u for u in urls}

    return [orig for norm, orig in input_urls_norm.items() if norm not in saved_url_set]
