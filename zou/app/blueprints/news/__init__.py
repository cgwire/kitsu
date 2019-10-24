from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import ProjectNewsResource, ProjectSingleNewsResource


routes = [
    ("/data/projects/<project_id>/news", ProjectNewsResource),
    ("/data/projects/<project_id>/news/<news_id>", ProjectSingleNewsResource),
]

blueprint = Blueprint("news", "news")
api = configure_api_from_blueprint(blueprint, routes)
