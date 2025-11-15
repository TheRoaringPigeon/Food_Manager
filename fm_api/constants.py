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
    "title": "Food Manager API",
    "description": (
        "This API serves as the central logic hub for the food manager application. "
        "Calls from the frontend for database data and LLM responses are handled here. "
    ),
    "version": "0.0.1",
    "port": 5001,
    "host": "0.0.0.0"
}

API_CONTEXT_PATH = os.getenv('API_CONTEXT_PATH', '/food-manager/api')

DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
DB_NAME = os.getenv('DB_NAME', 'fm_db')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

TAG_METADATA = [
    {
        "name": "recipes",
        "description": "Operations for managing recipes including CRUD operations, favorites, and filtering"
    },
    {
        "name": "ingredients",
        "description": "Operations for managing ingredients including CRUD operations, favorites, and filtering"
    },
    {
        "name": "health",
        "description": "Health check and API information endpoints"
    }
]
