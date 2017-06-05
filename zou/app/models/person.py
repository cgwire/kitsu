import sys

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin

from sqlalchemy_utils import EmailType, UUIDType
from sqlalchemy.dialects.postgresql import JSONB


department_link = db.Table(
    'department_link',
    db.Column(
        'person_id',
        UUIDType(binary=False),
        db.ForeignKey('person.id')
    ),
    db.Column(
        'department_id',
        UUIDType(binary=False),
        db.ForeignKey('department.id')
    )
)


class Person(db.Model, BaseMixin, SerializerMixin):

    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(EmailType, unique=True)
    phone = db.Column(db.String(30))
    active = db.Column(db.Boolean(), default=True)
    last_presence = db.Column(db.Date())
    password = db.Column(db.Binary(60))
    shotgun_id = db.Column(db.Integer, unique=True)
    data = db.Column(JSONB)

    skills = db.relationship(
        'Department',
        secondary=department_link
    )

    def __repr__(self):
        return "<Person %s>" % self.full_name()

    def full_name(self):
        if sys.version_info[0] < 3:
            return "%s %s" % (
                self.first_name.encode("utf-8"),
                self.last_name.encode("utf-8")
            )
        else:
            return "%s %s" % (
                self.first_name,
                self.last_name
            )
