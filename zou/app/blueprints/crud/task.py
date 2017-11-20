from flask import request, current_app
from sqlalchemy.exc import IntegrityError

from zou.app.models.task import Task
from zou.app.models.person import Person
from zou.app.services import user_service

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
            assignees = data['assignees']
            del data['assignees']
            persons = Person.query.filter(Person.id.in_(assignees)).all()

            instance = self.model(**data)
            instance.assignees = persons
            instance.save()

            return instance.serialize(), 201

        except TypeError as exception:
            current_app.logger.error(exception.message)
            return {"error": exception.message}, 400

        except IntegrityError as exception:
            current_app.logger.error(exception.message)
            return {"error": exception.message}, 400


class TaskResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Task)

    def check_read_permissions(self, task):
        user_service.check_project_access(task["project_id"])
