from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from constants import API_CONTEXT_PATH

from schemas.Crawler import StatusResponse
from services.crawler_service import CrawlerService
from integrations.fm_api import FMApiClientAsync
from integrations.chromadb import ChromaRepository

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/crawler",
    tags=["crawler"]
)


# Dependency to get crawler service from app.state
def get_crawler_service(request: Request) -> CrawlerService:
  """Dependency to retrieve the crawler service instance"""
  return request.app.state.crawler_service


@router.post("/start")
async def start_crawl_endpoint(
    service: CrawlerService = Depends(get_crawler_service)
):
  """Start a new crawl operation"""
  result = await service.start_crawl()

  # If lock couldn't be acquired, return 409 Conflict
  if result.get("status") == "locked":
    return JSONResponse(
        status_code=409,
        content={
            "error": "Crawler is already running (lock held by another instance or process)",
            "status": "locked"
        }
    )

  return result


@router.get("/status", response_model=StatusResponse)
async def get_crawl_status(
    service: CrawlerService = Depends(get_crawler_service)
):
  """Get the current status of the crawler"""
  return await service.check_crawl_status()


@router.post("/stop")
async def stop_crawl_endpoint(
    service: CrawlerService = Depends(get_crawler_service)
):
  """Request graceful cancellation of the running crawl"""
  return await service.stop_crawl()


@router.post("/unlock")
async def force_unlock(
    service: CrawlerService = Depends(get_crawler_service)
):
  """Force release the crawl lock (use with caution)"""
  await service._release_lock()
  return {"message": "Lock released successfully"}


@router.post("/reindex-ingredients")
async def reindex_ingredients():
  """
  Backfill the 'ingredients' metadata field in ChromaDB for all existing recipes.
  Reads ingredient names from fm_api (Postgres) and patches ChromaDB metadata in-place.
  No re-crawling required. Safe to run multiple times.
  """
  fm = FMApiClientAsync()
  chroma = ChromaRepository()

  recipes = await fm.get_all_recipes()
  if not recipes:
    return {"updated": 0, "skipped": 0, "errors": 0, "total": 0}

  # Build id -> ingredients string map from fm_api data
  ingredient_map: dict[str, str] = {
      str(r["id"]): ", ".join(
          ing["name"] for ing in (r.get("ingredients") or []) if ing.get("name")
      )
      for r in recipes
  }

  updated = 0
  skipped = 0
  errors = 0

  batch_size = 50
  all_ids = list(ingredient_map.keys())
  for i in range(0, len(all_ids), batch_size):
    batch_ids = all_ids[i:i + batch_size]
    try:
      existing = await chroma.get(ids=batch_ids)
    except Exception:
      errors += len(batch_ids)
      continue

    chroma_ids = existing.get("ids") or []
    chroma_metadatas = existing.get("metadatas") or []

    if not chroma_ids:
      skipped += len(batch_ids)
      continue

    merged_metadatas = []
    for cid, meta in zip(chroma_ids, chroma_metadatas):
      merged = dict(meta or {})
      merged["ingredients"] = ingredient_map.get(cid, "")
      merged_metadatas.append(merged)

    try:
      await chroma.update(ids=chroma_ids, metadatas=merged_metadatas)
      updated += len(chroma_ids)
      skipped += len(batch_ids) - len(chroma_ids)
    except Exception:
      errors += len(chroma_ids)

  return {"updated": updated, "skipped": skipped, "errors": errors, "total": len(recipes)}
