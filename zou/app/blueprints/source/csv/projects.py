from zou.app.blueprints.source.csv.base import BaseCsvImportResource

from zou.app.services import projects_service
from zou.app.models.project import Project

from sqlalchemy.exc import IntegrityError


class ProjectsCsvImportResource(BaseCsvImportResource):

    def prepare_import(self):
        self.project_statuses = {}

    def import_row(self, row):
        name = row["Name"]
        project_status_name = row["Status"]

        self.add_to_cache_if_absent(
            self.project_statuses,
            projects_service.get_or_create_status,
            project_status_name
        )
        project_status_id = self.get_id_from_cache(
            self.project_statuses,
            project_status_name
        )

        try:
            project = Project.create(
                name=name,
                project_status_id=project_status_id
            )
        except IntegrityError:
            project = Project.get_by(name=name)

        return project
