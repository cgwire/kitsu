from .base import BaseModelsResource, BaseModelResource

from zou.app.models.working_file import WorkingFile
from zou.app.services import (
    user_service,
    tasks_service,
    files_service
)


class WorkingFilesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, WorkingFile)


class WorkingFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, WorkingFile)

    def check_read_permissions(self, instance):
        working_file = files_service.get_working_file(instance["id"])
        task = tasks_service.get_task(working_file["task_id"])
        return user_service.check_project_access(task["project_id"])

    def check_update_permissions(self, instance, data):
        working_file = files_service.get_working_file(instance["id"])
        task = tasks_service.get_task(working_file["task_id"])
        user_service.check_project_access(task["project_id"])
