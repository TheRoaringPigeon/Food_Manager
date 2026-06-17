"""add calorie_logs table

Revision ID: c1d2e3f4a5b6
Revises: b0c1d2e3f4a5
Create Date: 2026-06-16

"""
from alembic import op
import sqlalchemy as sa

revision = 'c1d2e3f4a5b6'
down_revision = 'b0c1d2e3f4a5'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'calorie_logs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('entry_type', sa.String(50), nullable=False),
        sa.Column('ingredient_id', sa.Integer(), sa.ForeignKey('ingredients.id', ondelete='SET NULL'), nullable=True),
        sa.Column('recipe_id', sa.Integer(), sa.ForeignKey('recipes.id', ondelete='SET NULL'), nullable=True),
        sa.Column('food_name', sa.String(255), nullable=False),
        sa.Column('quantity_grams', sa.Float(), nullable=True),
        sa.Column('servings_eaten', sa.Float(), nullable=True),
        sa.Column('calories', sa.Float(), nullable=False),
        sa.Column('meal_type', sa.String(50), nullable=False),
        sa.Column('logged_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_calorie_logs_user_id', 'calorie_logs', ['user_id'])
    op.create_index('ix_calorie_logs_logged_at', 'calorie_logs', ['logged_at'])


def downgrade():
    op.drop_index('ix_calorie_logs_logged_at', table_name='calorie_logs')
    op.drop_index('ix_calorie_logs_user_id', table_name='calorie_logs')
    op.drop_table('calorie_logs')
