from fastapi import FastAPI, Request, Depends
from contextlib import asynccontextmanager
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
import uvicorn

from routers import ingredient_router
from db.db import create_database, get_db_url, get_db
from config import settings
from utils.logger import get_logger
from services.ingredient_service import IngredientService

logger = get_logger(__name__)

templates = Jinja2Templates(directory="templates")

# Normalize root_path_prefix (strip trailing slash)
root_path_prefix = settings.root_path_prefix.rstrip('/')

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"starting {settings.api_info_title} using Database {get_db_url()}")
    await create_database()
    yield
    logger.info(f"Shutting Down {settings.api_info_title}")


app = FastAPI(
    lifespan=lifespan,
    title=settings.api_info_title,
    description=settings.api_info_description,
    version=settings.api_info_version,
    docs_url=f"{root_path_prefix}/docs",
    openapi_tags=settings.tag_metadata,
)

app.include_router(ingredient_router.router)


@app.get(f"{root_path_prefix}/", response_class=HTMLResponse)
@app.get(f"{root_path_prefix}", response_class=HTMLResponse)
async def read_ingredients(request: Request, session: AsyncSession = Depends(get_db)):
    """
    This endpoint will fetch ingredients from the database and render them using Jinja templates
    """
    service = IngredientService()
    ingredients = await service.get_ingredients(session)

    return templates.TemplateResponse(
        "index.html", {"request": request, "ingredients": ingredients}
    )


@app.get(f"{root_path_prefix}/openapi.json", include_in_schema=False)
async def custom_openapi(req: Request):
    return app.openapi()


@app.get(f"{root_path_prefix}/info")
async def info():
    return {
        "Name": settings.api_info_title,
        "Description": settings.api_info_description,
        "Version": settings.api_info_version,
    }


@app.get(f"{root_path_prefix}/health")
def read_root():
    return f"{settings.api_info_title} is Healthy"


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        port=settings.api_info_port,
        host=settings.api_info_host,
        reload=True,
    )
