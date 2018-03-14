from zou.app.models.project import Project
from zou.app.services import user_service, projects_service

from .base import BaseModelResource, BaseModelsResource


class ProjectsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Project)


class ProjectResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Project)

    def check_read_permissions(self, project):
        user_service.check_project_access(project["id"])

    def update_data(self, data):
        open_status = projects_service.get_or_create_open_status()
        data["open_status_id"] = open_status["id"]
