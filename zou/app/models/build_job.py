import datetime

from sqlalchemy_utils import UUIDType, ChoiceType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin

STATUSES = [
    ("running", "Running"),
    ("failed", "Failed"),
    ("succeeded", "Succeeded"),
]

TYPES = [("archive", "Archive"), ("movie", "Movie")]


class BuildJob(db.Model, BaseMixin, SerializerMixin):
    """
    A build job stores information about the state of the building
    of a given playlist.
    """

    status = db.Column(ChoiceType(STATUSES))
    job_type = db.Column(ChoiceType(TYPES))
    ended_at = db.Column(db.DateTime)

    playlist_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("playlist.id"),
        nullable=False,
        index=True,
    )

    def end(self):
        self.update(
            {"status": "succeeded", "ended_at": datetime.datetime.now()}
        )
