import asyncio
import json
import uuid
from typing import Optional

import httpx
import redis.asyncio as aioredis

from constants import REDIS_HOST, REDIS_PORT, USDA_API_KEY
from integrations.fm_api import FMApiClientAsync
from integrations.llm import OllamaLLM
from utils.logger import get_logger
from utils.unit_converter import estimate_grams

logger = get_logger(__name__)

_VOICE_JOB_TTL = 86400  # 24 hours

_USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"
_ENERGY_NUTRIENT_ID = 1008


def _extract_usda_calories(food: dict) -> Optional[float]:
    for nutrient in food.get("foodNutrients", []):
        if nutrient.get("nutrientId") == _ENERGY_NUTRIENT_ID or nutrient.get("nutrientNumber") == "208":
            val = nutrient.get("value")
            if val is not None:
                return float(val)
    return None


class VoiceLogService:

    def __init__(self, fm_client: FMApiClientAsync = None, llm: OllamaLLM = None):
        self.fm = fm_client or FMApiClientAsync()
        self.llm = llm or OllamaLLM()
        self._redis = aioredis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

    def _job_key(self, job_id: str) -> str:
        return f"voice_job:{job_id}"

    async def _set_job(self, job_id: str, data: dict) -> None:
        await self._redis.set(self._job_key(job_id), json.dumps(data), ex=_VOICE_JOB_TTL)

    async def get_job(self, job_id: str) -> Optional[dict]:
        raw = await self._redis.get(self._job_key(job_id))
        return json.loads(raw) if raw else None

    async def submit(self, transcript: str) -> str:
        job_id = str(uuid.uuid4())
        await self._set_job(job_id, {
            "status": "queued",
            "transcript": transcript,
            "items": [],
            "error": None,
        })
        asyncio.create_task(self._process(job_id, transcript))
        return job_id

    async def _process(self, job_id: str, transcript: str) -> None:
        try:
            await self._set_job(job_id, {
                "status": "processing",
                "transcript": transcript,
                "items": [],
                "error": None,
            })

            parsed_items = await self.llm.parse_voice_transcript(transcript)
            logger.info("Voice job %s parsed %d items from transcript: %s", job_id, len(parsed_items), transcript)

            resolved = []
            for item in parsed_items:
                resolved_item = await self._resolve_calories(item)
                resolved.append(resolved_item)

            await self._set_job(job_id, {
                "status": "done",
                "transcript": transcript,
                "items": resolved,
                "error": None,
            })
            logger.info("Voice job %s complete: %d items resolved", job_id, len(resolved))

        except Exception as exc:
            logger.error("Voice job %s failed: %s", job_id, exc, exc_info=True)
            await self._set_job(job_id, {
                "status": "error",
                "transcript": transcript,
                "items": [],
                "error": str(exc),
            })

    async def _resolve_calories(self, item: dict) -> dict:
        name: str = item.get("name", "")
        quantity: Optional[float] = item.get("quantity")
        unit: Optional[str] = item.get("unit")

        result = {
            "name": name,
            "quantity": quantity,
            "unit": unit,
            "calories": None,
            "source": "unknown",
        }

        if not name:
            return result

        # --- Pass 1: search local ingredient DB ---
        candidates: list[dict] = []
        try:
            hits = await self.fm.search_ingredients(name, limit=10)
            candidates.extend(hits)
            first_word = name.split()[0] if len(name.split()) > 1 else None
            if first_word and len(first_word) > 3:
                extra = await self.fm.search_ingredients(first_word, limit=10)
                seen_ids = {c["id"] for c in candidates}
                candidates.extend(c for c in extra if c["id"] not in seen_ids)
        except Exception as exc:
            logger.warning("Local ingredient search failed for '%s': %s", name, exc)

        if candidates:
            candidate_names = [c["name"] for c in candidates]
            matched_name = await self.llm.match_ingredient(name, candidate_names)
            if matched_name:
                matched = next((c for c in candidates if c["name"] == matched_name), None)
                if matched and matched.get("calories_per_100g") is not None:
                    grams = estimate_grams(quantity, unit, matched.get("grams_per_whole_unit"))
                    if grams is None and quantity is not None:
                        grams = await self.llm.estimate_portion_grams(name, quantity, unit)
                        if grams:
                            logger.info("LLM estimated %sg for '%s' (%s %s)", grams, name, quantity, unit)
                    if grams is not None:
                        result["calories"] = round(grams * matched["calories_per_100g"] / 100, 1)
                    result["source"] = "local"
                    logger.info("Resolved '%s' locally via '%s'", name, matched_name)
                    return result
                elif matched:
                    logger.info("Local match '%s' found for '%s' but no calorie data; trying USDA", matched_name, name)

        # --- Pass 2: USDA FoodData Central ---
        try:
            async with httpx.AsyncClient(timeout=15.0) as http:
                resp = await http.get(_USDA_SEARCH_URL, params={
                    "query": name,
                    "dataType": "Foundation,SR Legacy",
                    "pageSize": 5,
                    "api_key": USDA_API_KEY,
                })
                if resp.status_code == 429:
                    logger.warning("USDA rate limit hit for '%s'", name)
                    return result
                resp.raise_for_status()
                usda_foods = resp.json().get("foods", [])

            if usda_foods:
                best_index = await self.llm.pick_usda_match(name, usda_foods)
                if best_index is not None:
                    best = usda_foods[best_index]
                    cal_per_100g = _extract_usda_calories(best)
                    if cal_per_100g is not None:
                        grams = estimate_grams(quantity, unit, None)
                        if grams is None and quantity is not None:
                            grams = await self.llm.estimate_portion_grams(name, quantity, unit)
                            if grams:
                                logger.info("LLM estimated %sg for '%s' (%s %s)", grams, name, quantity, unit)
                        if grams is not None:
                            result["calories"] = round(grams * cal_per_100g / 100, 1)
                        result["source"] = "usda"
                        logger.info("Resolved '%s' via USDA (fdcId=%s): %.1f kcal/100g",
                                    name, best.get("fdcId"), cal_per_100g)
                        return result
        except Exception as exc:
            logger.warning("USDA lookup failed for '%s': %s", name, exc)

        logger.info("Could not resolve calories for '%s'; user must enter manually", name)
        return result
