"""add calorie_goal to users

Revision ID: b0c1d2e3f4a5
Revises: a9b0c1d2e3f4
Create Date: 2026-06-16

"""
from alembic import op
import sqlalchemy as sa

revision = 'b0c1d2e3f4a5'
down_revision = 'a9b0c1d2e3f4'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('calorie_goal', sa.Integer(), nullable=True))


def downgrade():
    op.drop_column('users', 'calorie_goal')
