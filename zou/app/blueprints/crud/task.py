from flask import request, current_app
from flask_restful import reqparse
from flask_jwt_extended import jwt_required

from sqlalchemy.exc import IntegrityError

from zou.app.models.task import Task
from zou.app.models.person import Person

from zou.app.services import user_service, tasks_service, deletion_service
from zou.app.utils import permissions, events

from .base import BaseModelsResource, BaseModelResource


class TasksResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Task)

    def post(self):
        """
        Create a task with data given in the request body. JSON format is
        expected. The model performs the validation automatically when
        instantiated.
        """
        try:
            data = request.json
            is_assignees = "assignees" in data
            assignees = None

            if is_assignees:
                assignees = data['assignees']
                persons = Person.query.filter(Person.id.in_(assignees)).all()
                del data["assignees"]

            instance = self.model(**data)
            if assignees is not None:
                instance.assignees = persons
            instance.save()

            return instance.serialize(), 201

        except TypeError as exception:
            current_app.logger.error(str(exception))
            return {"message": str(exception)}, 400

        except IntegrityError as exception:
            current_app.logger.error(str(exception))
            return {"message": "Task already exists."}, 400


class TaskResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Task)

    def check_read_permissions(self, task):
        user_service.check_project_access(task["project_id"])

    def check_update_permissions(self, task, data):
        user_service.check_manager_project_access(task["project_id"])

    @jwt_required
    def delete(self, instance_id):
        """
        Delete a model corresponding at given ID and return it as a JSON
        object.
        """
        parser = reqparse.RequestParser()
        parser.add_argument("force", default=False, type=bool)
        args = parser.parse_args()

        instance = self.get_model_or_404(instance_id)

        try:
            instance_dict = instance.serialize()
            self.check_delete_permissions(instance_dict)
            deletion_service.remove_task(instance_id, force=args["force"])
            events.emit(
                "%s:delete" % self.model.__tablename__,
                {"%s_id" % self.model.__tablename__: instance.id}
            )
            self.post_delete(instance_dict)

        except IntegrityError as exception:
            current_app.logger.error(str(exception))
            return {"message": str(exception)}, 400

        return '', 204
