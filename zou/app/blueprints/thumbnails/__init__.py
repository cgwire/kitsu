from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    CreatePreviewFilePictureResource,
    PreviewFileMovieResource,
    PreviewFileThumbnailResource,
    PreviewFileResource,
    PreviewFileThumbnailSquareResource,
    PreviewFilePreviewResource,
    PreviewFileOriginalResource,

    CreateProjectThumbnailResource,
    ProjectThumbnailResource,
    CreatePersonThumbnailResource,
    PersonThumbnailResource,

    SetMainPreviewResource
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
        "/pictures/originals/preview-files/<instance_id>.<extension>",
        PreviewFileResource
    ),
    (
        "/pictures/previews/preview-files/<instance_id>.png",
        PreviewFilePreviewResource
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
        "/actions/entities/<entity_id>/set-main-preview/<preview_file_id>",
        SetMainPreviewResource
    )
]
blueprint = Blueprint("thumbnails", "thumbnails")
api = configure_api_from_blueprint(blueprint, routes)
