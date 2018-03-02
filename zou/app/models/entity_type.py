from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class EntityType(db.Model, BaseMixin, SerializerMixin):
    """
    Type of entities. It can describe either an asset type, or tell if target
    entity is a shot, sequence, episode or layout scene.
    """
    name = db.Column(db.String(30), unique=True, nullable=False, index=True)
