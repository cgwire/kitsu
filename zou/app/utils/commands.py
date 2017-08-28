import json
import datetime

from simplekv import fs


def clean_auth_tokens():
    store = fs.FilesystemStore("./sessions")

    for key in store.iter_keys():
        value = json.loads(store.get(key).decode("utf-8"))

        is_revoked = value["revoked"] == True
        expiration = datetime.datetime.fromtimestamp(value["token"]["exp"])
        is_expired = expiration < datetime.datetime.now()

        if is_revoked or is_expired:
            store.delete(key)
