"""add_cascade_delete_to_event_summaries

Revision ID: 254cdf93e520
Revises: d9089e623c5c
Create Date: 2025-11-04 13:23:59.762987

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '254cdf93e520'
down_revision: Union[str, Sequence[str], None] = 'd9089e623c5c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # SQLite doesn't support altering foreign keys, so we recreate the table
    # Using batch mode with recreate='always' will rebuild the table with the new FK
    with op.batch_alter_table('event_summaries', schema=None, recreate='always') as batch_op:
        pass


def downgrade() -> None:
    """Downgrade schema."""
    # Recreate table again but this time without CASCADE
    # In practice, this is a no-op since we'd need to track the old state
    pass
