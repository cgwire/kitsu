from sqlalchemy.dialects.postgresql import JSONB

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class DataImportError(db.Model, BaseMixin, SerializerMixin):
    event_data = db.Column(JSONB, nullable=False)
    source = db.Column(db.Enum("csv", "shotgun", name="import_source_enum"))
