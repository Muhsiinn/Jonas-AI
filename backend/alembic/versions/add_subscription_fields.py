"""add subscription fields to users

Revision ID: add_subscription_fields
Revises: 56fea8dbe7bd
Create Date: 2026-02-02 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_subscription_fields'
down_revision = '56fea8dbe7bd'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('stripe_customer_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('stripe_subscription_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('subscription_status', sa.String(), nullable=False, server_default='free'))
    op.add_column('users', sa.Column('subscription_plan', sa.String(), nullable=False, server_default='free'))
    op.add_column('users', sa.Column('subscription_current_period_end', sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f('ix_users_stripe_customer_id'), 'users', ['stripe_customer_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_stripe_customer_id'), table_name='users')
    op.drop_column('users', 'subscription_current_period_end')
    op.drop_column('users', 'subscription_plan')
    op.drop_column('users', 'subscription_status')
    op.drop_column('users', 'stripe_subscription_id')
    op.drop_column('users', 'stripe_customer_id')
