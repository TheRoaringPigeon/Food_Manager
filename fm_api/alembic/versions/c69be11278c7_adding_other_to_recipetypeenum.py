"""Adding 'other' to RecipeTypeEnum

Revision ID: c69be11278c7
Revises: ed1a893ca0fc
Create Date: 2025-11-28 14:42:35.210493

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c69be11278c7'
down_revision: Union[str, Sequence[str], None] = 'ed1a893ca0fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade():
  op.execute("ALTER TYPE recipetypeenum ADD VALUE 'OTHER';")


def downgrade():
  # PostgreSQL does not support removing values from enums
  # I need to recreate the type without 'other'
  op.execute("""
        CREATE TYPE recipetypeenum_new AS ENUM (
            'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'DRINK'
        );
    """)
  op.execute("""
        ALTER TABLE recipes
        ALTER COLUMN recipe_type TYPE recipetypeenum_new
        USING recipe_type::text::recipetypeenum_new;
    """)
  op.execute("DROP TYPE recipetypeenum;")
  op.execute("ALTER TYPE recipetypeenum_new RENAME TO recipetypeenum;")
