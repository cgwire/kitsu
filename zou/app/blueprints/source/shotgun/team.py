from flask_restful import current_app

from zou.app.models.project import Project
from zou.app.models.project import ProjectPersonLink
from zou.app.models.person import Person

from zou.app.blueprints.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource,
)


class ImportShotgunProjectConnectionsResource(BaseImportShotgunResource):
    def __init__(self):
        BaseImportShotgunResource.__init__(self)

    def prepare_import(self):
        pass

    def extract_data(self, sg_project_user_connection):
        sg_project = sg_project_user_connection["project"]
        sg_user = sg_project_user_connection["user"]

        data = {
            "shotgun_id": sg_project_user_connection["id"],
            "project_shotgun_id": sg_project["id"],
            "person_shotgun_id": sg_user["id"],
        }
        return data

    def import_entry(self, data):
        project_person_link = ProjectPersonLink.query.filter(
            ProjectPersonLink.shotgun_id == data["shotgun_id"]
        ).first()

        if project_person_link is None:
            project = Project.get_by(shotgun_id=data["project_shotgun_id"])
            person = Person.get_by(shotgun_id=data["person_shotgun_id"])

            if project is not None and person is not None:
                project.team.append(person)
                project.save()
                current_app.logger.info(
                    "Project Person Link created: %s" % project
                )
        else:
            project.update(data)
            current_app.logger.info("Project updated: %s" % project)

        return project


class ImportRemoveShotgunProjectConnectionResource(
    ImportRemoveShotgunBaseResource
):
    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(self, ProjectPersonLink)
