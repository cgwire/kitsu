from sqlalchemy_utils import UUIDType
from sqlalchemy.dialects.postgresql import JSONB

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class Playlist(db.Model, BaseMixin, SerializerMixin):
    """
    Describes a playlist. The goal is to discuss around a defined set of
    shipped materials in a meeting.
    """
    name = db.Column(db.String(80), nullable=False)
    shots = db.Column(JSONB)

    project_id = db.Column(UUIDType(binary=False), db.ForeignKey('project.id'))
    episode_id = db.Column(UUIDType(binary=False), db.ForeignKey('entity.id'))

    __table_args__ = (
        db.UniqueConstraint(
            'name',
            'project_id',
            'episode_id',
            name='playlist_uc'
        ),
    )
