from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class SearchFilter(db.Model, BaseMixin, SerializerMixin):
    """
    Filters allow to store quick search on a list: asset list, shot list,
    sequence list, todo-list...
    """

    list_type = db.Column(db.String(80), nullable=False, index=True)
    entity_type = db.Column(db.String(80))
    name = db.Column(db.String(200), nullable=False, default="")
    search_query = db.Column(db.String(200), nullable=False, default="")

    person_id = db.Column(UUIDType(binary=False), db.ForeignKey("person.id"))
    project_id = db.Column(UUIDType(binary=False), db.ForeignKey("project.id"))
