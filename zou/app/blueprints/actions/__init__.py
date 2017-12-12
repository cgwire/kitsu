from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import RunActionResource

routes = [
    ("/actions/run-custom/", RunActionResource)
]

blueprint = Blueprint("actions", "actions")
api = configure_api_from_blueprint(blueprint, routes)
