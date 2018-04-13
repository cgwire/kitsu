from sqlalchemy_utils import UUIDType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class PreviewFile(db.Model, BaseMixin, SerializerMixin):
    """
    Describes a file which is aimed at being reviewed. It is not a publication
    neither a working file.
    """
    name = db.Column(db.String(250))
    revision = db.Column(db.Integer(), default=1)
    description = db.Column(db.Text())
    path = db.Column(db.String(400))

    source = db.Column(db.String(40))
    shotgun_id = db.Column(db.Integer, unique=True)

    is_movie = db.Column(db.Boolean, default=False)

    url = db.Column(db.String(600))
    uploaded_movie_url = db.Column(db.String(600))
    uploaded_movie_name = db.Column(db.String(150))

    task_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("task.id"),
        index=True
    )
    person_id = db.Column(UUIDType(binary=False), db.ForeignKey("person.id"))

    source_file_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("output_file.id")
    )

    __table_args__ = (
        db.UniqueConstraint(
            "name",
            "task_id",
            "revision",
            name="preview_uc"
        ),
    )

    def __repr__(self):
        return "<PreviewFile %s>" % self.id
