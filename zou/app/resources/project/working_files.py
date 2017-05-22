import os

from flask import abort
from flask_restful import reqparse, Resource
from flask_login import login_required

from zou.app.models.working_file import WorkingFile
from zou.app.models.task import Task

from zou.app.resources.data.base import BaseModelResource

from zou.app.project import file_info, task_info, file_tree

from zou.app.project.exception import TaskNotFoundException


class CommentWorkingFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, WorkingFile)

    @login_required
    def put(self, working_file_id):
        comment = self.get_comment_from_args()
        working_file = self.update_comment(working_file_id, comment)
        return working_file.serialize(), 200

    def get_comment_from_args(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "comment", required=True, help="Comment field expected.")
        args = parser.parse_args()
        comment = args["comment"]
        return comment

    def update_comment(self, working_file_id, comment):
        working_file = self.get_model_or_404(working_file_id)
        working_file.update({
            "comment": comment
        })
        return working_file


class PublishFileResource(Resource):

    @login_required
    def post(self):
        (
            task_id,
            comment,
            person_id,
            separator,
            working_file_revision
        ) = self.get_arguments()
        separator = "/"

        task = Task.get(task_id)
        entity_id = task.entity_id

        working_file = file_info.create_new_working_revision(
            entity_id,
            task.id,
            person_id,
            comment,
            working_file_revision
        )
        working_file_dict = self.add_path_info(
            working_file,
            "working",
            task,
            comment,
            separator
        )

        output_file = file_info.create_new_output_revision(
            entity_id,
            task.id,
            person_id,
            comment
        )
        output_file.source_file_id = working_file.id
        output_file_dict = self.add_path_info(
            output_file,
            "output",
            task,
            comment,
            separator
        )
        output_file_dict["preview_path"] = self.get_preview_path(
            task,
            output_file.revision,
            separator
        )

        task_info.to_review_task(
            task,
            output_file_dict,
        )

        return {
            "working_file": working_file_dict,
            "output_file": output_file_dict,
            "preview_path": output_file_dict["preview_path"]
        }, 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("task_id", required=True, help="Task ID is missing")
        parser.add_argument("comment", default="")
        parser.add_argument("person_id", default=None)
        parser.add_argument("separator", default="/")
        parser.add_argument("working_file_revision", default=0)
        args = parser.parse_args()

        return (
            args["task_id"],
            args["comment"],
            args["person_id"],
            args["separator"],
            args["working_file_revision"]
        )

    def add_path_info(self, file_model, mode, task, comment, separator=os.sep):
        file_dict = file_model.serialize()

        folder_path = file_tree.get_folder_path(
            task,
            mode=mode,
            sep=separator
        )
        file_name = file_tree.get_file_name(
            task,
            mode=mode,
            comment=comment,
            version=file_dict["revision"]
        )

        file_dict.update({
            "folder_path": folder_path,
            "file_name": file_name
        })

        return file_dict

    def get_preview_path(self, task, revision, separator=os.sep):
        folder_path = file_tree.get_folder_path(
            task,
            mode="preview",
            sep=separator
        )
        file_name = file_tree.get_file_name(
            task,
            mode="preview",
            version=revision
        )

        return {
            "folder_path": folder_path,
            "file_name": file_name
        }


class GetNextOutputFileResource(Resource):

    @login_required
    def get(self, task_id):
        try:
            task = task_info.get_task(task_id)
        except TaskNotFoundException:
            abort(404)

        next_revision_number = \
            file_info.get_next_output_revision_number(task)

        return {
            "next_revision": next_revision_number
        }, 200
