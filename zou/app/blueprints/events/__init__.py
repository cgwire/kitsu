from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    EventsResource
)

routes = [
    ("/data/events/last", EventsResource),
]

blueprint = Blueprint("events", "events")
api = configure_api_from_blueprint(blueprint, routes)
