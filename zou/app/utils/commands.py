import json
import datetime

from zou.app.stores import auth_tokens_store as store


def clean_auth_tokens():
    """
    Remove all revoked tokens (most of the time outdated) from the key value
    store.
    """
    for key in store.keys():
        value = json.loads(store.get(key))

        is_revoked = value["revoked"] == True
        expiration = datetime.datetime.fromtimestamp(value["token"]["exp"])
        is_expired = expiration < datetime.datetime.now()

        if is_revoked or is_expired:
            store.delete(key)
