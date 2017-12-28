from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    FolderPathResource,
    FilePathResource,
    InstanceFilePathResource,
    SetTreeResource,
    GetTaskFromPathResource,
    CommentWorkingFileResource,
    GetNextOutputFileResource,
    LastWorkingFilesResource,
    LastOutputFilesResource,
    ModifiedFileResource,
    NewOutputFileResource,
    NewWorkingFileResource,
    TaskWorkingFilesResource,
    FileResource,
    EntityOutputTypesResource,
    EntityOutputTypeOutputFilesResource
)

routes = [
    ("/data/files/<file_id>", FileResource),
    ("/data/tasks/<task_id>/working-files", TaskWorkingFilesResource),
    ("/data/tasks/<task_id>/working-files/new", NewWorkingFileResource),
    ("/data/tasks/<task_id>/last-working-files", LastWorkingFilesResource),

    ("/data/tasks/<task_id>/folder-path", FolderPathResource),
    ("/data/tasks/<task_id>/file-path", FilePathResource),
    ("/data/asset-instances/<instance_id>/output-types/<output_type_id>/file-path", InstanceFilePathResource),
    ("/data/tasks/from-path", GetTaskFromPathResource),

    ("/data/working-files/<working_file_id>/output-files/new", NewOutputFileResource),
    ("/data/entities/<entity_id>/output-types/<output_type_id>/next-revision", GetNextOutputFileResource),
    ("/data/entities/<entity_id>/output-types", EntityOutputTypesResource),
    ("/data/entities/<entity_id>/output-types/<output_type_id>/output-files", EntityOutputTypeOutputFilesResource),
    ("/data/entities/<entity_id>/last-output-files", LastOutputFilesResource),

    ("/actions/projects/<project_id>/set-file-tree", SetTreeResource),
    ("/actions/working-files/<working_file_id>/comment", CommentWorkingFileResource),
    ("/actions/working-files/<working_file_id>/modified", ModifiedFileResource)
]

blueprint = Blueprint("files", "files")
api = configure_api_from_blueprint(blueprint, routes)
