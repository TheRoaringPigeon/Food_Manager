"""Remove is_favorite and last_cooked from recipes (migrate to family_recipe_statuses)

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-06-11 00:00:02.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Migrate existing is_favorite / last_cooked data to default_family before dropping columns
    op.execute("""
        INSERT INTO family_recipe_statuses (family_id, recipe_id, is_favorite, last_cooked, updated_at)
        SELECT f.id, r.id, r.is_favorite, r.last_cooked, NOW()
        FROM recipes r
        CROSS JOIN families f
        WHERE f.name = 'default_family'
          AND (r.is_favorite = true OR r.last_cooked IS NOT NULL)
        ON CONFLICT (family_id, recipe_id) DO NOTHING
    """)

    op.drop_index('ix_recipes_is_favorite', table_name='recipes')
    op.drop_column('recipes', 'is_favorite')
    op.drop_column('recipes', 'last_cooked')


def downgrade() -> None:
    op.add_column('recipes', sa.Column('last_cooked', sa.DateTime(), nullable=True))
    op.add_column('recipes', sa.Column('is_favorite', sa.Boolean(), nullable=True, server_default=sa.text('false')))
    op.create_index('ix_recipes_is_favorite', 'recipes', ['is_favorite'], unique=False)
