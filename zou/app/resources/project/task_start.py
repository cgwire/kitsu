from flask import abort
from flask_login import login_required

from zou.app.models.task import Task
from zou.app.project import task_info

from zou.app.resources.data.base import BaseModelResource


class TaskStartResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Task)

    @login_required
    def put(self, instance_id):
        task = self.get_model_or_404(instance_id)
        task = task_info.start_task(task)
        return task.serialize(), 200


class StartTaskFromShotAssetResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Task)

    @login_required
    def put(self, task_type_id, entity_id):
        task = self.model.get_by(
            entity_id=entity_id,
            task_type_id=task_type_id
        )
        if task is None:
            abort(404)

        task = task_info.start_task(task)
        return task.serialize(), 200
