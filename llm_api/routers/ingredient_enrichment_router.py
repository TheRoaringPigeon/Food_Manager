from typing import Optional
from fastapi import APIRouter, Query
from constants import API_CONTEXT_PATH
from services.usda_enrichment_service import USDAEnrichmentService

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/ingredients",
    tags=["ingredients"],
)


@router.post("/enrich")
async def enrich_ingredients(
    limit: Optional[int] = Query(
        None,
        description="Max ingredients to process in this call. Omit to process all pending. "
                    "DEMO_KEY supports ~25/hour — use limit=25 with DEMO_KEY, omit with a registered key.",
        ge=1,
    ),
):
    """
    Enriches ingredients with USDA calorie data (kcal per 100g).

    For each ingredient in fm_api that lacks a usda_fdc_id, searches USDA FoodData Central,
    uses the LLM to pick the best generic match, then writes calories_per_100g and usda_fdc_id
    back to the ingredient record.

    DEMO_KEY rate limits (30/hour, 50/day) will be hit quickly on large ingredient lists.
    Register a free key at https://fdc.nal.usda.gov/api-guide.html and set USDA_API_KEY.
    """
    service = USDAEnrichmentService()
    return await service.enrich_all(limit=limit)
