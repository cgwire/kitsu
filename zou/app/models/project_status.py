from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class ProjectStatus(db.Model, BaseMixin, SerializerMixin):
    """
    Describes the state of the project (mainly open or closed).
    """
    name = db.Column(db.String(20), unique=True, nullable=False, index=True)
    color = db.Column(db.String(7), nullable=False)
