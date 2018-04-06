import redis
import sys

from rq import Queue
from zou.app import config


try:
    if config.ENABLE_JOB_QUEUE:
        queue_store = redis.StrictRedis(
            host=config.KEY_VALUE_STORE["host"],
            port=config.KEY_VALUE_STORE["port"],
            db=config.KV_JOB_DB_INDEX,
            decode_responses=True
        )
        queue_store.get(None)
except redis.ConnectionError:
    try:
        import fakeredis
        revoked_tokens_store = fakeredis.FakeStrictRedis()
    except:
        sys.exit(1)

if config.ENABLE_JOB_QUEUE:
    job_queue = Queue(connection=queue_store)
