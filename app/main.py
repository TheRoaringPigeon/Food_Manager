import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from constants import API_INFO, UVICORN_WORKERS, APP_ENVIRONMENT, TAG_METADATA, API_CONTEXT_PATH
from utils.logger import get_logger
from routers import recipe_router

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
  logger.info(f"Starting {API_INFO['title']} at port \"{API_INFO['port']}\"")
  yield
  logger.info(f"Shutting down {API_INFO['title']}")

app = FastAPI(
  lifespan=lifespan,
  title=API_INFO['title'],
  description=API_INFO['description'],
  version=API_INFO['version'],
  docs_url=f"{API_CONTEXT_PATH}/docs",
  openapi_tags=TAG_METADATA
)

app.include_router(recipe_router)

origins = ["*"]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

@app.get(f"{API_CONTEXT_PATH}/info")
async def info():
  return {
    "Name": API_INFO['title'],
    "Description": API_INFO['description'],
    "Version": API_INFO['version']
  }
  
@app.get(f"{API_CONTEXT_PATH}/health")
async def read_root():
  return f"{API_INFO['title']} is Healthy"

if __name__ == "main":
  uvicorn.run(
    "main:app",
    port=API_INFO['port'],
    host=API_INFO['host'],
    reload=True if APP_ENVIRONMENT == 'development' else False,
    workers=UVICORN_WORKERS
  )