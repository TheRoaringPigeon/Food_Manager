import asyncio
from typing import Optional
import httpx

from constants import USDA_API_KEY
from integrations.fm_api import FMApiClientAsync
from integrations.llm import OllamaLLM
from utils.logger import get_logger

logger = get_logger(__name__)

_USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"
_ENERGY_NUTRIENT_ID = 1008  # Energy, kcal per 100g

# DEMO_KEY: 30 req/hour, 50 req/day. 2.5s keeps us ~24/min safely.
# Register a free key at https://fdc.nal.usda.gov/api-guide.html for 3,600/hour.
_REQUEST_INTERVAL = 2.5


class USDAEnrichmentService:

    def __init__(self):
        self.fm_client = FMApiClientAsync()
        self.llm = OllamaLLM()
        self._http = httpx.AsyncClient(timeout=15.0)

    async def _search_usda(self, ingredient_name: str) -> list[dict]:
        """
        Search USDA FoodData Central. Raises RuntimeError on rate limit so the
        caller can abort the job cleanly rather than silently burning requests.
        """
        params = {
            "query": ingredient_name,
            "dataType": "Foundation,SR Legacy",
            "pageSize": 5,
            "api_key": USDA_API_KEY,
        }
        resp = await self._http.get(_USDA_SEARCH_URL, params=params)

        if resp.status_code == 429:
            body = resp.json()
            code = body.get("error", {}).get("code", "")
            raise RuntimeError(f"USDA rate limit: {code} — wait before retrying (DEMO_KEY: 30/hour, 50/day)")

        resp.raise_for_status()

        data = resp.json()
        if "error" in data:
            raise RuntimeError(f"USDA API error: {data['error']}")

        return data.get("foods", [])

    def _extract_calories(self, food: dict) -> Optional[float]:
        for nutrient in food.get("foodNutrients", []):
            # nutrientId 1008 (FDC) or nutrientNumber "208" both mean Energy/kcal
            if nutrient.get("nutrientId") == _ENERGY_NUTRIENT_ID or nutrient.get("nutrientNumber") == "208":
                val = nutrient.get("value")
                if val is not None:
                    return float(val)
        return None

    async def enrich_all(self, limit: Optional[int] = None) -> dict:
        all_ingredients = await self.fm_client.get_all_ingredients()
        unenriched = [i for i in all_ingredients if not i.get("usda_fdc_id")]

        if limit is not None:
            batch = unenriched[:limit]
        else:
            batch = unenriched

        logger.info(
            "Enrichment starting: %d total ingredients, %d already enriched, %d in this batch",
            len(all_ingredients), len(all_ingredients) - len(unenriched), len(batch),
        )

        enriched = 0
        no_match = 0
        errors = 0
        rate_limited = False

        for idx, ingredient in enumerate(batch):
            name = ingredient["name"]
            logger.info("[%d/%d] Enriching '%s'", idx + 1, len(batch), name)

            if idx > 0:
                await asyncio.sleep(_REQUEST_INTERVAL)

            try:
                candidates = await self._search_usda(name)
                if not candidates:
                    logger.info("  No USDA candidates for '%s'", name)
                    no_match += 1
                    continue

                best_index = await self.llm.pick_usda_match(name, candidates)
                if best_index is None:
                    logger.info("  LLM found no match for '%s'", name)
                    no_match += 1
                    continue

                best = candidates[best_index]
                calories = self._extract_calories(best)
                if calories is None:
                    logger.info("  No calorie data in USDA entry for '%s' (fdcId=%s desc='%s')",
                                name, best.get("fdcId"), best.get("description", "")[:60])
                    no_match += 1
                    continue

                fdc_id = str(best["fdcId"])
                await self.fm_client.update_ingredient_nutrition(ingredient["id"], calories, fdc_id)
                logger.info("  OK '%s': %.1f kcal/100g (fdcId=%s desc='%s')",
                            name, calories, fdc_id, best.get("description", "")[:60])
                enriched += 1

            except RuntimeError as exc:
                # Rate limit hit — abort the whole job, don't waste remaining quota
                logger.error("Aborting enrichment: %s", exc)
                rate_limited = True
                errors += len(batch) - idx - 1  # count remaining as unprocessed
                break

            except Exception as exc:
                logger.error("  Error enriching '%s': %s", name, exc)
                errors += 1

        await self._http.aclose()

        remaining = len(unenriched) - len(batch)
        result = {
            "total": len(all_ingredients),
            "already_enriched": len(all_ingredients) - len(unenriched),
            "newly_enriched": enriched,
            "no_match": no_match,
            "errors": errors,
            "remaining_unenriched": remaining + (len(batch) - enriched - no_match - (1 if rate_limited else 0)),
        }
        if rate_limited:
            result["rate_limited"] = True
            result["message"] = "USDA rate limit hit. Register a free key at https://fdc.nal.usda.gov/api-guide.html and set USDA_API_KEY env var for 3,600 req/hour."

        logger.info("Enrichment complete: %s", result)
        return result
