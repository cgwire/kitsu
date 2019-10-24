from sqlalchemy_utils import UUIDType
from sqlalchemy.dialects.postgresql import JSONB

from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


class ProjectPersonLink(db.Model):
    __tablename__ = "project_person_link"
    project_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("project.id"), primary_key=True
    )
    person_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("person.id"), primary_key=True
    )
    shotgun_id = db.Column(db.Integer)


class Project(db.Model, BaseMixin, SerializerMixin):
    """
    Describes a CG production the studio works on.
    """

    name = db.Column(db.String(80), nullable=False, unique=True, index=True)
    code = db.Column(db.String(80))
    description = db.Column(db.String(200))
    shotgun_id = db.Column(db.Integer)
    file_tree = db.Column(JSONB)
    data = db.Column(JSONB)
    has_avatar = db.Column(db.Boolean(), default=False)
    fps = db.Column(db.String(10))
    ratio = db.Column(db.String(10))
    resolution = db.Column(db.String(12))
    production_type = db.Column(db.String(20), default="short")
    start_date = db.Column(db.Date())
    end_date = db.Column(db.Date())
    man_days = db.Column(db.Integer)

    project_status_id = db.Column(
        UUIDType(binary=False), db.ForeignKey("project_status.id"), index=True
    )

    team = db.relationship("Person", secondary="project_person_link")

    def set_team(self, person_ids):
        for person_id in person_ids:
            link = ProjectPersonLink.query.filter_by(
                project_id=self.id, person_id=person_id
            ).first()
            if link is None:
                link = ProjectPersonLink(
                    project_id=self.id, person_id=person_id
                )
                db.session.add(link)
        db.session.commit()

    @classmethod
    def create_from_import(cls, data):
        previous_project = cls.get(data["id"])
        person_ids = data.get("team", None)
        del data["team"]
        del data["type"]

        if "project_status_name" in data:
            del data["project_status_name"]

        if previous_project is None:
            previous_project = cls.create(**data)
            previous_project.save()
        else:
            previous_project.update(data)
            previous_project.save()

        if person_ids is not None:
            previous_project.set_team(person_ids)

        return previous_project
