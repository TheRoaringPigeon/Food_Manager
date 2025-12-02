import sys
from pathlib import Path

try:
  sys.path.append(str(Path(__file__).resolve().parents[1]))
except:
  pass

from constants import DATABASE_URL
from models import *
from database import Base  # your declarative base
import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool
from alembic import context


# Alembic Config
config = context.config
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Logging
if config.config_file_name is not None:
  fileConfig(config.config_file_name)

# Target metadata for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
  """Run migrations in 'offline' mode."""
  url = config.get_main_option("sqlalchemy.url")
  context.configure(
      url=url,
      target_metadata=target_metadata,
      literal_binds=True,
      dialect_opts={"paramstyle": "named"},
      compare_type=True,
      compare_server_default=True,
  )

  with context.begin_transaction():
    context.run_migrations()


async def run_migrations_online() -> None:
  """Run migrations in 'online' (async) mode."""
  connectable = async_engine_from_config(
      config.get_section(config.config_ini_section, {}),
      prefix="sqlalchemy.",
      poolclass=pool.NullPool,
  )

  async with connectable.connect() as connection:
    await connection.run_sync(
        lambda conn: context.configure(
            connection=conn,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
    )

    await connection.run_sync(run_migrations)


def run_migrations(connection):
  with context.begin_transaction():
    context.run_migrations()


if context.is_offline_mode():
  run_migrations_offline()
else:
  asyncio.run(run_migrations_online())
