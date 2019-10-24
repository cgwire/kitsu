from zou.app.models.task_status import TaskStatus
from zou.app.services import tasks_service
from .base import BaseModelResource, BaseModelsResource


class TaskStatusesResource(BaseModelsResource):
    def __init__(self):
        BaseModelsResource.__init__(self, TaskStatus)

    def check_read_permissions(self):
        return True


class TaskStatusResource(BaseModelResource):
    def __init__(self):
        BaseModelResource.__init__(self, TaskStatus)

    def check_read_permissions(self, instance):
        return True

    def post_update(self, instance_dict):
        tasks_service.clear_task_status_cache(instance_dict["id"])

    def post_delete(self, instance_dict):
        tasks_service.clear_task_status_cache(instance_dict["id"])
