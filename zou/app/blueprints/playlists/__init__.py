from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    ProjectPlaylistsResource,
    ProjectPlaylistResource,
)


routes = [
    ("/data/projects/<project_id>/playlists", ProjectPlaylistsResource),
    (
        "/data/projects/<project_id>/playlists/<playlist_id>",
        ProjectPlaylistResource
    )
]

blueprint = Blueprint("playlists", "playlists")
api = configure_api_from_blueprint(blueprint, routes)
