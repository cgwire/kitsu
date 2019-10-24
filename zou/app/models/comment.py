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
        primary_key=True,
    ),
    db.Column(
        "preview_file",
        UUIDType(binary=False),
        db.ForeignKey("preview_file.id"),
        primary_key=True,
    ),
)


mentions_table = db.Table(
    "comment_mentions",
    db.Column(
        "comment",
        UUIDType(binary=False),
        db.ForeignKey("comment.id"),
        primary_key=True,
    ),
    db.Column(
        "person",
        UUIDType(binary=False),
        db.ForeignKey("person.id"),
        primary_key=True,
    ),
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
    checklist = db.Column(JSONB)
    pinned = db.Column(db.Boolean)

    task_status_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("task_status.id")
    )
    person_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("person.id"), nullable=False
    )
    preview_file_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("preview_file.id")
    )
    previews = db.relationship(
        "PreviewFile", secondary=preview_link_table, backref="comments"
    )
    mentions = db.relationship("Person", secondary=mentions_table)

    def __repr__(self):
        return "<Comment of %s>" % self.object_id

    def set_preview_files(self, preview_file_ids):
        from zou.app.models.preview_file import PreviewFile

        self.preview_files = []
        for preview_file_id in preview_file_ids:
            preview_file = PreviewFile.get(preview_file_id)
            if preview_file is not None:
                self.previews.append(preview_file)
        self.save()

    def set_mentions(self, person_ids):
        from zou.app.models.person import Person

        self.mentions = []
        for person_id in person_ids:
            person = Person.get(person_id)
            if person is not None:
                self.mentions.append(person)
        self.save()

    @classmethod
    def create_from_import(cls, data):
        previous_comment = cls.get(data["id"])
        preview_file_ids = data.get("previews", None)
        mention_ids = data.get("mentions", None)
        del data["previews"]
        del data["mentions"]
        del data["type"]

        if previous_comment is None:
            previous_comment = cls.create(**data)
            previous_comment.save()
        else:
            previous_comment.update(data)
            previous_comment.save()

        if preview_file_ids is not None:
            previous_comment.set_preview_files(preview_file_ids)

        if mention_ids is not None:
            previous_comment.set_mentions(mention_ids)

        return previous_comment
