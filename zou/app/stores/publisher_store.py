import redis
import sys

from zou.app import config


def new():
    try:
        publisher = redis.StrictRedis(
            host=config.KEY_VALUE_STORE["host"],
            port=config.KEY_VALUE_STORE["port"],
            db=config.KV_EVENTS_DB_INDEX,
            decode_responses=True
        )
        publisher.get(None)
    except redis.ConnectionError:
        try:
            import fakeredis
            publisher = fakeredis.FakeStrictRedis()
        except:
            print("Cannot access to the required Redis instance")
            sys.exit(1)

    return publisher
