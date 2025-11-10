from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from constants import DATABASE_URL
from utils.logger import get_logger

logger = get_logger(__name__)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


def init_db():
  # TODO: keeping for now, but is likely not needed with alembic.
  from models.recipe import Base
  logger.info("Creating database tables...")
  Base.metadata.create_all(bind=engine)
  logger.info("Database tables created successfully")
