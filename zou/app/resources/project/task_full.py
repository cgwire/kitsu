from flask import abort
from flask_login import login_required

from zou.app.models.task import Task
from zou.app.models.project import Project
from zou.app.models.person import Person
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.task_status import TaskStatus
from zou.app.models.task_type import TaskType

from zou.app.resources.data.base import BaseModelResource

from zou.app.project import task_info

from zou.app.project.exception import TaskNotFoundException


class TaskFullResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Task)

    @login_required
    def get(self, instance_id):
        try:
            task = task_info.get_task(instance_id)
        except TaskNotFoundException:
            abort(404)

        result = task.serialize()
        task_type = TaskType.get(task.task_type_id)
        result["task_type"] = task_type.serialize()
        assigner = Person.get(task.assigner_id)
        result["assigner"] = assigner.serialize()
        project = Project.get(task.project_id)
        result["project"] = project.serialize()
        task_status = TaskStatus.get(task.task_status_id)
        result["task_status"] = task_status.serialize()
        entity = Entity.get(task.entity_id)
        result["entity"] = entity.serialize()
        if entity.parent_id is not None:
            parent = Entity.get(entity.parent_id)
            result["entity_parent"] = parent.serialize()
        entity_type = EntityType.get(entity.entity_type_id)
        result["entity_type"] = entity_type.serialize()
        assignees = []
        for assignee in task.assignees:
            assignees.append(assignee.serialize())
        result["persons"] = assignees

        return result, 200
