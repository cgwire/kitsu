from flask import Flask
from flask_restful import current_app
from flask_jwt_extended import JWTManager
from flask_principal import Principal, identity_changed, Identity
from flask_sqlalchemy import SQLAlchemy

from . import config
from .stores import auth_tokens_store
from .services.exception import PersonNotFoundException


app = Flask(__name__)
app.config.from_object(config)

db = SQLAlchemy(app)

app.secret_key = app.config["SECRET_KEY"]
jwt = JWTManager(app)
Principal(app)


def configure_auth():
    from zou.app.services import persons_service

    @jwt.token_in_blacklist_loader
    def check_if_token_is_revoked(decrypted_token):
        return auth_tokens_store.is_revoked(decrypted_token)

    @jwt.user_loader_callback_loader
    def add_permissions(callback):
        try:
            user = persons_service.get_current_user()
            identity_changed.send(
                current_app._get_current_object(),
                identity=Identity(user["id"])
            )
            return user
        except PersonNotFoundException:
            return None


def load_api():
    from . import api
    api.configure(app)
    configure_auth()

load_api()
