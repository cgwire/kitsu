from sqlalchemy_utils import UUIDType
from sqlalchemy.dialects.postgresql import JSONB

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class AssetInstance(db.Model, BaseMixin, SerializerMixin):
    """
    An asset instance is the representation of an asset in a given shot or
    layout scene. It is useful for complex scenes where an asset needs extra
    treatments only related to the given shot or layout scene.
    An asset can have multiple instances in a scene or in a shot (ex: a sword in
    a battle field).
    """

    asset_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity.id"),
        nullable=False,
        index=True,
    )
    name = db.Column(db.String(80))
    number = db.Column(db.Integer())
    description = db.Column(db.String(200))
    active = db.Column(db.Boolean(), default=True)
    data = db.Column(JSONB)

    scene_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("entity.id"), index=True
    )
    target_asset_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("entity.id"), index=True
    )

    __table_args__ = (
        db.UniqueConstraint(
            "asset_id",
            "target_asset_id",
            "scene_id",
            "number",
            name="asset_instance_uc",
        ),
    )

    # Do not use these column. They are deprecated and will be dropped in
    # upcoming version
    entity_id = db.Column(UUIDType(binary=False), db.ForeignKey("entity.id"))
    entity_type_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("entity_type.id")
    )

    def __repr__(self):
        return "<AssetInstance %s>" % self.id
