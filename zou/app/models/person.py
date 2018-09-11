import sys

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin

from sqlalchemy_utils import UUIDType, EmailType, LocaleType, TimezoneType
from sqlalchemy.dialects.postgresql import JSONB

from pytz import timezone as pytz_timezone
from babel import Locale


department_link = db.Table(
    "department_link",
    db.Column(
        "person_id",
        UUIDType(binary=False),
        db.ForeignKey("person.id")
    ),
    db.Column(
        "department_id",
        UUIDType(binary=False),
        db.ForeignKey("department.id")
    )
)


class Person(db.Model, BaseMixin, SerializerMixin):
    """
    Describe a member of the studio (and an API user).
    """
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(EmailType, unique=True)
    phone = db.Column(db.String(30))

    active = db.Column(db.Boolean(), default=True)
    last_presence = db.Column(db.Date())

    password = db.Column(db.Binary(60))
    desktop_login = db.Column(db.String(80))
    shotgun_id = db.Column(db.Integer, unique=True)
    timezone = db.Column(
        TimezoneType(backend="pytz"),
        default=pytz_timezone("Europe/Paris")
    )
    locale = db.Column(LocaleType, default=Locale("en", "US"))
    data = db.Column(JSONB)
    role = db.Column(db.String(30), default="user")
    has_avatar = db.Column(db.Boolean(), default=False)

    skills = db.relationship(
        "Department",
        secondary=department_link
    )

    def __repr__(self):
        if sys.version_info[0] < 3:
            return "<Person %s>" % self.full_name().encode("utf-8")
        else:
            return "<Person %s>" % self.full_name()

    def full_name(self):
        return "%s %s" % (
            self.first_name,
            self.last_name
        )

    def serialize(self, obj_type="Person"):
        data = SerializerMixin.serialize(self, "Person")
        data["full_name"] = self.full_name()
        return data

    def serialize_safe(self):
        data = SerializerMixin.serialize(self, "Person")
        data["full_name"] = self.full_name()
        del data["password"]
        return data

    def serialize_without_info(self):
        data = self.serialize_safe()
        del data["phone"]
        del data["email"]
        return data
