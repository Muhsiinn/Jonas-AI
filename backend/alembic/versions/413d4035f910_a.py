"""a

Revision ID: 413d4035f910
Revises: 56fea8dbe7bd
Create Date: 2026-02-03 12:14:27.385060

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '413d4035f910'
down_revision = 'add_subscription_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE roleplay "
        "ADD COLUMN IF NOT EXISTS user_role VARCHAR NOT NULL"
    )
    op.execute(
        "ALTER TABLE roleplay "
        "ADD COLUMN IF NOT EXISTS ai_role VARCHAR NOT NULL"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE roleplay DROP COLUMN IF EXISTS ai_role")
    op.execute("ALTER TABLE roleplay DROP COLUMN IF EXISTS user_role")
