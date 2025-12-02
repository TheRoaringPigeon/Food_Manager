from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from constants import DATABASE_URL
from utils.logger import get_logger
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

logger = get_logger(__name__)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


async def get_db():
  async with AsyncSessionLocal() as session:
    yield session
