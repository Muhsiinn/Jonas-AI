"""add roleplay messages

Revision ID: 8c7f5c2c1a9e
Revises: 413d4035f910
Create Date: 2026-02-03 14:07:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8c7f5c2c1a9e"
down_revision = "413d4035f910"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "roleplay_messages",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("roleplay_id", sa.Integer(), sa.ForeignKey("roleplay.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index(
        "ix_roleplay_messages_roleplay_created",
        "roleplay_messages",
        ["roleplay_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_roleplay_messages_roleplay_created", table_name="roleplay_messages")
    op.drop_table("roleplay_messages")
