from zou.app.models.task_status import TaskStatus
from zou.app.resources.data.base import BaseModelResource, BaseModelsResource


class TaskStatusesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, TaskStatus)


class TaskStatusResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, TaskStatus)
