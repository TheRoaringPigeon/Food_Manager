"""add theme to users

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-06-11

"""
from alembic import op
import sqlalchemy as sa

revision = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('theme', sa.String(50), nullable=False, server_default=sa.text("'indigo'")))


def downgrade():
    op.drop_column('users', 'theme')
