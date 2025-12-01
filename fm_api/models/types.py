from sqlalchemy.types import TypeDecorator, JSON
from sqlalchemy.dialects.postgresql import JSONB


class JSONBCompatible(TypeDecorator):
  """
  Uses PostgreSQL JSONB in production, plain JSON under SQLite.
  """
  impl = JSON

  def load_dialect_impl(self, dialect):
    if dialect.name == "postgresql":
      return dialect.type_descriptor(JSONB())
    else:
      return dialect.type_descriptor(JSON())
