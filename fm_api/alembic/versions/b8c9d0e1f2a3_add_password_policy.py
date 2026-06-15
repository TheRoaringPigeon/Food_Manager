"""add password policy

Revision ID: b8c9d0e1f2a3
Revises: e5f6a7b8c9d0, 0ec33c946bd8
Create Date: 2026-06-15

"""
from alembic import op
import sqlalchemy as sa

revision = 'b8c9d0e1f2a3'
down_revision = ('e5f6a7b8c9d0', '0ec33c946bd8')
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('password_changed_at', sa.DateTime(), nullable=True))
    op.add_column(
        'users',
        sa.Column('must_change_password', sa.Boolean(), nullable=False, server_default=sa.text('true')),
    )
    op.create_table(
        'password_history',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )


def downgrade():
    op.drop_table('password_history')
    op.drop_column('users', 'must_change_password')
    op.drop_column('users', 'password_changed_at')
