from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from . import config

app = Flask(__name__)
app.config.from_object(config)

db = SQLAlchemy(app)


def load_api():
    from . import api
    api.configure(app)

load_api()
