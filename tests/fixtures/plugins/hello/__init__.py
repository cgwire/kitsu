from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import HelloResource

routes = [
    ("/hello", HelloResource),
]

name = __name__
