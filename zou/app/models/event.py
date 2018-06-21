from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin

from sqlalchemy.dialects.postgresql import JSONB


class Event(db.Model, BaseMixin, SerializerMixin):
    """
    Represent notable events occuring on database.
    """
    project_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("project.id"),
        nullable=False,
        index=True
    )
    person_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("person.id"),
        nullable=False,
        index=True
    )
    even_data = db.Column(JSONB)
