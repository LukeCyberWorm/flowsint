"""create dossier tables

Revision ID: create_dossier_system
Revises: 
Create Date: 2025-12-18

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'create_dossier_system'
down_revision = None  # Set to your latest migration
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE dossierstatus AS ENUM ('draft', 'active', 'archived', 'closed')")
    op.execute("CREATE TYPE dossierfiletype AS ENUM ('document', 'image', 'video', 'audio', 'other')")
    
    # Create dossiers table
    op.create_table(
        'dossiers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('investigation_id', postgresql.UUID(as_uuid=True), nullable=False, index=True, unique=True),
        sa.Column('case_number', sa.String(50), nullable=False, unique=True, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('status', postgresql.ENUM('draft', 'active', 'archived', 'closed', name='dossierstatus'), nullable=False, index=True),
        sa.Column('client_name', sa.String(255), nullable=True),
        sa.Column('client_email', sa.String(255), nullable=True),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('is_public', sa.Boolean, default=False, nullable=False),
        sa.Column('access_token', sa.String(255), nullable=True, unique=True, index=True),
        sa.Column('access_password', sa.String(255), nullable=True),
        sa.Column('extra_data', postgresql.JSONB, nullable=True),
        sa.Column('tags', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, index=True),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
    )
    
    # Create dossier_files table
    op.create_table(
        'dossier_files',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('dossier_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('file_type', postgresql.ENUM('document', 'image', 'video', 'audio', 'other', name='dossierfiletype'), nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=True),
        sa.Column('file_size', sa.Integer, nullable=True),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('file_url', sa.String(500), nullable=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('tags', postgresql.JSONB, nullable=True),
        sa.Column('extra_data', postgresql.JSONB, nullable=True),
        sa.Column('is_visible_to_client', sa.Boolean, default=True, nullable=False),
        sa.Column('order', sa.Integer, default=0, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ondelete='CASCADE'),
    )
    
    # Create dossier_notes table
    op.create_table(
        'dossier_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('dossier_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('note_type', sa.String(50), default='general', nullable=False),
        sa.Column('is_internal', sa.Boolean, default=False, nullable=False),
        sa.Column('is_pinned', sa.Boolean, default=False, nullable=False),
        sa.Column('order', sa.Integer, default=0, nullable=False),
        sa.Column('tags', postgresql.JSONB, nullable=True),
        sa.Column('extra_data', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ondelete='CASCADE'),
    )
    
    # Create dossier_access_logs table
    op.create_table(
        'dossier_access_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('dossier_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('access_token', sa.String(255), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('resource', sa.String(255), nullable=True),
        sa.Column('accessed_at', sa.DateTime, nullable=False, index=True),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ondelete='CASCADE'),
    )
    
    # Create dossier_ia_chats table
    op.create_table(
        'dossier_ia_chats',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('dossier_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('context', postgresql.JSONB, nullable=True),
        sa.Column('sources', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, index=True),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ondelete='CASCADE'),
    )


def downgrade() -> None:
    op.drop_table('dossier_ia_chats')
    op.drop_table('dossier_access_logs')
    op.drop_table('dossier_notes')
    op.drop_table('dossier_files')
    op.drop_table('dossiers')
    op.execute("DROP TYPE IF EXISTS dossierfiletype")
    op.execute("DROP TYPE IF EXISTS dossierstatus")
