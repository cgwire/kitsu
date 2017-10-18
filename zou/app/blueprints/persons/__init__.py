from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import NewPersonResource

routes = [
    ("/data/persons/new", NewPersonResource)
]

blueprint = Blueprint("persons", "persons")
api = configure_api_from_blueprint(blueprint, routes)
