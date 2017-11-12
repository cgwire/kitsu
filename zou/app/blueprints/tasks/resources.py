from flask import abort, request
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.services.exception import (
    TaskNotFoundException,
    TaskStatusNotFoundException,
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
    projects_service,
    files_service,
    file_tree,
    user_service
)
from zou.app.utils import query, events, permissions


class CommentTaskResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_id):
        (
            task_status_id,
            comment
        ) = self.get_arguments()

        try:
            task = tasks_service.get_task(task_id)
            if not permissions.has_manager_permissions():
                user_service.check_assigned(task_id)
            task_status = tasks_service.get_task_status(task_status_id)
            person = persons_service.get_current_user()
            comment = tasks_service.create_comment(
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
        except TaskStatusNotFoundException:
            abort(400)
        except permissions.PermissionDenied:
            abort(403)

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
        is_movie = self.get_arguments()
        try:
            task = tasks_service.get_task(task_id)
            if not permissions.has_manager_permissions():
                user_service.check_assigned(task_id)
            comment = tasks_service.get_comment(comment_id)
            task_status = tasks_service.get_task_status(comment.task_status_id)
            person = persons_service.get_current_user()

            if task_status.short_name not in ["wfa", "retake"]:
                return {
                    "error": "Comment status is not waiting for approval."
                }, 400

            revision = tasks_service.get_next_preview_revision(task_id)
            preview = files_service.create_preview_file(
                task.name,
                revision,
                task.id,
                person.id,
                is_movie
            )
            comment.update({"preview_file_id": preview.id})
        except TaskStatusNotFoundException:
            abort(400)
        except permissions.PermissionDenied:
            abort(403)

        return preview.serialize(), 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("is_movie", type=bool, default=False)
        args = parser.parse_args()

        return args["is_movie"]


class TaskPreviewsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, task_id):
        try:
            task = tasks_service.get_task(task_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(task.project_id)
            previews = files_service.get_preview_files_for_task(task_id)
        except TaskNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return previews


class TaskCommentsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, task_id):
        try:
            comments = []
            task = tasks_service.get_task(task_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(task_id)

            comments = tasks_service.get_comments(task)
        except TaskNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return comments


class CreateShotTasksResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_type_id):
        try:
            permissions.check_manager_permissions()
            criterions = query.get_query_criterions_from_request(request)
            shots = shots_service.get_shots(criterions)
            task_type = tasks_service.get_task_type(task_type_id)
            tasks = [
                tasks_service.create_task(task_type, shot) for shot in shots
            ]
        except TaskTypeNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return tasks, 201


class CreateAssetTasksResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_type_id):
        try:
            permissions.check_manager_permissions()
            criterions = query.get_query_criterions_from_request(request)
            assets = assets_service.get_assets(criterions)
            task_type = tasks_service.get_task_type(task_type_id)
            tasks = [
                tasks_service.create_task(task_type, asset.serialize())
                for asset in assets
            ]

        except TaskTypeNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return tasks, 201


class ToReviewResource(Resource):

    @jwt_required
    def put(self, task_id):
        (person_id, comment, working_file_id) = self.get_arguments()

        try:
            task = tasks_service.get_task(task_id)
            if not permissions.has_manager_permissions():
                user_service.check_assigned(task_id)

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
        except permissions.PermissionDenied:
            abort(403)
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
            permissions.check_manager_permissions()
            task = self.assign_task(task_id, person_id)
        except TaskNotFoundException:
            abort(404)
        except PersonNotFoundException:
            return {"error": "Assignee doesn't exist in database."}, 400
        except permissions.PermissionDenied:
            abort(403)

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
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(task.project_id)
        except TaskNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        result = task.serialize()
        task_type = tasks_service.get_task_type(task.task_type_id)
        result["task_type"] = task_type
        assigner = persons_service.get_person(task.assigner_id)
        result["assigner"] = assigner.serialize()
        project = projects_service.get_project(task.project_id)
        result["project"] = project.serialize()
        task_status = tasks_service.get_task_status(task.task_status_id)
        result["task_status"] = task_status.serialize()
        entity = tasks_service.get_entity(task.entity_id)
        result["entity"] = entity.serialize()
        if entity.parent_id is not None:
            sequence = shots_service.get_sequence(entity.parent_id)
            result["sequence"] = sequence.serialize()
            if sequence.parent_id is not None:
                episode = shots_service.get_episode(sequence.parent_id)
                result["episode"] = episode.serialize()

        entity_type = tasks_service.get_entity_type(entity.entity_type_id)
        result["entity_type"] = entity_type.serialize()
        assignees = []
        for assignee in task.assignees:
            assignees.append(assignee.serialize())
        result["persons"] = assignees
        result["type"] = "Task"

        return result, 200


class TaskStartResource(Resource):

    @jwt_required
    def put(self, task_id):
        try:
            task = tasks_service.get_task(task_id)
            if not permissions.has_manager_permissions():
                user_service.check_assigned(task_id)
            task = tasks_service.start_task(task)
        except TaskNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return task.serialize(), 200


class SetTimeSpentResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, task_id, date, person_id):
        args = self.get_arguments()

        try:
            if not permissions.has_manager_permissions():
                user_service.check_assigned(task_id)
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
        except permissions.PermissionDenied:
            abort(403)

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
            if not permissions.has_manager_permissions():
                user_service.check_assigned(task_id)

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
        except permissions.PermissionDenied:
            abort(403)

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
            task = tasks_service.get_task(task_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(task.project_id)
            return tasks_service.get_time_spents(task_id)
        except TaskNotFoundException:
            abort(404)
        except WrongDateFormatException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)
