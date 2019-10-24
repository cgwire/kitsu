from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class News(db.Model, BaseMixin, SerializerMixin):
    """
    A notification is stored each time a comment is posted.
    """

    change = db.Column(db.Boolean, nullable=False, default=False)
    author_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("person.id"),
        nullable=False,
        index=True,
    )
    comment_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("comment.id"),
        nullable=True,
        index=True,
    )
    task_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("task.id"),
        nullable=False,
        index=True,
    )
    preview_file_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("preview_file.id"),
        nullable=True,
        index=True,
    )

    @classmethod
    def create_from_import(cls, data):
        data = {
            "id": data["id"],
            "updated_at": data["created_at"],
            "created_at": data["created_at"],
            "change": data["change"],
            "author_id": data["author_id"],
            "comment_id": data["comment_id"],
            "preview_file_id": data["preview_file_id"],
            "task_id": data["task_id"],
        }
        previous_data = cls.get(data["id"])
        if previous_data is None:
            return cls.create(**data)
        else:
            previous_data.update(data)
            return previous_data
