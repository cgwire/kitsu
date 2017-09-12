import os

from flask import Flask
from flask_sse import sse

app = Flask(__name__)
app.config["REDIS_URL"] = os.environ.get(
    "REDIS_URL",
    "redis://localhost/2"
)
app.register_blueprint(sse, url_prefix='/events')
