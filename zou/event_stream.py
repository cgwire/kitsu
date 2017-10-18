import os

from flask import Flask
from flask_sse import sse

app = Flask(__name__)
redis_host =  os.environ.get("KV_HOST", "localhost")
redis_port =  os.environ.get("KV_PORT", "6379")
redis_url = "redis://%s:%s/2" % (redis_host, redis_port)


app.config["REDIS_URL"] = redis_url
app.register_blueprint(sse, url_prefix='/events')
