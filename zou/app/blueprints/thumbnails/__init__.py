from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    CreateShotThumbnailResource,
    ShotThumbnailResource,
    CreateProjectThumbnailResource,
    ProjectThumbnailResource,
    CreatePersonThumbnailResource,
    PersonThumbnailResource,
    CreateWorkingFileThumbnailResource,
    WorkingFileThumbnailResource,
    CreatePreviewFileThumbnailResource,
    PreviewFileThumbnailResource
)

routes = [
    ("/thumbnails/shots/<instance_id>", CreateShotThumbnailResource),
    ("/thumbnails/shots/<instance_id>.png", ShotThumbnailResource),
    ("/thumbnails/persons/<instance_id>", CreatePersonThumbnailResource),
    ("/thumbnails/persons/<instance_id>.png", PersonThumbnailResource),
    ("/thumbnails/projects/<instance_id>", CreateProjectThumbnailResource),
    ("/thumbnails/projects/<instance_id>.png", ProjectThumbnailResource),
    (
        "/thumbnails/working-files/<instance_id>",
        CreateWorkingFileThumbnailResource
    ),
    (
        "/thumbnails/working-files/<instance_id>.png",
        WorkingFileThumbnailResource
    ),
    (
        "/thumbnails/preview-files/<instance_id>",
        CreatePreviewFileThumbnailResource
    ),
    (
        "/thumbnails/preview-files/<instance_id>.png",
        PreviewFileThumbnailResource
    )
]

blueprint = Blueprint("thumbnails", "thumbnails")
api = configure_api_from_blueprint(blueprint, routes)
