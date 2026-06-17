"""remove is_available from ingredients

Revision ID: d2e3f4a5b6c7
Revises: c1d2e3f4a5b6
Create Date: 2026-06-17

"""
from alembic import op
import sqlalchemy as sa


revision = 'd2e3f4a5b6c7'
down_revision = 'c1d2e3f4a5b6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index('ix_ingredients_is_available', table_name='ingredients')
    op.drop_column('ingredients', 'is_available')


def downgrade() -> None:
    op.add_column('ingredients', sa.Column('is_available', sa.Boolean(), nullable=True))
    op.create_index('ix_ingredients_is_available', 'ingredients', ['is_available'], unique=False)
