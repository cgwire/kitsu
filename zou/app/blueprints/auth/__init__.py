from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    LoginResource,
    LogoutResource,
    AuthenticatedResource,
    ChangePasswordResource,
    RegistrationResource,
    RefreshTokenResource,
    PersonListResource
)

routes = [
    ("/auth/login", LoginResource),
    ("/auth/logout", LogoutResource),
    ("/auth/authenticated", AuthenticatedResource),
    ("/auth/register", RegistrationResource),
    ("/auth/change-password", ChangePasswordResource),
    ("/auth/refresh-token", RefreshTokenResource),
    ("/auth/person-list", PersonListResource)
]

blueprint = Blueprint("auth", "auth")
api = configure_api_from_blueprint(blueprint, routes)
