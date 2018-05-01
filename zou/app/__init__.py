import os

from flask import Flask
from flask_restful import current_app
from flask_jwt_extended import JWTManager
from flask_principal import Principal, identity_changed, Identity
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from . import config
from .stores import auth_tokens_store
from .services.exception import PersonNotFoundException

from zou.app.utils import cache


app = Flask(__name__)
app.config.from_object(config)

if not app.config["FILE_TREE_FOLDER"]:
    # file_trees are included in Python package: use root_path
    app.config["FILE_TREE_FOLDER"] = os.path.join(app.root_path,
                                                  'file_trees')

if not app.config["THUMBNAIL_FOLDER"]:
    app.config["THUMBNAIL_FOLDER"] = os.path.join(app.instance_path,
                                                  'thumbnails')


db = SQLAlchemy(app)
migrate = Migrate(app, db)  # DB schema migration features

app.secret_key = app.config["SECRET_KEY"]
jwt = JWTManager(app)  # JWT auth tokens
Principal(app)  # Permissions
cache.cache.init_app(app)  # Function caching


# Hack required during development, because Flask SocketIO changes the default
# Flask CLI.
if config.DEBUG:
    from flask_socketio import SocketIO
    SocketIO(app, async_mode="threading")


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
