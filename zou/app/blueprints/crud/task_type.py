from zou.app.models.task_type import TaskType
from .base import BaseModelResource, BaseModelsResource


class TaskTypesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, TaskType)

    def check_read_permissions(self):
        return True


class TaskTypeResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, TaskType)

    def check_read_permissions(self, instance):
        return True
