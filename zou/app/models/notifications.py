from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class Notification(db.Model, BaseMixin, SerializerMixin):
    """
    A notification is stored each time a comment is posted.
    """
    read = db.Column(db.Boolean, nullable=False, default=False)
    change = db.Column(db.Boolean, nullable=False, default=False)
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
        nullable=False,
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
            name='notification_uc'
        ),
    )
