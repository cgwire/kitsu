from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class Department(db.Model, BaseMixin, SerializerMixin):
    """
    Studio department like modeling, animation, etc.
    """
    name = db.Column(db.String(80), unique=True, nullable=False)
    color = db.Column(db.String(7), nullable=False)
