from sqlalchemy_utils import UUIDType, IPAddressType, ChoiceType

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin

ORIGINS = [("web", "Web"), ("script", "Script")]


class LoginLog(db.Model, BaseMixin, SerializerMixin):
    """
    Table to log all web session logins. The aim is to build a table that
    helps finding suspicious behaviours.
    """

    person_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey("person.id"),
        nullable=False,
        index=True,
    )
    ip_address = db.Column(IPAddressType)
    origin = db.Column(ChoiceType(ORIGINS))
