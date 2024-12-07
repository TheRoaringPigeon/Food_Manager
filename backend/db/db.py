import asyncpg
from asyncio import sleep as async_sleep

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from alembic import command, config

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

def get_db_url():
  return (
    f"postgresql+asyncpg://{settings.database_username}:{settings.database_password}"
    f"@{settings.database_host}:{settings.database_port}/{settings.database_name}"
  )

engine = create_async_engine(
  url=get_db_url(),
  echo=True
)
session_local = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()

def run_alembic_upgrade(connection, cfg):
  cfg.attributes["connection"] = connection
  command.upgrade(cfg, "head")

def run_alembic_stamp(connection, cfg):
  cfg.attributes["connection"] = connection
  command.stamp(cfg, "head")

async def run_migrations():
  alembic_cfg = config.Config("alembic.ini")
  async with engine.begin() as db_conn:
    await db_conn.run_sync(run_alembic_upgrade, alembic_cfg)

async def run_stamp():
  alembic_cfg = config.Config("alembic.ini")
  async with engine.begin() as db_conn:
    await db_conn.run_sync(run_alembic_stamp, alembic_cfg)

async def create_tables():
  try:
    logger.info("Creating Tables")
    async with engine.begin() as db_conn:
      await db_conn.run_sync(Base.metadata.create_all)
  except Exception as e:
    logger.error(f"Failed to create tables with {e}")

async def create_database():
  max_retries = 10
  retry_delay = 5
  retries = 0

  while retries < max_retries:
    try:
      db_conn = await asyncpg.connect(
        database="postgres", # Connect to the default 'postgres' database
        user=settings.database_username,
        password=settings.database_password,
        host=settings.database_host,
        port=settings.database_port
      )

      try:
        logger.info(f"Creating Database {settings.database_name}")
        await db_conn.execute(f"CREATE DATABASE {settings.database_name}")

        await create_tables()

        await run_stamp()
      except asyncpg.exceptions.DuplicateDatabaseError:
        logger.info(f"Database '{settings.database_name}' already exists.")
      finally:
        await db_conn.close()
      # Exit the loop on successful connection and database creation
      return
    except ConnectionRefusedError:
      retries += 1
      logger.warning(f"PostgreSQL server not ready, retrying in {retry_delay} seconds... ({retries}/{max_retries})")
      await async_sleep(retry_delay)
  
  # If we exhaust retries, raise an exception
  logger.error(f"Failed to connect to PostgreSQL server after {max_retries} retries.")
  raise RuntimeError("PostgreSQL server is not available.")

async def get_db():
  db = session_local()

  try:
    yield db
  finally:
    await db.close()