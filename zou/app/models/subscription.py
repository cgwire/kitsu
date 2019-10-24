from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class Subscription(db.Model, BaseMixin, SerializerMixin):
    """
    Allow to subscribe to an entity
    """

    person_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("person.id"),
        nullable=False,
        index=True,
    )
    task_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("task.id"), index=True
    )

    entity_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("entity.id"), index=True
    )
    task_type_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("task_type.id"), index=True
    )

    __table_args__ = (
        db.UniqueConstraint(
            "person_id", "task_id", name="subscription_task_uc"
        ),
        db.UniqueConstraint(
            "person_id",
            "task_type_id",
            "entity_id",
            name="subscription_entity_uc",
        ),
    )
