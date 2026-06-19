"""add calories_per_serving to recipes

Revision ID: e3f4a5b6c7d8
Revises: d2e3f4a5b6c7
Create Date: 2026-06-18

"""
from alembic import op
import sqlalchemy as sa

revision = 'e3f4a5b6c7d8'
down_revision = 'd2e3f4a5b6c7'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('recipes', sa.Column('calories_per_serving', sa.Float(), nullable=True))


def downgrade():
    op.drop_column('recipes', 'calories_per_serving')
