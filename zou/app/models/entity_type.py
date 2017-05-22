from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class EntityType(db.Model, BaseMixin, SerializerMixin):
    name = db.Column(db.String(30), unique=True, nullable=False)
