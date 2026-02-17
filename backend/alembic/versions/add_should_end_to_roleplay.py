"""add should_end to roleplay

Revision ID: add_should_end_roleplay
Revises: add_roleplay_eval_fields
Create Date: 2026-02-03 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = 'add_should_end_roleplay'
down_revision = 'add_roleplay_eval_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("roleplay")}

    if "should_end" not in columns:
        op.add_column(
            "roleplay",
            sa.Column(
                "should_end",
                sa.Boolean(),
                nullable=True,
                server_default=sa.text("false"),
            ),
        )


def downgrade() -> None:
    op.drop_column('roleplay', 'should_end')
