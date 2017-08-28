from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import AllProjectsResource
from .resources import OpenProjectsResource

routes = [
    ("/data/projects/open", OpenProjectsResource),
    ("/data/projects/all", AllProjectsResource)
]

blueprint = Blueprint("projects", "projects")
api = configure_api_from_blueprint(blueprint, routes)
