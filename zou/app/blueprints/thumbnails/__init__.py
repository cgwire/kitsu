from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    CreatePreviewFilePictureResource,
    PreviewFileMovieResource,
    PreviewFileThumbnailResource,
    PreviewFileThumbnailSquareResource,
    PreviewFilePreviewResource,
    PreviewFileOriginalResource,

    CreateShotThumbnailResource,
    ShotThumbnailResource,
    CreateProjectThumbnailResource,
    ProjectThumbnailResource,
    CreatePersonThumbnailResource,
    PersonThumbnailResource,
    CreateWorkingFileThumbnailResource,
    WorkingFileThumbnailResource
)

routes = [
    (
        "/pictures/preview-files/<instance_id>",
        CreatePreviewFilePictureResource
    ),
    (
        "/movies/originals/preview-files/<instance_id>.mp4",
        PreviewFileMovieResource
    ),
    (
        "/pictures/thumbnails/preview-files/<instance_id>.png",
        PreviewFileThumbnailResource
    ),
    (
        "/pictures/thumbnails-square/preview-files/<instance_id>.png",
        PreviewFileThumbnailSquareResource
    ),
    (
        "/pictures/originals/preview-files/<instance_id>.png",
        PreviewFileOriginalResource
    ),
    (
        "/pictures/previews/preview-files/<instance_id>.png",
        PreviewFilePreviewResource
    ),

    (
        "/pictures/thumbnails/shots/<instance_id>",
        CreateShotThumbnailResource
    ),
    (
        "/pictures/thumbnails/shots/<instance_id>.png",
        ShotThumbnailResource
    ),
    (
        "/pictures/thumbnails/persons/<instance_id>",
        CreatePersonThumbnailResource
    ),
    (
        "/pictures/thumbnails/persons/<instance_id>.png",
        PersonThumbnailResource
    ),
    (
        "/pictures/thumbnails/projects/<instance_id>",
        CreateProjectThumbnailResource
    ),
    (
        "/pictures/thumbnails/projects/<instance_id>.png",
        ProjectThumbnailResource
    ),
    (
        "/pictures/thumbnails/working-files/<instance_id>",
        CreateWorkingFileThumbnailResource
    ),
    (
        "/pictures/thumbnails/working-files/<instance_id>.png",
        WorkingFileThumbnailResource
    )
]

blueprint = Blueprint("thumbnails", "thumbnails")
api = configure_api_from_blueprint(blueprint, routes)
