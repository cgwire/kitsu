from zou.app.models.task_status import TaskStatus
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
