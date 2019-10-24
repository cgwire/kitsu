import sys
import redis

from zou.app import config


try:
    revoked_tokens_store = redis.StrictRedis(
        host=config.KEY_VALUE_STORE["host"],
        port=config.KEY_VALUE_STORE["port"],
        db=config.AUTH_TOKEN_BLACKLIST_KV_INDEX,
        decode_responses=True,
    )
    revoked_tokens_store.get("test")
except redis.ConnectionError:
    try:
        import fakeredis

        revoked_tokens_store = fakeredis.FakeStrictRedis()
    except:
        print("Cannot access to the required Redis instance")
        sys.exit(1)


def add(key, token, ttl=None):
    """
    Store a token with key as access key.
    """
    return revoked_tokens_store.set(key.encode("utf-8"), token, ex=ttl)


def get(key):
    """
    Retrieve auth token corresponding at given key.
    """
    value = revoked_tokens_store.get(key)
    if value is not None and hasattr(value, "decode"):
        value = value.decode("utf-8")
    return value


def delete(key):
    """
    Remove auth token corresponding at given key.
    """
    return revoked_tokens_store.delete(key.encode("utf-8"))


def keys():
    """
    Get all keys available in the store.
    """
    keys = revoked_tokens_store.keys()
    if len(keys) > 0 and hasattr(keys[0], "decode"):
        return [x.decode("utf-8") for x in revoked_tokens_store.keys()]
    else:
        return [x for x in revoked_tokens_store.keys()]


def clear():
    """
    Clear all auth token stored in the store.
    """
    for key in keys():
        delete(key)


def is_revoked(decrypted_token):
    """
    Tell if a stored auth token is revoked or not.
    """
    jti = decrypted_token["jti"]
    is_revoked = get(jti)
    return (is_revoked is None) or (is_revoked == "true")
