from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin
from zou.app.utils import fields


class Organisation(db.Model, BaseMixin, SerializerMixin):
    """
    Model to represent current organisation settings.
    """

    name = db.Column(db.String(80), unique=True, nullable=False)
    hours_by_day = db.Column(db.Integer(), default=8, nullable=False)
    has_avatar = db.Column(db.Boolean(), default=False)
    use_original_file_name = db.Column(db.Boolean(), default=False)
    chat_token_slack = db.Column(db.String(80), default="")

    def present(self):
        return fields.serialize_dict(
            {
                "id": self.id,
                "name": self.name,
                "has_avatar": self.has_avatar,
                "hours_by_day": self.hours_by_day,
                "use_original_file_name": self.use_original_file_name,
                "chat_token_slack": self.chat_token_slack,
            }
        )
