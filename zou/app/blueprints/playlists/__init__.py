from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    EntityPreviewsResource,
    EpisodePlaylistsResource,
    ProjectPlaylistsResource,
    ProjectPlaylistResource
)


routes = [
    ("/data/projects/<project_id>/playlists", ProjectPlaylistsResource),
    (
        "/data/projects/<project_id>/episodes/<episode_id>/playlists",
        EpisodePlaylistsResource
    ),
    (
        "/data/projects/<project_id>/playlists/<playlist_id>",
        ProjectPlaylistResource
    ),
    (
        "/data/playlists/entities/<entity_id>/preview-files",
        EntityPreviewsResource
    )
]

blueprint = Blueprint("playlists", "playlists")
api = configure_api_from_blueprint(blueprint, routes)
