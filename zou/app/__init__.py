from flask_jwt_extended import JWTManager

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from . import config
from .stores import auth_tokens_store


app = Flask(__name__)
app.config.from_object(config)

db = SQLAlchemy(app)

app.secret_key = app.config["SECRET_KEY"]
jwt = JWTManager(app)


@jwt.token_in_blacklist_loader
def check_if_token_is_revoked(decrypted_token):
    return auth_tokens_store.is_revoked(decrypted_token)


def load_api():
    from . import api
    api.configure(app)

load_api()
