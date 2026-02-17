"""add teacher conversation and message models

Revision ID: teacher_models
Revises: 931c817c2bec
Create Date: 2026-02-17 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "teacher_models"
down_revision = "931c817c2bec"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    tables = set(inspector.get_table_names())

    if "teacher_conversations" not in tables:
        op.create_table(
            "teacher_conversations",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_teacher_conversations_id"),
            "teacher_conversations",
            ["id"],
            unique=False,
        )

    tables = set(inspector.get_table_names())
    if "teacher_messages" not in tables:
        op.create_table(
            "teacher_messages",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("conversation_id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("role", sa.String(), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.ForeignKeyConstraint(
                ["conversation_id"],
                ["teacher_conversations.id"],
            ),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_teacher_messages_id"),
            "teacher_messages",
            ["id"],
            unique=False,
        )
        op.create_index(
            "ix_teacher_messages_conversation_created",
            "teacher_messages",
            ["conversation_id", "created_at"],
            unique=False,
        )


def downgrade() -> None:
    op.drop_index("ix_teacher_messages_conversation_created", table_name="teacher_messages")
    op.drop_index(op.f("ix_teacher_messages_id"), table_name="teacher_messages")
    op.drop_table("teacher_messages")
    op.drop_index(op.f("ix_teacher_conversations_id"), table_name="teacher_conversations")
    op.drop_table("teacher_conversations")

