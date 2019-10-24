from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin
from zou.app.utils import fields


class ScheduleItem(db.Model, BaseMixin, SerializerMixin):
    """
    Allow to set a start date and an end date for a task type and a project.
    This information allows to build a schedule for the project.
    """

    start_date = db.Column(db.Date())
    end_date = db.Column(db.Date())
    man_days = db.Column(db.Integer)

    project_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("project.id"), index=True
    )
    task_type_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("task_type.id"), index=True
    )
    object_id = db.Column(
        UUIDType(binary=False), index=True
    )  # Sequence or Episode or Asset Type

    def present(self):
        return fields.serialize_dict(
            {
                "id": self.id,
                "start_date": self.start_date,
                "end_date": self.end_date,
                "man_days": self.man_days,
                "project_id": self.project_id,
                "task_type_id": self.task_type_id,
                "object_id": self.object_id,
            }
        )
