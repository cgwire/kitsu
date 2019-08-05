"""add_slack_fields

Revision ID: 5c0498e264bc
Revises: 9f8445f9b42c
Create Date: 2019-08-04 19:37:10.284171

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy_utils


# revision identifiers, used by Alembic.
revision = '5c0498e264bc'
down_revision = '9f8445f9b42c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('person', sa.Column('notifications_slack_enabled', sa.Boolean(), nullable=True))
    op.add_column('person', sa.Column('notifications_slack_userid', sa.String(length=60), nullable=True))


def downgrade():
    op.drop_column('person', 'notifications_slack_userid')
    op.drop_column('person', 'notifications_slack_enabled')
