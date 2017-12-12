from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class CustomAction(db.Model, BaseMixin, SerializerMixin):
    name = db.Column(db.String(80), nullable=False)
    url = db.Column(db.String(400))
    entity_type = db.Column(db.String(40), default="all")
