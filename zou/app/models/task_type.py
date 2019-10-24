from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class TaskType(db.Model, BaseMixin, SerializerMixin):
    """
    Categorize tasks in domain areas: modeling, animation, etc.
    """

    name = db.Column(db.String(40), nullable=False)
    short_name = db.Column(db.String(20))
    color = db.Column(db.String(7), default="#FFFFFF")
    priority = db.Column(db.Integer, default=1)
    for_shots = db.Column(db.Boolean, default=False)
    for_entity = db.Column(db.String(30), default="Asset")
    allow_timelog = db.Column(db.Boolean, default=True)
    shotgun_id = db.Column(db.Integer, index=True)

    department_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("department.id")
    )

    __table_args__ = (
        db.UniqueConstraint(
            "name", "for_entity", "department_id", name="task_type_uc"
        ),
    )
