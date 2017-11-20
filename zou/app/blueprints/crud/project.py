from zou.app.models.project import Project
from zou.app.services import user_service

from .base import BaseModelResource, BaseModelsResource


class ProjectsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Project)


class ProjectResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Project)

    def check_read_permissions(self, project):
        user_service.check_project_access(project["id"])
