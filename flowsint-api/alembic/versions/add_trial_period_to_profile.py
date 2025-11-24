"""add trial period to profile

Revision ID: trial_period_2025
Revises: faceebd6a580
Create Date: 2025-11-23 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timedelta


# revision identifiers, used by Alembic.
revision = 'trial_period_2025'
down_revision = 'faceebd6a580'
branch_labels = None
depends_on = None


def upgrade():
    # Adicionar colunas de trial ao Profile
    op.add_column('profiles', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('profiles', sa.Column('trial_ends_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('profiles', sa.Column('is_paid', sa.Boolean(), server_default='false', nullable=False))
    
    # Atualizar usuários existentes com trial de 5 dias a partir de agora
    op.execute(f"""
        UPDATE profiles 
        SET trial_ends_at = NOW() + INTERVAL '5 days',
            is_paid = CASE 
                WHEN email = 'lucas.oliveira@scarletredsolutions.com' THEN true 
                ELSE false 
            END
        WHERE trial_ends_at IS NULL
    """)


def downgrade():
    op.drop_column('profiles', 'is_paid')
    op.drop_column('profiles', 'trial_ends_at')
    op.drop_column('profiles', 'created_at')
