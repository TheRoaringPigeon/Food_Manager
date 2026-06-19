"""add grams_per_whole_unit to ingredients

Revision ID: f4a5b6c7d8e9
Revises: e3f4a5b6c7d8
Create Date: 2026-06-18

"""
from alembic import op
import sqlalchemy as sa

revision = 'f4a5b6c7d8e9'
down_revision = 'e3f4a5b6c7d8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('ingredients', sa.Column('grams_per_whole_unit', sa.Float(), nullable=True))


def downgrade():
    op.drop_column('ingredients', 'grams_per_whole_unit')
