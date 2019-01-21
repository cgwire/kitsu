from sqlalchemy_utils import UUIDType
from sqlalchemy.dialects.postgresql import JSONB

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class MetadataDescriptor(db.Model, BaseMixin, SerializerMixin):
    """
    This models allow to identify which metadata are available for a given
    project and a given entity type.
    """
    project_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('project.id'),
        nullable=False,
        index=True
    )
    entity_type = db.Column(db.String(60), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    field_name = db.Column(db.String(120), nullable=False)
    choices = db.Column(JSONB)

    __table_args__ = (
        db.UniqueConstraint(
            'project_id',
            'entity_type',
            'name',
            name='metadata_descriptor_uc'
        ),
    )

    def __repr__(self):
        return "<MetadataDescriptor %s>" % self.id
