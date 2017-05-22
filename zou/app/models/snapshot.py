from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class Snapshot(db.Model, BaseMixin, SerializerMixin):
    revision = db.Column(db.Integer())
    working_file_id = \
        db.Column(UUIDType(binary=False), db.ForeignKey("working_file_id"))

    __table_args__ = (
        db.UniqueConstraint(
            "revision",
            "working_file_id",
            name="snapshot_uc"
        ),
    )
