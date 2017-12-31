from sqlalchemy.orm import relationship
from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class OutputFile(db.Model, BaseMixin, SerializerMixin):
    shotgun_id = db.Column(db.Integer())

    name = db.Column(db.String(250))
    extension = db.Column(db.String(10))
    description = db.Column(db.Text())
    comment = db.Column(db.Text())
    revision = db.Column(db.Integer())
    size = db.Column(db.Integer())
    checksum = db.Column(db.Integer())
    source = db.Column(db.String(40))
    path = db.Column(db.String(400))

    uploaded_movie_url = db.Column(db.String(600))
    uploaded_movie_name = db.Column(db.String(150))

    file_status_id = \
        db.Column(
            UUIDType(binary=False),
            db.ForeignKey("file_status.id"),
            nullable=False
        )

    task_id = db.Column(UUIDType(binary=False), db.ForeignKey("task.id"))
    entity_id = db.Column(UUIDType(binary=False), db.ForeignKey("entity.id"))
    person_id = db.Column(UUIDType(binary=False), db.ForeignKey("person.id"))
    output_type_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("output_type.id")
    )
    source_file_id = \
        db.Column(
            UUIDType(binary=False),
            db.ForeignKey("working_file.id"),
        )
    source_file = relationship(
        "WorkingFile",
        back_populates="outputs"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "name",
            "entity_id",
            "output_type_id",
            "revision",
            name="output_file_uc"
        ),
    )

    def __repr__(self):
        return "<OutputFile %s>" % self.id
