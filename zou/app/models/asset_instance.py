from sqlalchemy_utils import UUIDType
from sqlalchemy.dialects.postgresql import JSONB

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class AssetInstance(db.Model, BaseMixin, SerializerMixin):
    asset_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('entity.id'),
        nullable=False
    )
    entity_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('entity.id'),
        nullable=False
    )
    entity_type_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('entity_type.id'),
        nullable=False
    )
    number = db.Column(db.Integer())
    description = db.Column(db.String(200))
    data = db.Column(JSONB)

    __table_args__ = (
        db.UniqueConstraint(
            'asset_id',
            'entity_id',
            'number',
            name='asset_instance_uc'
        ),
    )

    def __repr__(self):
        return "<AssetInstance %s>" % self.id
