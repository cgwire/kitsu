from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import NewPersonResource

routes = [
    (NewPersonResource, "/data/persons/new")
]

blueprint = Blueprint("index", "index")
api = configure_api_from_blueprint(blueprint, routes)
