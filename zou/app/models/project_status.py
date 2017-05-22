from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class ProjectStatus(db.Model, BaseMixin, SerializerMixin):
    name = db.Column(db.String(20), unique=True, nullable=False)
    color = db.Column(db.String(7), nullable=False)
