"""add completed score evaluation suggested_vocab to roleplay

Revision ID: add_roleplay_eval_fields
Revises: 8c7f5c2c1a9e
Create Date: 2026-02-03 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'add_roleplay_eval_fields'
down_revision = '8c7f5c2c1a9e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("roleplay")}

    if "completed" not in columns:
        op.add_column(
            "roleplay",
            sa.Column(
                "completed",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("false"),
            ),
        )
    if "score" not in columns:
        op.add_column(
            "roleplay",
            sa.Column("score", sa.Integer(), nullable=True),
        )
    if "evaluation" not in columns:
        op.add_column(
            "roleplay",
            sa.Column(
                "evaluation",
                postgresql.JSONB(astext_type=sa.Text()),
                nullable=True,
            ),
        )
    if "suggested_vocab" not in columns:
        op.add_column(
            "roleplay",
            sa.Column(
                "suggested_vocab",
                postgresql.JSONB(astext_type=sa.Text()),
                nullable=True,
            ),
        )


def downgrade() -> None:
    op.drop_column('roleplay', 'suggested_vocab')
    op.drop_column('roleplay', 'evaluation')
    op.drop_column('roleplay', 'score')
    op.drop_column('roleplay', 'completed')
