from sqlalchemy_utils import UUIDType, ChoiceType
from sqlalchemy.inspection import inspect

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.utils.fields import serialize_value
from zou.app.models.base import BaseMixin

TYPES = [
    ('comment', 'Comment'),
    ('mention', 'Mention'),
    ('assignation', 'Assignation')
]

class Notification(db.Model, BaseMixin, SerializerMixin):
    """
    A notification is stored each time a comment is posted.
    """
    read = db.Column(db.Boolean, nullable=False, default=False)
    change = db.Column(db.Boolean, nullable=False, default=False)
    type = db.Column(ChoiceType(TYPES))
    person_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('person.id'),
        nullable=False,
        index=True
    )
    author_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('person.id'),
        nullable=False,
        index=True
    )
    comment_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('comment.id'),
        nullable=True,
        index=True
    )
    task_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('task.id'),
        nullable=False,
        index=True
    )

    __table_args__ = (
        db.UniqueConstraint(
            'person_id',
            'author_id',
            'comment_id',
            'type',
            name='notification_uc'
        ),
    )

    def serialize(self, obj_type=None):
        attrs = inspect(self).attrs.keys()
        obj_dict = {
            attr: serialize_value(getattr(self, attr)) for attr in attrs
        }
        obj_dict["notitfication_type"] = obj_dict["type"]
        obj_dict["type"] = obj_type or type(self).__name__
        return obj_dict
