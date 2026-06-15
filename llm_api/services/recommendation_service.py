from integrations.chromadb import ChromaRepository
from integrations.fm_api import FMApiClientAsync
from integrations.llm import OllamaLLM
from services.recipe_service import RecipeService


class RecommendationService:

  def __init__(
      self,
      chroma_repo: ChromaRepository = None,
      fm_client: FMApiClientAsync = None,
      llm_client: OllamaLLM = None
  ):
    self.repo = chroma_repo or ChromaRepository()
    self.fm = fm_client or FMApiClientAsync()
    self.llm = llm_client or OllamaLLM()

  async def recommend(self, query: str, ingredients: list[str] | None = None) -> dict:
    if ingredients is None:
        ingredients = []

    # 1. Semantic search -> 5 candidates
    chroma_results = await self.repo.query(text=query, n_results=5)
    candidates = await RecipeService.format_results(chroma_results)

    # 2. Fetch full recipes from fm_api by IDs
    candidate_ids = []
    for c in candidates:
      try:
        candidate_ids.append(int(c["id"]))
      except (ValueError, KeyError):
        pass

    full_recipes = {}
    if candidate_ids:
      recipes_list = await self.fm.get_recipes_by_ids(candidate_ids)
      full_recipes = {str(r["id"]): r for r in recipes_list}

    # 3. Ask Ollama to pick best match + explain
    ollama_result = await self.llm.recommend_recipe(query, candidates, ingredients)

    # 5. Merge Ollama output with full recipe data from Postgres
    # Normalize recipe_id: strip whitespace and coerce to int-string to match dict keys
    recipe_id = ollama_result.get("recipe_id", "")
    try:
        recipe_id = str(int(str(recipe_id).strip()))
    except (ValueError, TypeError):
        recipe_id = str(recipe_id).strip()
    full = full_recipes.get(recipe_id, {})

    return {
        "recipe_id": recipe_id,
        "recipe_name": ollama_result.get("recipe_name", full.get("name", "")),
        "why": ollama_result.get("why", ""),
        "have_ingredients": ollama_result.get("have_ingredients", []),
        "missing_ingredients": ollama_result.get("missing_ingredients", []),
        "substitutions": ollama_result.get("substitutions", {}),
        "description": full.get("description"),
        "ingredients": [
            ing["name"] if isinstance(ing, dict) else ing
            for ing in (full.get("ingredients") or [])
        ],
        "instructions": full.get("instructions"),
        "image_url": full.get("image_url"),
        "prep_time": full.get("prep_time"),
        "cook_time": full.get("cook_time"),
    }
