import redis
import requests

from flask_restful import Resource
from zou import __version__

from zou.app import app, config
from zou.app.services import projects_service


class IndexResource(Resource):

    def get(self):
        return {
            "api": app.config["APP_NAME"],
            "version": __version__
        }


class StatusResource(Resource):

    def get(self):
        is_db_up = True
        try:
            projects_service.get_open_status()
        except:
            is_db_up = False

        is_kv_up = True
        try:
            store = redis.StrictRedis(
                host=config.KEY_VALUE_STORE["host"],
                port=config.KEY_VALUE_STORE["port"],
                db=config.AUTH_TOKEN_BLACKLIST_KV_INDEX,
                decode_responses=True
            )
            store.get(None)
        except redis.ConnectionError:
            is_kv_up = False

        is_es_up = True
        try:
            requests.get("http://localhost:%s" % config.EVENT_STREAM_PORT)
        except:
            is_es_up = False

        return {
            "api": app.config["APP_NAME"],
            "version": __version__,
            "database-up": is_db_up,
            "key-value-store-up": is_kv_up,
            "event-stream-up": is_es_up
        }
