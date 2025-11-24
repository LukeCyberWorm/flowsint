"""merge heads trial and custom types

Revision ID: merge_trial_custom
Revises: trial_period_2025, 8173aba964e7
Create Date: 2025-11-24 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'merge_trial_custom'
down_revision = ('trial_period_2025', '8173aba964e7')
branch_labels = None
depends_on = None


def upgrade():
    # Merge migration - no changes needed
    pass


def downgrade():
    # Merge migration - no changes needed
    pass
