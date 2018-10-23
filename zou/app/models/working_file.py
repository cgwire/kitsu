from sqlalchemy.orm import relationship
from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin

from sqlalchemy.dialects.postgresql import JSONB


class WorkingFile(db.Model, BaseMixin, SerializerMixin):
    """
    Describes the file related to the work done on a given task. It is
    used as source of output files published for a given entity.
    """
    shotgun_id = db.Column(db.Integer(), index=True)

    name = db.Column(db.String(250))
    description = db.Column(db.String(200))
    comment = db.Column(db.Text())
    revision = db.Column(db.Integer())
    size = db.Column(db.Integer())
    checksum = db.Column(db.Integer())
    path = db.Column(db.String(400))
    data = db.Column(JSONB)

    task_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("task.id"),
        index=True
    )
    entity_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("entity.id"),
        index=True
    )
    person_id = \
        db.Column(UUIDType(binary=False), db.ForeignKey("person.id"))
    software_id = \
        db.Column(UUIDType(binary=False), db.ForeignKey("software.id"))
    outputs = relationship(
        "OutputFile",
        back_populates="source_file"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "name",
            "task_id",
            "entity_id",
            "revision",
            name="working_file_uc"
        ),
    )

    def __repr__(self):
        return "<WorkingFile %s>" % self.id
