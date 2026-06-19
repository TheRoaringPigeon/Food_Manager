import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

ROOT_PATH: Path = Path.cwd()
LOG_PATH: Path = ROOT_PATH / "log_config.ini"

APP_ENVIRONMENT = os.getenv('APP_ENVIRONMENT', 'development')

LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
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

DB_MAX_RETRIES = 5
DB_RETRY_DELAY = 3

TAG_METADATA = [
    {
        "name": "crawler",
        "description": "Operations for crawling, scraping, and ingesting data from websites."
    },
    {
        "name": "health",
        "description": "Health check and API information endpoints."
    },
    {
      "name": "recipes",
      "description": "crawled recipes stored in vector DB."
    },
    {
      "name": "recommendations",
      "description": "AI-powered recipe recommendations based on craving and pantry."
    },
    {
      "name": "ingredients",
      "description": "Ingredient identification from images via Bedrock vision."
    },
    {
      "name": "voice-log",
      "description": "Voice-based food logging: upload audio, get async calorie resolution."
    }
]

CRAWL_LIMIT = int(os.getenv("CRAWL_LIMIT")) if os.getenv("CRAWL_LIMIT") else None

CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "dolphin-mistral:7b")
FM_API = os.getenv("FM_API", "http://localhost:5001")
FM_API_SERVICE_USERNAME = os.getenv("FM_API_SERVICE_USERNAME", "Admin")
FM_API_SERVICE_PASSWORD = os.getenv("FM_API_SERVICE_PASSWORD", "Admin")

LAMBDA_IDENTIFY_URL = os.getenv("LAMBDA_IDENTIFY_URL", "")
LAMBDA_API_KEY = os.getenv("LAMBDA_API_KEY", "")

USDA_API_KEY = os.getenv("USDA_API_KEY", "DEMO_KEY")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))