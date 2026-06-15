from integrations.chromadb import ChromaRepository
from integrations.fm_api import FMApiClientAsync
from integrations.llm import OllamaLLM
from services.recipe_service import RecipeService
from utils.logger import get_logger

logger = get_logger(__name__)


def _build_scored_pool(
    sql_candidates: list[dict],
    chroma_candidates: list[dict],
    ingredients: list[str],
) -> dict:
    total = len(ingredients) or 1
    ing_w = 0.6 if ingredients else 0.0
    sem_w = 0.4 if ingredients else 1.0

    chroma_by_id: dict[str, dict] = {}
    for c in chroma_candidates:
        try:
            cid = str(int(float(str(c["id"]))))
        except (ValueError, TypeError):
            continue
        chroma_by_id[cid] = {
            "distance": c.get("distance") or 0.0,
            "metadata": c.get("metadata") or {},
        }

    sql_by_id: dict[str, dict] = {}
    for s in sql_candidates:
        try:
            sid = str(int(s["id"]))
        except (ValueError, TypeError):
            continue
        sql_by_id[sid] = {
            "name": s.get("name", ""),
            "match_count": s.get("match_count", 0),
        }

    all_ids = set(chroma_by_id) | set(sql_by_id)
    pool: dict[str, dict] = {}
    for rid in all_ids:
        chroma_data = chroma_by_id.get(rid)
        sql_data = sql_by_id.get(rid)

        match_count = sql_data["match_count"] if sql_data else 0
        ingredient_score = match_count / total

        if chroma_data is not None:
            distance = chroma_data["distance"]
            semantic_score = 1 / (1 + distance)
            metadata = chroma_data["metadata"]
            name = sql_data["name"] if sql_data else metadata.get("name", "")
        else:
            semantic_score = 0.5
            metadata = {}
            name = sql_data["name"] if sql_data else ""

        pool[rid] = {
            "id": rid,
            "name": name,
            "match_count": match_count,
            "metadata": metadata,
            "score": ing_w * ingredient_score + sem_w * semantic_score,
        }

    return pool


class RecommendationService:

    def __init__(
        self,
        chroma_repo: ChromaRepository = None,
        fm_client: FMApiClientAsync = None,
        llm_client: OllamaLLM = None,
    ):
        self.repo = chroma_repo or ChromaRepository()
        self.fm = fm_client or FMApiClientAsync()
        self.llm = llm_client or OllamaLLM()

    async def recommend(self, query: str, ingredients: list[str] | None = None) -> dict:
        if ingredients is None:
            ingredients = []

        logger.info("recommend() — query=%r ingredients=%s", query, ingredients)

        # Step 1: SQL pre-filter by ingredient overlap
        sql_candidates = []
        if ingredients:
            sql_candidates = await self.fm.get_recipes_by_ingredients(ingredients)
            logger.info("SQL candidates (%d): %s", len(sql_candidates), [
                {"id": c.get("id"), "name": c.get("name"), "match_count": c.get("match_count")}
                for c in sql_candidates
            ])

        # Step 2: ChromaDB semantic search — enrich query with ingredient names
        enriched_query = f"{query} {' '.join(ingredients)}".strip() if ingredients else query
        chroma_results = await self.repo.query(text=enriched_query, n_results=10)
        chroma_candidates = await RecipeService.format_results(chroma_results)
        logger.info("Chroma candidates (%d): %s", len(chroma_candidates), [
            {"id": c.get("id"), "metadata_name": c.get("metadata", {}).get("name"), "distance": c.get("distance")}
            for c in chroma_candidates
        ])

        # Step 3: Merge both pools and compute combined score
        pool = _build_scored_pool(sql_candidates, chroma_candidates, ingredients)
        top5 = sorted(pool.values(), key=lambda x: x["score"], reverse=True)[:5]
        logger.info("Top-5 pool (pre-enrichment): %s", [
            {"id": c["id"], "name": c["name"], "score": round(c["score"], 3), "match_count": c["match_count"]}
            for c in top5
        ])

        if not top5:
            return {
                "recipe_id": "",
                "recipe_name": "",
                "why": "No recipes found.",
                "have_ingredients": [],
                "missing_ingredients": [],
                "substitutions": {},
                "description": None,
                "ingredients": [],
                "instructions": None,
                "image_url": None,
                "prep_time": None,
                "cook_time": None,
            }

        # Step 4: Fetch full recipe data from fm_api
        top_ids = [int(c["id"]) for c in top5]
        recipes_list = await self.fm.get_recipes_by_ids(top_ids)
        full_recipes = {str(r["id"]): r for r in recipes_list}
        logger.info("Full recipes fetched from fm_api — ids returned: %s", list(full_recipes.keys()))

        # Step 4.5: Enrich candidates with authoritative name + ingredient list from fm_api
        # so the LLM gets accurate data rather than relying on potentially stale ChromaDB metadata.
        for c in top5:
            full = full_recipes.get(c["id"], {})
            if full:
                c["name"] = full.get("name") or c["name"]
                ing_list = full.get("ingredients") or []
                c["metadata"]["ingredients"] = ", ".join(
                    ing["name"] if isinstance(ing, dict) else str(ing)
                    for ing in ing_list
                )
        logger.info("Top-5 after enrichment: %s", [
            {"id": c["id"], "name": c["name"], "ingredients_preview": c.get("metadata", {}).get("ingredients", "")[:80]}
            for c in top5
        ])

        # Step 5: LLM picks the best candidate
        ollama_result = await self.llm.recommend_recipe(query, top5, ingredients)
        logger.info("LLM result: %s", ollama_result)

        # Step 6: Merge LLM pick with full recipe data
        recipe_id = ollama_result.get("recipe_id", "")
        try:
            recipe_id = str(int(str(recipe_id).strip()))
        except (ValueError, TypeError):
            recipe_id = str(recipe_id).strip()

        full = full_recipes.get(recipe_id, {})
        if not full:
            logger.warning("LLM returned recipe_id=%r which was not in full_recipes (keys: %s)", recipe_id, list(full_recipes.keys()))

        return {
            "recipe_id": recipe_id,
            "recipe_name": ollama_result.get("recipe_name") or full.get("name", ""),
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
