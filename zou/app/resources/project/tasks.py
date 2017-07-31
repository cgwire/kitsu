from flask import abort
from flask_restful import Resource, reqparse
from flask_login import login_required, current_user

from zou.app.models.task import Task
from zou.app.models.task_status import TaskStatus
from zou.app.models.comment import Comment
from zou.app.models.person import Person

from zou.app.project.exception import TaskNotFoundException
from zou.app.project import task_info


class CommentTaskResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @login_required
    def post(self, task_id):
        (
            task_status_id,
            comment
        ) = self.get_arguments()

        task = Task.get(task_id)
        task_status = TaskStatus.get(task_status_id)
        person = Person.get(current_user.id)
        comment = Comment.create(
            object_id=task_id,
            object_type="Task",
            task_status_id=task_status_id,
            person_id=current_user.id,
            text=comment
        )
        task.update({"task_status_id": task_status_id})
        comment_dict = comment.serialize()
        comment_dict["task_status"] = task_status.serialize()
        comment_dict["person"] = person.serialize()

        return comment_dict, 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "task_status_id",
            required=True,
            help="Task Status ID is missing"
        )
        parser.add_argument("comment", default="")
        args = parser.parse_args()

        return (
            args["task_status_id"],
            args["comment"]
        )


class TaskCommentsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @login_required
    def get(self, task_id):
        try:
            comments = []
            task = task_info.get_task(task_id)
            query = Comment.query.order_by(Comment.created_at.desc())
            query = query.filter_by(
                object_id=task.id
            )
            query = query.join(Person)
            query = query.join(TaskStatus)
            query = query.add_columns(TaskStatus.name)
            query = query.add_columns(TaskStatus.short_name)
            query = query.add_columns(TaskStatus.color)
            query = query.add_columns(Person.first_name)
            query = query.add_columns(Person.last_name)
            results = query.all()

            for result in results:
                (
                    comment,
                    task_status_name,
                    task_status_short_name,
                    task_status_color,
                    person_first_name,
                    person_last_name
                ) = result
                comment_dict = comment.serialize()
                comment_dict["person"] = {
                    "first_name": person_first_name,
                    "last_name": person_last_name,
                    "id": str(comment.person_id)
                }
                comment_dict["task_status"] = {
                    "name": task_status_name,
                    "short_name": task_status_short_name,
                    "color": task_status_color,
                    "id": str(comment.task_status_id)
                }
                comments.append(comment_dict)

        except TaskNotFoundException:
            abort(404)

        return comments
