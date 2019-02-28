from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin
from zou.app.utils import fields

from sqlalchemy.dialects.postgresql import JSONB


class AssetInstanceLink(db.Model):
    __tablename__ = "asset_instance_link"
    entity_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity.id"),
        primary_key=True
    )
    asset_instance_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("asset_instance.id"),
        primary_key=True
    )


class EntityLink(db.Model, BaseMixin):
    __tablename__ = "entity_link"
    entity_in_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity.id"),
        primary_key=True
    )
    entity_out_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity.id"),
        primary_key=True
    )
    nb_occurences = db.Column(db.Integer, default=1)


class Entity(db.Model, BaseMixin, SerializerMixin):
    """
    Base model to represent assets, shots, sequences, episodes and scenes.
    They have different meaning but they share the same behaviour toward
    tasks and files.
    """
    id = db.Column(
        UUIDType(binary=False),
        primary_key=True,
        default=fields.gen_uuid
    )

    name = db.Column(db.String(160), nullable=False)
    code = db.Column(db.String(160))  # To store sanitized version of name
    description = db.Column(db.String(600))
    shotgun_id = db.Column(db.Integer)
    canceled = db.Column(db.Boolean, default=False)

    nb_frames = db.Column(db.Integer)  # Specific to shots

    project_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("project.id"),
        nullable=False,
        index=True
    )
    entity_type_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity_type.id"),
        nullable=False,
        index=True
    )

    parent_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity.id"),
        index=True
    )  # sequence or episode

    source_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity.id"),
        index=True,
        nullable=True
    )  # if the entity is generated from another one (like shots from scene).

    preview_file_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("preview_file.id", name="fk_main_preview")
    )
    data = db.Column(JSONB)

    entities_out = db.relationship(
        "Entity",
        secondary="entity_link",
        primaryjoin=(id == EntityLink.entity_in_id),
        secondaryjoin=(id == EntityLink.entity_out_id),
        backref="entities_in"
    )

    instance_casting = db.relationship(
        "AssetInstance",
        secondary="asset_instance_link",
        backref="shots"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "name",
            "project_id",
            "entity_type_id",
            "parent_id",
            name="entity_uc"
        ),
    )
