from flask import abort, request
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.models.task import Task
from zou.app.models.task_status import TaskStatus
from zou.app.models.comment import Comment
from zou.app.models.person import Person
from zou.app.models.preview_file import PreviewFile
from zou.app.models.project import Project
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.task_type import TaskType

from zou.app.services.exception import (
    TaskNotFoundException,
    TaskTypeNotFoundException,
    PersonNotFoundException,
    MalformedFileTreeException,
    WrongDateFormatException
)
from zou.app.services import (
    tasks_service,
    shots_service,
    assets_service,
    persons_service,
    files_service,
    file_tree
)
from zou.app.utils import query, events

from zou.app.blueprints.crud.base import BaseModelResource


class CommentTaskResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_id):
        (
            task_status_id,
            comment
        ) = self.get_arguments()

        task = Task.get(task_id)
        task_status = TaskStatus.get(task_status_id)
        person = Person.get(persons_service.get_current_user().id)
        comment = Comment.create(
            object_id=task_id,
            object_type="Task",
            task_status_id=task_status_id,
            person_id=persons_service.get_current_user().id,
            text=comment
        )
        task.update({"task_status_id": task_status_id})
        comment_dict = comment.serialize()
        comment_dict["task_status"] = task_status.serialize()
        comment_dict["person"] = person.serialize()
        events.emit("comment:new", {"id": comment_dict["id"]})

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


class AddPreviewResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_id, comment_id):
        task = Task.get(task_id)
        comment = Comment.get(comment_id)
        task_status = TaskStatus.get(comment.task_status_id)
        person = Person.get(persons_service.get_current_user().id)

        if task_status.short_name not in ["wfa", "retake"]:
            return {"error": "Comment status is not waiting for approval."}, 400

        revision = tasks_service.get_next_preview_revision(task_id)
        preview = PreviewFile.create(
            name=task.name,
            revision=revision,
            source="webgui",
            task_id=task.id,
            person_id=person.id
        )
        comment.update({"preview_file_id": preview.id})

        return preview.serialize(), 201


class TaskPreviewsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, task_id):
        try:
            task = tasks_service.get_task(task_id)
            previews = PreviewFile.filter_by(
                task_id=task.id
            ).order_by(
                PreviewFile.revision.desc()
            )
        except TaskNotFoundException:
            abort(404)

        return PreviewFile.serialize_list(previews)


class TaskCommentsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, task_id):
        try:
            comments = []
            task = tasks_service.get_task(task_id)
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

                if comment.preview_file_id is not None:
                    preview = PreviewFile.get(comment.preview_file_id)
                    comment_dict["preview"] = {
                        "id": str(preview.id),
                        "revision": preview.revision
                    }

                if comment.preview_file_id is not None:
                    preview = PreviewFile.get(comment.preview_file_id)
                    comment_dict["preview"] = {
                        "id": str(preview.id),
                        "revision": preview.revision
                    }

                comments.append(comment_dict)

        except TaskNotFoundException:
            abort(404)

        return comments


class CreateShotTasksResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_type_id):
        try:
            criterions = query.get_query_criterions_from_request(request)
            shots = shots_service.get_shots(criterions)
            task_type = tasks_service.get_task_type(task_type_id)
            tasks = [
                tasks_service.create_task(task_type, shot) for shot in shots
            ]

        except TaskTypeNotFoundException:
            abort(404)

        return tasks, 201


class CreateAssetTasksResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_type_id):
        try:
            criterions = query.get_query_criterions_from_request(request)
            assets = assets_service.get_assets(criterions)
            task_type = tasks_service.get_task_type(task_type_id)
            tasks = [
                tasks_service.create_task(task_type, asset.serialize())
                for asset in assets
            ]

        except TaskTypeNotFoundException:
            abort(404)

        return tasks, 201


class ToReviewResource(Resource):

    @jwt_required
    def put(self, task_id):
        (person_id, comment, working_file_id) = self.get_arguments()

        try:
            task = tasks_service.get_task(task_id)
            person = persons_service.get_person(person_id)

            preview_path = ""
            if working_file_id is not None:
                working_file = files_service.get_working_file(working_file_id)
                software = files_service.get_software(working_file.software_id)
                revision = working_file.revision

                preview_path = self.get_preview_path(
                    task,
                    working_file.name,
                    revision,
                    software
                )

            task = tasks_service.task_to_review(
                task,
                person,
                comment,
                preview_path
            )
        except TaskNotFoundException:
            abort(404)
        except PersonNotFoundException:
            return {"error": "Cannot find given person."}, 400

        return task

    def get_preview_path(self, task, name, revision, software):
        try:
            folder_path = file_tree.get_folder_path(
                task,
                mode="preview",
                software=software
            )
            file_name = file_tree.get_file_name(
                task,
                name=name,
                mode="preview",
                software=software,
                version=revision
            )
        except MalformedFileTreeException:  # No template for preview files.
            return {"folder_path": "", "file_name": ""}

        return {
            "folder_path": folder_path,
            "file_name": file_name
        }

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("person_id", default="")
        parser.add_argument("comment", default="")
        parser.add_argument("working_file_id", default=None)
        args = parser.parse_args()

        return (
            args["person_id"],
            args["comment"],
            args["working_file_id"]
        )


class ClearAssignationResource(Resource):

    @jwt_required
    def put(self):
        (task_ids) = self.get_arguments()

        for task_id in task_ids:
            try:
                tasks_service.clear_assignation(task_id)
            except TaskNotFoundException:
                pass
        return task_ids

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "task_ids",
            help="Tasks list required.",
            required=True,
            action="append"
        )
        args = parser.parse_args()
        return (
            args["task_ids"]
        )


class TasksAssignResource(Resource):

    @jwt_required
    def put(self, person_id):
        (task_ids) = self.get_arguments()

        tasks = []
        for task_id in task_ids:
            try:
                task = self.assign_task(task_id, person_id)
                tasks.append(task.serialize())
            except TaskNotFoundException:
                pass
            except PersonNotFoundException:
                return {"error": "Assignee doesn't exist in database."}, 400

        return tasks

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "task_ids",
            help="Tasks list required.",
            required=True,
            action="append"
        )
        args = parser.parse_args()
        return (
            args["task_ids"]
        )

    def assign_task(self, task_id, person_id):
        task = tasks_service.get_task(task_id)
        person = persons_service.get_person(person_id)
        return tasks_service.assign_task(task, person)


class TaskAssignResource(Resource):

    @jwt_required
    def put(self, task_id):
        (person_id) = self.get_arguments()

        try:
            task = self.assign_task(task_id, person_id)
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
        task = tasks_service.get_task(task_id)
        person = persons_service.get_person(person_id)
        return tasks_service.assign_task(task, person)


class TaskFullResource(Resource):

    @jwt_required
    def get(self, task_id):
        try:
            task = tasks_service.get_task(task_id)
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
        result["type"] = "Task"

        return result, 200


class TaskStartResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Task)

    @jwt_required
    def put(self, task_id):
        task = self.get_model_or_404(task_id)
        task = tasks_service.start_task(task)
        return task.serialize(), 200


class StartTaskFromShotAssetResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Task)

    @jwt_required
    def put(self, task_type_id, entity_id):
        task = self.model.get_by(
            entity_id=entity_id,
            task_type_id=task_type_id
        )
        if task is None:
            abort(404)

        task = tasks_service.start_task(task)
        return task.serialize(), 200


class SetTimeSpentResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_id, date, person_id):
        args = self.get_arguments()

        try:
            tasks_service.get_task(task_id)
            persons_service.get_person(person_id)
            time_spent = tasks_service.create_or_update_time_spent(
                task_id,
                person_id,
                date,
                args["duration"]
            )
            return time_spent, 200
        except TaskNotFoundException:
            abort(404)
        except PersonNotFoundException:
            abort(404)
        except WrongDateFormatException:
            abort(404)

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("duration", default=0)
        args = parser.parse_args()
        return args


class AddTimeSpentResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_id, date, person_id):
        args = self.get_arguments()

        try:
            tasks_service.get_task(task_id)
            persons_service.get_person(person_id)
            time_spent = tasks_service.create_or_update_time_spent(
                task_id,
                person_id,
                date,
                args["duration"],
                add=True
            )
            return time_spent, 200
        except TaskNotFoundException:
            abort(404)
        except PersonNotFoundException:
            abort(404)
        except WrongDateFormatException:
            abort(404)

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("duration", default=0, type=int)
        args = parser.parse_args()
        return args


class GetTimeSpentResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, task_id, date):
        try:
            tasks_service.get_task(task_id)
            return tasks_service.get_time_spents(task_id)
        except TaskNotFoundException:
            abort(404)
        except WrongDateFormatException:
            abort(404)
