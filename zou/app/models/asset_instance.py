from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class AssetInstance(db.Model, BaseMixin, SerializerMixin):
    asset_id = db.Column(UUIDType(binary=False), db.ForeignKey('entity.id'))
    shot_id = db.Column(UUIDType(binary=False), db.ForeignKey('entity.id'))
    number = db.Column(db.Integer())
    description = db.Column(db.String(200))

    __table_args__ = (
        db.UniqueConstraint(
            'asset_id',
            'shot_id',
            'number',
            name='asset_instance_uc'
        ),
    )

    def __repr__(self):
        return "<AssetInstance %s>" % self.id
