from flask import request, abort
from flask_restful import Resource, reqparse
from flask_login import login_required

from zou.app.project import file_tree, project_info, task_info
from zou.app.project.exception import (
    SequenceNotFoundException,
    ProjectNotFoundException,
    TaskNotFoundException,
    WrongFileTreeFileException,
    WrongPathFormatException,
    MalformedFileTreeException
)


class FolderPathResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @login_required
    def post(self):
        (
            mode,
            task_id,
            separator
        ) = self.get_arguments()

        try:
            task = task_info.get_task(task_id)
            path = file_tree.get_folder_path(
                task,
                mode=mode,
                sep=separator
            )

        except TaskNotFoundException:
            return {
                "error": "Given task does not exist.",
                "received_data": request.json,
            }, 400

        except SequenceNotFoundException:
            return {
                "error": "Sequence for shot linked to task not found.",
                "received_data": request.json,
                "path": None
            }, 400

        except MalformedFileTreeException:
            return {
                "error":
                    "Tree is not properly written, check modes and variables",
                "received_data": request.json,
            }, 400

        return {"path": path}, 200

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "mode",
            help="The file mode is required (working, output,...).",
            required=True
        )
        parser.add_argument(
            "task_id",
            help="The task file id is required.",
            required=True
        )
        parser.add_argument("sep", default="/")
        args = parser.parse_args()

        return (
            args["mode"],
            args["task_id"],
            args["sep"]
        )


class FilePathResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @login_required
    def post(self):
        (
            mode,
            task_id,
            version,
            comment,
            separator
        ) = self.get_arguments()

        try:
            task = task_info.get_task(task_id)
            file_path = file_tree.get_folder_path(
                task,
                mode=mode,
                sep=separator
            )
            file_name = file_tree.get_file_name(
                task,
                mode=mode,
                version=version,
                comment=comment
            )
        except TaskNotFoundException:
            return {
                "error": "Given task does not exist.",
                "received_data": request.json,
            }, 400

        except SequenceNotFoundException:
            return {
                "error": "Sequence for shot linked to task not found.",
                "received_data": request.json,
            }, 400

        except MalformedFileTreeException:
            return {
                "error":
                    "Tree is not properly written, check modes and variables",
                "received_data": request.json,
            }, 400

        return {"path": file_path, "name": file_name}, 200

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "mode",
            help="The file mode is required (working, output,...).",
            required=True
        )
        parser.add_argument(
            "task_id",
            help="The task file id is required (working, output,...).",
            required=True
        )
        parser.add_argument("comment", default="")
        parser.add_argument("version", default=1)
        parser.add_argument("sep", default="/")
        args = parser.parse_args()

        return (
            args["mode"],
            args["task_id"],
            args["version"],
            args["comment"],
            args["sep"]
        )


class SetTreeResource(Resource):

    @login_required
    def post(self, project_id):
        (tree_name) = self.get_arguments()

        try:
            project = project_info.get_project(project_id)
            tree = file_tree.get_tree_from_file(tree_name)
        except ProjectNotFoundException:
            abort(404)
        except WrongFileTreeFileException:
            abort(400, "Selected tree is not available")

        project.update({"file_tree": tree})
        return project.serialize()

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "tree_name",
            help="The name of the tree to set is required.",
            required=True
        )
        args = parser.parse_args()

        return (
            args.get("tree_name", ""),
        )


class GetTaskFromPathResource(Resource):

    @login_required
    def post(self):
        (
            file_path,
            project_id,
            path_type,
            mode,
            sep
        ) = self.get_arguments()
        try:
            project = project_info.get_project(project_id)
        except ProjectNotFoundException:
            return {
                "error": "Given project does not exist.",
                "received_data": request.json,
            }, 400

        try:
            if path_type == "shot":
                task = file_tree.get_shot_task_from_path(
                    file_path, project, mode, sep)
            else:
                task = file_tree.get_asset_task_from_path(
                    file_path, project, mode, sep)

        except WrongPathFormatException:
            return {
                "error": "The given path lacks of information..",
                "received_data": request.json
            }, 400
        except TaskNotFoundException:
            return {
                "error": "No task exist for this path.",
                "received_data": request.json
            }, 400

        return task.serialize()

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "file_path",
            help="The file path is required.",
            required=True
        )
        parser.add_argument(
            "project_id",
            help="The project ID is required.",
            required=True
        )
        parser.add_argument(
            "type",
            help="The type (asset or shot) is required.",
            required=True
        )
        parser.add_argument("mode", "working")
        parser.add_argument("sep", "/")
        args = parser.parse_args()

        return (
            args["file_path"],
            args["project_id"],
            args["type"],
            args["mode"],
            args["sep"]
        )
