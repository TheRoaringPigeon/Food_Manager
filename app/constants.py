import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

ROOT_PATH: Path = Path.cwd()
LOG_PATH: Path = ROOT_PATH / "log_config.ini"

APP_ENVIRONMENT = os.getenv('APP_ENVIRONMENT', 'production')

LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
UVICORN_WORKERS = int(os.getenv('UVICORN_WORKERS', 1))

API_CONTEXT_PATH = os.getenv('API_CONTEXT_PATH', '/food-manager/api')
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

