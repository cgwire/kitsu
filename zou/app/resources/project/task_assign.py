from flask import abort
from flask_restful import reqparse, Resource
from flask_login import login_required

from zou.app.project import task_info
from zou.app.project import person_info

from zou.app.project.exception import TaskNotFoundException, PersonNotFoundException


class TaskAssignResource(Resource):

    @login_required
    def put(self, instance_id):
        (person_id) = self.get_arguments()

        try:
            task = self.assign_task(instance_id, person_id)
        except TaskNotFoundException:
            abort(404)
        except PersonNotFoundException:
            return {"error": "Assignee doesn't exist in database."}, 400

        return task.serialize()

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "person_id",
            help="Assignee ID required.",
            required=True
        )
        args = parser.parse_args()

        return (
            args.get("person_id", ""),
        )

    def assign_task(self, task_id, person_id):
        task = task_info.get_task(task_id)
        person = person_info.get_person(person_id)
        return task_info.assign_task(task, person)


