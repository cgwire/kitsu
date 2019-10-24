from zou.app.blueprints.export.csv.base import BaseCsvExport

from zou.app.models.project_status import ProjectStatus
from zou.app.models.project import Project


class ProjectsCsvExport(BaseCsvExport):
    def __init__(self):
        BaseCsvExport.__init__(self, Project)

    def build_headers(self):
        return ["Name", "Status"]

    def build_query(self):
        query = self.model.query.join(ProjectStatus)
        query = query.add_columns(ProjectStatus.name)
        query = query.order_by(Project.name)
        return query

    def build_row(self, project_data):
        (project, project_status_name) = project_data
        return [project.name, project_status_name]
