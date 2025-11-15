from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from constants import API_CONTEXT_PATH

from schemas.Crawler import StatusResponse
from services.crawler_service import CrawlerService

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


@router.post("/unlock")
async def force_unlock(
    service: CrawlerService = Depends(get_crawler_service)
):
  """Force release the crawl lock (use with caution)"""
  await service.release_lock()
  return {"message": "Lock released successfully"}
