from zou.app.models.output_file import OutputFile
from zou.app.models.entity import Entity
from zou.app.models.project import Project
from zou.app.services import user_service, entities_service
from zou.app.utils import permissions

from .base import BaseModelsResource, BaseModelResource


class OutputFilesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, OutputFile)

    def check_read_permissions(self):
        return True

    def add_project_permission_filter(self, query):
        if permissions.has_admin_permissions():
            return query
        else:
            query = query \
                .join(Entity, OutputFile.entity_id == Entity.id) \
                .join(Project) \
                .filter(user_service.build_related_projects_filter())
            return query


class OutputFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, OutputFile)

    def check_read_permissions(self, instance):
        entity = entities_service.get_entity(instance["entity_id"])
        return user_service.check_project_access(entity["project_id"])

    def check_update_permissions(self, output_file, data):
        if permissions.has_manager_permissions():
            return True
        else:
            return user_service.check_working_on_entity(
                output_file["entity_id"]
            )
