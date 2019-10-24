import redis

from flask_socketio import SocketIO

from zou.app import config

host = config.KEY_VALUE_STORE["host"]
port = config.KEY_VALUE_STORE["port"]
redis_db = config.KV_EVENTS_DB_INDEX
redis_url = "redis://%s:%s/%s" % (host, port, redis_db)

socketio = None


def publish(event, data):
    if socketio is not None:
        socketio.emit(event, data, namespace="/events")


def init():
    """
    Initialize key value store that will be used for the event publishing.
    That way the main API takes advantage of Redis pub/sub capabilities to push
    events to the event stream API.
    """
    global socketio

    try:
        publisher_store = redis.StrictRedis(
            host=host, port=port, db=redis_db, decode_responses=True
        )
        publisher_store.get("test")
        socketio = SocketIO(message_queue=redis_url)
    except redis.ConnectionError:
        pass

    return socketio
