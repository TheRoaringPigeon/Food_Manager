"""add usda nutrition to ingredients

Revision ID: a9b0c1d2e3f4
Revises: b8c9d0e1f2a3
Create Date: 2026-06-16

"""
from alembic import op
import sqlalchemy as sa

revision = 'a9b0c1d2e3f4'
down_revision = 'b8c9d0e1f2a3'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('ingredients', sa.Column('calories_per_100g', sa.Float(), nullable=True))
    op.add_column('ingredients', sa.Column('usda_fdc_id', sa.String(20), nullable=True))
    op.create_index('ix_ingredients_usda_fdc_id', 'ingredients', ['usda_fdc_id'])


def downgrade():
    op.drop_index('ix_ingredients_usda_fdc_id', table_name='ingredients')
    op.drop_column('ingredients', 'usda_fdc_id')
    op.drop_column('ingredients', 'calories_per_100g')
