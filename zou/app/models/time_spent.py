from sqlalchemy_utils import UUIDType
from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class TimeSpent(db.Model, BaseMixin, SerializerMixin):
    """
    Describes the time spent by someone on a task.
    """

    duration = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=False)

    task_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("task.id"), index=True
    )
    person_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("person.id"), index=True
    )

    __table_args__ = (
        db.UniqueConstraint(
            "person_id", "task_id", "date", name="time_spent_uc"
        ),
    )
