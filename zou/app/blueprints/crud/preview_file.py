from zou.app.models.preview_file import PreviewFile
from zou.app.services import tasks_service, user_service

from .base import BaseModelsResource, BaseModelResource


class PreviewFilesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, PreviewFile)


class PreviewFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, PreviewFile)

    def check_read_permissions(self, preview_file):
        task = tasks_service.get_task(preview_file["task_id"])
        return user_service.check_project_access(task["project_id"])

    def check_update_permissions(self, preview_file, data):
        task = tasks_service.get_task(preview_file["task_id"])
        return user_service.check_project_access(task["project_id"])
