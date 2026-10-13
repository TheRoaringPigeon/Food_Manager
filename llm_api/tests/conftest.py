import sys
import os
from pathlib import Path

# Make llm_api package root importable
sys.path.insert(0, str(Path(__file__).parent.parent))
os.environ.setdefault("APP_ENVIRONMENT", "test")
