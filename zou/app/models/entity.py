from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin
from zou.app.utils import fields

from sqlalchemy.dialects.postgresql import JSONB


entity_link = db.Table(
    'entity_link',
    db.Column(
        'entity_in_id',
        UUIDType(binary=False),
        db.ForeignKey('entity.id')
    ),
    db.Column(
        'entity_out_id',
        UUIDType(binary=False),
        db.ForeignKey('entity.id')
    )
)


class Entity(db.Model, BaseMixin, SerializerMixin):
    id = db.Column(
        UUIDType(binary=False),
        primary_key=True,
        default=fields.gen_uuid
    )

    name = db.Column(db.String(160), nullable=False)
    description = db.Column(db.String(600))
    shotgun_id = db.Column(db.Integer)
    canceled = db.Column(db.Boolean, default=False)

    project_id = db.Column(
        UUIDType(binary=False), db.ForeignKey('project.id'), nullable=False)
    entity_type_id = db.Column(
        UUIDType(binary=False), db.ForeignKey('entity_type.id'), nullable=False)
    parent_id = db.Column(
        UUIDType(binary=False), db.ForeignKey('entity.id'))
    data = db.Column(JSONB)

    entities_out = db.relationship(
        'Entity',
        secondary=entity_link,
        primaryjoin=(id == entity_link.c.entity_in_id),
        secondaryjoin=(id == entity_link.c.entity_out_id)
    )

    __table_args__ = (
        db.UniqueConstraint(
            'name',
            'project_id',
            'entity_type_id',
            'parent_id',
            name='entity_uc'
        ),
    )
