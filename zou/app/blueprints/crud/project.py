from zou.app.models.project import Project
from zou.app.services import user_service, projects_service
from zou.app.utils import permissions

from .base import BaseModelResource, BaseModelsResource


class ProjectsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Project)

    def add_project_permission_filter(self, query):
        if permissions.has_manager_permissions():
            return query
        else:
            return query.filter(user_service.build_related_projects_filter())

    def check_read_permissions(self):
        return True

    def update_data(self, data):
        open_status = projects_service.get_or_create_open_status()
        if "project_status_id" not in data:
            data["project_status_id"] = open_status["id"]
        return data


class ProjectResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Project)

    def check_read_permissions(self, project):
        user_service.check_project_access(project["id"])
