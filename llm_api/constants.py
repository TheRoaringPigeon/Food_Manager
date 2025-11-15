import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

ROOT_PATH: Path = Path.cwd()
LOG_PATH: Path = ROOT_PATH / "log_config.ini"

APP_ENVIRONMENT = os.getenv('APP_ENVIRONMENT', 'development')

LOG_LEVEL = os.getenv('LOG_LEVEL', 'DEBUG')
UVICORN_WORKERS = int(os.getenv('UVICORN_WORKERS', 1))

API_INFO = {
    "title": "LLM API",
    "description": (
        "This API serves as the facilitator for LLM interaction."
    ),
    "version": "0.0.1",
    "port": 5002,
    "host": "0.0.0.0"
}
API_CONTEXT_PATH = os.getenv('API_CONTEXT_PATH', '/food-manager/llm/api')

DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
DB_NAME = os.getenv('DB_NAME', 'llm_api')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

DB_MAX_RETRIES = 20
DB_RETRY_DELAY = 3

TAG_METADATA = [
    {
        "name": "crawler",
        "description": "Operations for crawling, scraping, and ingesting data from websites."
    },
    {
        "name": "health",
        "description": "Health check and API information endpoints"
    }
]