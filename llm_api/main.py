from fastapi import FastAPI
from contextlib import asynccontextmanager
import uvicorn
from database import engine, Base
from constants import (
    DB_MAX_RETRIES, DB_RETRY_DELAY, API_INFO, UVICORN_WORKERS, APP_ENVIRONMENT, TAG_METADATA, API_CONTEXT_PATH
)

import asyncio
from models.Crawler import CrawlerState
from services.crawler_service import CrawlerService
from routers.crawler_router import router as crawler_router
from routers.recipe import router as recipe_router
from fastapi.middleware.cors import CORSMiddleware
from utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):

  # --- TRY TO CONNECT TO POSTGRES MULTIPLE TIMES ---
  for attempt in range(1, DB_MAX_RETRIES + 1):
    try:
      async with engine.begin() as conn:
        logger.info("Database connected.")

    except Exception as e:
      logger.warning(f"Database connection failed (attempt {attempt}/{DB_MAX_RETRIES}): {e}")

      if attempt == DB_MAX_RETRIES:
        raise Exception()
      else:
        await asyncio.sleep(DB_RETRY_DELAY)

  app.state.crawler = CrawlerState()

  app.state.crawler_service = CrawlerService(app=app)

  if APP_ENVIRONMENT == "production":
    asyncio.create_task(app.state.crawler_service.start_crawl())

  yield

  # Shutdown: Release lock if held
  await app.state.crawler_service._release_lock()


app = FastAPI(
    lifespan=lifespan,
    title=API_INFO['title'],
    description=API_INFO['description'],
    version=API_INFO['version'],
    docs_url=f"{API_CONTEXT_PATH}/docs",
    openapi_tags=TAG_METADATA
)

app.include_router(crawler_router)
app.include_router(recipe_router)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get(f"{API_CONTEXT_PATH}/info", tags=["health"])
async def info():
  return {
      "Name": API_INFO['title'],
      "Description": API_INFO['description'],
      "Version": API_INFO['version']
  }


@app.get(f"{API_CONTEXT_PATH}/health", tags=["health"])
async def read_root():
  return f"{API_INFO['title']} is Healthy"


if __name__ == "__main__":
  uvicorn.run(
      "main:app",
      port=API_INFO['port'],
      host=API_INFO['host'],
      reload=True if APP_ENVIRONMENT == 'development' else False,
      workers=UVICORN_WORKERS
  )
