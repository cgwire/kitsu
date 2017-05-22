from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class WorkingFile(db.Model, BaseMixin, SerializerMixin):
    shotgun_id = db.Column(db.Integer())

    name = db.Column(db.String(250))
    description = db.Column(db.String(200))
    comment = db.Column(db.Text())
    revision = db.Column(db.Integer())
    size = db.Column(db.Integer())
    checksum = db.Column(db.Integer())

    task_id = db.Column(UUIDType(binary=False), db.ForeignKey("task.id"))
    entity_id = db.Column(UUIDType(binary=False), db.ForeignKey("entity.id"))
    person_id = \
        db.Column(UUIDType(binary=False), db.ForeignKey("person.id"))

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
