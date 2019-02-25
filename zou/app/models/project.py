from sqlalchemy_utils import UUIDType
from sqlalchemy.dialects.postgresql import JSONB

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class ProjectPersonLink(db.Model):
    __tablename__ = "project_person_link"
    project_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("project.id"),
        primary_key=True
    )
    person_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("person.id"),
        primary_key=True
    )
    shotgun_id = db.Column(db.Integer)


class Project(db.Model, BaseMixin, SerializerMixin):
    """
    Describes a CG production the studio works on.
    """
    name = db.Column(db.String(80), nullable=False, unique=True, index=True)
    code = db.Column(db.String(80))
    description = db.Column(db.String(200))
    shotgun_id = db.Column(db.Integer)
    file_tree = db.Column(JSONB)
    data = db.Column(JSONB)
    has_avatar = db.Column(db.Boolean(), default=False)
    fps = db.Column(db.String(10))
    ratio = db.Column(db.String(10))
    resolution = db.Column(db.String(12))
    production_type = db.Column(db.String(20), default="short")

    project_status_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('project_status.id'),
        index=True
    )

    team = db.relationship(
        "Person",
        secondary="project_person_link"
    )
