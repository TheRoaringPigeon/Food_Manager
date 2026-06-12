"""add recipe_ingredients junction table

Revision ID: a0b1c2d3e4f5
Revises: f6a7b8c9d0e1
Create Date: 2026-06-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
import json

revision: str = 'a0b1c2d3e4f5'
down_revision: Union[str, Sequence[str], None] = 'f6a7b8c9d0e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create recipe_ingredients table
    op.create_table(
        'recipe_ingredients',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('recipe_id', sa.Integer, sa.ForeignKey('recipes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('ingredient_id', sa.Integer, sa.ForeignKey('ingredients.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('quantity', sa.Float, nullable=True),
        sa.Column('unit', sa.String(50), nullable=True),
        sa.Column('sort_order', sa.Integer, nullable=False, server_default='0'),
    )
    op.create_index('ix_recipe_ingredients_recipe_id', 'recipe_ingredients', ['recipe_id'])

    # 2. Migrate data from recipes.ingredients JSONB column
    conn = op.get_bind()
    rows = conn.execute(text("SELECT id, ingredients FROM recipes")).fetchall()
    for row in rows:
        recipe_id = row[0]
        ingredients = row[1]
        if ingredients is None:
            continue
        # SQLite stores JSON as text; PostgreSQL JSONB driver returns Python objects
        if isinstance(ingredients, str):
            try:
                ingredients = json.loads(ingredients)
            except (json.JSONDecodeError, TypeError):
                continue
        if not isinstance(ingredients, list):
            continue
        for i, ing in enumerate(ingredients):
            if isinstance(ing, str):
                name, quantity, unit = ing, None, None
            elif isinstance(ing, dict):
                name = ing.get('name') or ''
                quantity = ing.get('quantity')
                unit = ing.get('unit')
            else:
                continue
            if not name.strip():
                continue
            conn.execute(
                text(
                    "INSERT INTO recipe_ingredients "
                    "(recipe_id, ingredient_id, name, quantity, unit, sort_order) "
                    "VALUES (:recipe_id, NULL, :name, :quantity, :unit, :sort_order)"
                ),
                {
                    "recipe_id": recipe_id,
                    "name": name,
                    "quantity": quantity,
                    "unit": unit,
                    "sort_order": i,
                },
            )

    # 3. Drop the JSONB ingredients column from recipes
    op.drop_column('recipes', 'ingredients')


def downgrade() -> None:
    # Re-add ingredients as a generic JSON column (data recovered from recipe_ingredients)
    op.add_column('recipes', sa.Column('ingredients', sa.Text(), nullable=True))

    conn = op.get_bind()
    rows = conn.execute(
        text("SELECT recipe_id, name, quantity, unit FROM recipe_ingredients ORDER BY recipe_id, sort_order")
    ).fetchall()
    by_recipe: dict = {}
    for row in rows:
        rid = row[0]
        by_recipe.setdefault(rid, []).append({"name": row[1], "quantity": row[2], "unit": row[3]})
    for recipe_id, ings in by_recipe.items():
        conn.execute(
            text("UPDATE recipes SET ingredients = :ings WHERE id = :id"),
            {"ings": json.dumps(ings), "id": recipe_id},
        )
    conn.execute(text("UPDATE recipes SET ingredients = '[]' WHERE ingredients IS NULL"))

    op.drop_table('recipe_ingredients')
