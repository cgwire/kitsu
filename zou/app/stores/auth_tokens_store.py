import sys
import redis

from zou.app import config


try:
    revoked_tokens_store = redis.StrictRedis(
        host=config.KEY_VALUE_STORE["host"],
        port=config.KEY_VALUE_STORE["port"],
        db=config.AUTH_TOKEN_BLACKLIST_KV_INDEX,
        decode_responses=True
    )
    revoked_tokens_store.get(None)
except:
    try:
        import fakeredis
        revoked_tokens_store = fakeredis.FakeStrictRedis()
    except:
        print("Cannot access to the required Redis instance")
        sys.exit(1)


def add(key, token, ttl=None):
    return revoked_tokens_store.set(key, token, ex=ttl)


def get(key):
    return revoked_tokens_store.get(key)


def delete(key):
    return revoked_tokens_store.delete(key)


def keys():
    return revoked_tokens_store.keys()


def is_revoked(decrypted_token):
    jti = decrypted_token['jti']
    is_revoked = get(jti)
    return (is_revoked is None) or (is_revoked == 'true')
