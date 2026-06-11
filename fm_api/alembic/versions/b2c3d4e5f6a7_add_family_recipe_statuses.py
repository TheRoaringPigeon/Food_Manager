"""Add family_recipe_statuses table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-11 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'family_recipe_statuses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('family_id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('is_favorite', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('last_cooked', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['family_id'], ['families.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('family_id', 'recipe_id', name='uq_family_recipe'),
    )
    op.create_index(op.f('ix_family_recipe_statuses_id'), 'family_recipe_statuses', ['id'], unique=False)
    op.create_index(op.f('ix_family_recipe_statuses_family_id'), 'family_recipe_statuses', ['family_id'], unique=False)
    op.create_index(op.f('ix_family_recipe_statuses_recipe_id'), 'family_recipe_statuses', ['recipe_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_family_recipe_statuses_recipe_id'), table_name='family_recipe_statuses')
    op.drop_index(op.f('ix_family_recipe_statuses_family_id'), table_name='family_recipe_statuses')
    op.drop_index(op.f('ix_family_recipe_statuses_id'), table_name='family_recipe_statuses')
    op.drop_table('family_recipe_statuses')
