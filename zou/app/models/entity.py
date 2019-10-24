from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin
from zou.app.utils import fields

from sqlalchemy.dialects.postgresql import JSONB


class AssetInstanceLink(db.Model):
    __tablename__ = "asset_instance_link"
    entity_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("entity.id"), primary_key=True
    )
    asset_instance_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("asset_instance.id"),
        primary_key=True,
    )


class EntityLink(db.Model, BaseMixin, SerializerMixin):
    __tablename__ = "entity_link"
    entity_in_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("entity.id"), primary_key=True
    )
    entity_out_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("entity.id"), primary_key=True
    )
    nb_occurences = db.Column(db.Integer, default=1)
    label = db.Column(db.String(80), default="")

    @classmethod
    def create_from_import(cls, data):
        del data["type"]
        if "project_name" in data:
            del data["project_name"]
        entity_link = cls.get_by(
            entity_in_id=data["entity_in_id"],
            entity_out_id=data["entity_out_id"],
        )
        if entity_link is None:
            return cls.create(**data)
        else:
            entity_link.update(data)
            return entity_link


class Entity(db.Model, BaseMixin, SerializerMixin):
    """
    Base model to represent assets, shots, sequences, episodes and scenes.
    They have different meaning but they share the same behaviour toward
    tasks and files.
    """

    id = db.Column(
        UUIDType(binary=False), primary_key=True, default=fields.gen_uuid
    )

    name = db.Column(db.String(160), nullable=False)
    code = db.Column(db.String(160))  # To store sanitized version of name
    description = db.Column(db.String(1200))
    shotgun_id = db.Column(db.Integer)
    canceled = db.Column(db.Boolean, default=False)

    nb_frames = db.Column(db.Integer)  # Specific to shots

    project_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("project.id"),
        nullable=False,
        index=True,
    )
    entity_type_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity_type.id"),
        nullable=False,
        index=True,
    )

    parent_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("entity.id"), index=True
    )  # sequence or episode

    source_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity.id"),
        index=True,
        nullable=True,
    )  # if the entity is generated from another one (like shots from scene).

    preview_file_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("preview_file.id", name="fk_main_preview"),
    )
    data = db.Column(JSONB)

    entities_out = db.relationship(
        "Entity",
        secondary="entity_link",
        primaryjoin=(id == EntityLink.entity_in_id),
        secondaryjoin=(id == EntityLink.entity_out_id),
        backref="entities_in",
    )

    instance_casting = db.relationship(
        "AssetInstance", secondary="asset_instance_link", backref="shots"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "name",
            "project_id",
            "entity_type_id",
            "parent_id",
            name="entity_uc",
        ),
    )

    def set_entities_out(self, entity_ids):
        self.entities_out = []
        for entity_id in entity_ids:
            entity = Entity.get(entity_id)
            if entity is not None:
                self.entities_out.append(entity)
        self.save()

    @classmethod
    def create_from_import(cls, data):
        previous_entity = cls.get(data["id"])
        (data, entity_ids) = cls.sanitize_import_data(data)

        if previous_entity is None:
            previous_entity = cls.create(**data)
            previous_entity.save()
        else:
            previous_entity.update(data)
            previous_entity.save()

        if entity_ids is not None:
            previous_entity.set_entities_out(entity_ids)

        return previous_entity

    @classmethod
    def sanitize_import_data(self, data):
        from zou.app.models.preview_file import PreviewFile
        from zou.app.models.entity_type import EntityType

        entity_ids = []
        model_type = data.get("type", "Shot")

        if "entities_out" in data:
            entity_ids = data["entities_out"]
            del data["entities_out"]

        if "asset_type_id" in data:
            data["entity_type_id"] = data["asset_type_id"]
            del data["asset_type_id"]
            del data["asset_type_name"]

        if "sequence_id" in data:
            data["parent_id"] = data["sequence_id"]
            del data["sequence_id"]

        if (
            "preview_file_id" in data
            and data["preview_file_id"] is not None
            and len(data["preview_file_id"]) > 0
        ):
            preview_file = PreviewFile.get(data["preview_file_id"])
            if preview_file is None:
                del data["preview_file_id"]
        elif "preview_file_id" in data:
            del data["preview_file_id"]

        if "frame_in" in data:
            data["data"]["frame_in"] = data["frame_in"]
            del data["frame_in"]

        if "frame_out" in data:
            data["data"]["frame_out"] = data["frame_out"]
            del data["frame_out"]

        if "fps" in data:
            data["data"]["fps"] = data["fps"]
            del data["fps"]

        for field in [
            "entities_in",
            "episode_id",
            "episode_name",
            "project_name",
            "sequence_name",
            "tasks",
            "type",
        ]:
            if field in data:
                del data[field]

        if model_type in ["Shot", "Sequence", "Episode"]:
            entity_type = EntityType.get_by(name=model_type)
            data["entity_type_id"] = entity_type.id

        return (data, entity_ids)
