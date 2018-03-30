import redis
import sys

from rq import Queue
from zou.app import config


try:
    queue_store = redis.StrictRedis(
        host=config.KEY_VALUE_STORE["host"],
        port=config.KEY_VALUE_STORE["port"],
        db=config.KV_EVENTS_JOB_INDEX,
        decode_responses=True
    )
    queue_store.get(None)
except redis.ConnectionError:
    try:
        import fakeredis
        revoked_tokens_store = fakeredis.FakeStrictRedis()
    except:
        print("Cannot access to the required Redis instance")
        sys.exit(1)

job_queue = Queue(connection=queue_store)
