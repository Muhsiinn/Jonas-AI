"""add email_verified to users

Revision ID: 002_add_email_verified
Revises: 001_initial
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_add_email_verified'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=True, server_default='false'))


def downgrade() -> None:
    op.drop_column('users', 'email_verified')
