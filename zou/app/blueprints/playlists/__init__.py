from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import ProjectPlaylistsResource

routes = [
    ("/data/projects/<project_id>/playlists", ProjectPlaylistsResource)
]

blueprint = Blueprint("playlists", "playlists")
api = configure_api_from_blueprint(blueprint, routes)
