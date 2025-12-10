"""add_scarlet_ia_tables

Revision ID: add_scarlet_ia
Revises: 
Create Date: 2025-12-09 23:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_scarlet_ia'
down_revision = None  # Update this to your latest migration
branch_labels = None
depends_on = None


def upgrade():
    # Create scarlet_ia_messages table
    op.create_table(
        'scarlet_ia_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('investigation_id', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('chat_id', sa.String(50), nullable=False, index=True),
        sa.Column('message_id', sa.String(50), nullable=False, unique=True),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text, nullable=True),
        sa.Column('parts', postgresql.JSONB, nullable=True),
        sa.Column('sources', postgresql.JSONB, nullable=True),
        sa.Column('tools_used', postgresql.JSONB, nullable=True),
        sa.Column('attachments', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, index=True, server_default=sa.text('now()')),
    )

    # Create scarlet_ia_notes table
    op.create_table(
        'scarlet_ia_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('investigation_id', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('tags', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, index=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
    )

    # Create scarlet_ia_chat_sessions table
    op.create_table(
        'scarlet_ia_chat_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('chat_id', sa.String(50), nullable=False, unique=True, index=True),
        sa.Column('investigation_id', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('title', sa.String(500), nullable=True),
        sa.Column('message_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime, nullable=False, index=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
    )


def downgrade():
    op.drop_table('scarlet_ia_chat_sessions')
    op.drop_table('scarlet_ia_notes')
    op.drop_table('scarlet_ia_messages')
