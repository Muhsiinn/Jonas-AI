"""fix missing subscription columns on users table

Revision ID: fix_user_sub_cols
Revises: teacher_models
Create Date: 2026-02-17 00:00:00.000000

"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "fix_user_sub_cols"
down_revision = "teacher_models"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR
        """
    )
    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR
        """
    )
    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS subscription_status VARCHAR NOT NULL DEFAULT 'free'
        """
    )
    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR NOT NULL DEFAULT 'free'
        """
    )
    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_users_stripe_customer_id
        ON users (stripe_customer_id)
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_users_stripe_customer_id")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS subscription_current_period_end")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS subscription_plan")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS subscription_status")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS stripe_subscription_id")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id")
