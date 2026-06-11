"""add unit enum to ingredients

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-06-11

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'f6a7b8c9d0e1'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None

UNIT_VALUES = (
    'tsp', 'tbsp', 'fl_oz', 'cup', 'pint', 'quart', 'gallon',
    'ml', 'liter',
    'oz', 'lb', 'g', 'kg',
    'whole', 'dozen',
    'pinch', 'dash', 'clove', 'slice', 'bunch', 'can', 'package', 'bag',
)


def upgrade():
    unit_enum = postgresql.ENUM(*UNIT_VALUES, name='unitenum')
    unit_enum.create(op.get_bind())

    # Clear existing free-text values — they won't map to the enum
    op.execute("UPDATE ingredients SET unit = NULL")

    op.execute(
        "ALTER TABLE ingredients "
        "ALTER COLUMN unit TYPE unitenum "
        "USING unit::unitenum"
    )


def downgrade():
    op.alter_column('ingredients', 'unit', type_=sa.String(50), existing_nullable=True)
    op.execute("DROP TYPE unitenum")
