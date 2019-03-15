from sqlalchemy_utils import UUIDType
from sqlalchemy.dialects.postgresql import JSONB

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


preview_link_table = db.Table(
    "comment_preview_link",
    db.Column(
        "comment",
        UUIDType(binary=False),
        db.ForeignKey("comment.id"),
        primary_key=True
    ),
    db.Column(
        "preview_file",
        UUIDType(binary=False),
        db.ForeignKey("preview_file.id"),
        primary_key=True
    )
)


mentions_table = db.Table(
    "comment_mentions",
    db.Column(
        "comment",
        UUIDType(binary=False),
        db.ForeignKey("comment.id"),
        primary_key=True
    ),
    db.Column(
        "person",
        UUIDType(binary=False),
        db.ForeignKey("person.id"),
        primary_key=True
    )
)



class Comment(db.Model, BaseMixin, SerializerMixin):
    """
    Comment can occurs on any object but they are mainly used on tasks.
    In the case of comment tasks, they are linked to a task status and
    eventually on a preview file.
    The status means that comment leads to task status change. The preview file
    means that the comment relates to this preview in the context of the task.
    """
    shotgun_id = db.Column(db.Integer)

    object_id = db.Column(UUIDType(binary=False), nullable=False, index=True)
    object_type = db.Column(db.String(80), nullable=False, index=True)
    text = db.Column(db.Text())
    data = db.Column(JSONB)

    task_status_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("task_status.id")
    )
    person_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("person.id"),
        nullable=False
    )
    preview_file_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("preview_file.id")
    )
    previews = db.relationship(
        "PreviewFile",
        secondary=preview_link_table,
        backref="comments"
    )
    mentions = db.relationship(
        "Person",
        secondary=mentions_table
    )

    def __repr__(self):
        return "<Comment of %s>" % self.object_id
