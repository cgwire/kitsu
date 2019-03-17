"""
This module is named source instead of import because import is a Python
keyword.
"""
from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import IndexResource, StatusResource, TxtStatusResource

routes = [
    ("/", IndexResource),
    ("/status", StatusResource),
    ("/status.txt", TxtStatusResource)
]

blueprint = Blueprint("index", "index")
api = configure_api_from_blueprint(blueprint, routes)
