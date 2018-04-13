from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    NewPersonResource,
    DesktopLoginsResource
)

routes = [
    ("/data/persons/new", NewPersonResource),
    ("/data/persons/<person_id>/desktop-login-logs", DesktopLoginsResource)
]

blueprint = Blueprint("persons", "persons")
api = configure_api_from_blueprint(blueprint, routes)
