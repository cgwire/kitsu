from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    DesktopLoginsResource,
    NewPersonResource,
    PresenceLogsResource
)

routes = [
    ("/data/persons/new", NewPersonResource),
    ("/data/persons/<person_id>/desktop-login-logs", DesktopLoginsResource),
    ("/data/persons/presence-logs/<month_date>", PresenceLogsResource)
]

blueprint = Blueprint("persons", "persons")
api = configure_api_from_blueprint(blueprint, routes)
