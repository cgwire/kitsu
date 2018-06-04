from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    WorkingFilePathResource,
    LastWorkingFilesResource,
    ModifiedFileResource,
    CommentWorkingFileResource,
    NewWorkingFileResource,
    TaskWorkingFilesResource,

    EntityOutputFilePathResource,
    GetNextEntityOutputFileRevisionResource,
    NewEntityOutputFileResource,
    LastEntityOutputFilesResource,
    EntityOutputTypesResource,
    EntityOutputTypeOutputFilesResource,

    InstanceOutputFilePathResource,
    NewInstanceOutputFileResource,
    GetNextInstanceOutputFileRevisionResource,
    LastInstanceOutputFilesResource,
    InstanceOutputTypesResource,
    InstanceOutputTypeOutputFilesResource,

    SetTreeResource,

    FileResource
)

routes = [
    ("/data/files/<file_id>", FileResource),

    ("/data/tasks/<task_id>/working-files", TaskWorkingFilesResource),
    ("/data/tasks/<task_id>/working-files/new", NewWorkingFileResource),
    (
        "/data/tasks/<task_id>/working-files/last-revisions",
        LastWorkingFilesResource
    ),
    ("/data/tasks/<task_id>/working-file-path", WorkingFilePathResource),

    (
        "/data/asset-instances/<asset_instance_id>"
        "/entities/<temporal_entity_id>/output-files/new",
        NewInstanceOutputFileResource
    ),
    (
        "/data/asset-instances/<asset_instance_id>"
        "/entities/<temporal_entity_id>/output-files/next-revision",
        GetNextInstanceOutputFileRevisionResource
    ),
    (
        "/data/asset-instances/<asset_instance_id>"
        "/entities/<temporal_entity_id>/output-files/last-revisions",
        LastInstanceOutputFilesResource
    ),
    (
        "/data/asset-instances/<asset_instance_id>"
        "/entities/<temporal_entity_id>/output-types",
        InstanceOutputTypesResource
    ),
    (
        "/data/asset-instances/<asset_instance_id>"
        "/entities/<temporal_entity_id>/output-types"
        "/<output_type_id>/output-files",
        InstanceOutputTypeOutputFilesResource
    ),
    (
        "/data/asset-instances/<asset_instance_id>"
        "/entities/<temporal_entity_id>/output-file-path",
        InstanceOutputFilePathResource
    ),

    (
        "/data/entities/<entity_id>/output-files/new",
        NewEntityOutputFileResource
    ),
    (
        "/data/entities/<entity_id>/output-files/next-revision",
        GetNextEntityOutputFileRevisionResource
    ),
    (
        "/data/entities/<entity_id>/output-files/last-revisions",
        LastEntityOutputFilesResource
    ),
    (
        "/data/entities/<entity_id>/output-types",
        EntityOutputTypesResource
    ),
    (
        "/data/entities/<entity_id>/output-types/<output_type_id>/output-files",
        EntityOutputTypeOutputFilesResource
    ),
    (
        "/data/entities/<entity_id>/output-file-path",
        EntityOutputFilePathResource
    ),

    ("/actions/projects/<project_id>/set-file-tree", SetTreeResource),
    ("/actions/working-files/<working_file_id>/comment", CommentWorkingFileResource),
    ("/actions/working-files/<working_file_id>/modified", ModifiedFileResource)
]

blueprint = Blueprint("files", "files")
api = configure_api_from_blueprint(blueprint, routes)
