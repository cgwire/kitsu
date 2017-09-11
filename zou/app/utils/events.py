from collections import OrderedDict
from zou.app import config

import redis
import json

handlers = {}

publisher = redis.StrictRedis(
    host=config.KEY_VALUE_STORE["host"],
    port=config.KEY_VALUE_STORE["port"],
    db=2,
    decode_responses=True
)
publisher.get(None)

def register(event, name, handler):
    if event not in handlers:
        handlers[event] = OrderedDict()

    handlers[event][name] = handler


def register_all(event_map):
    for event_name, handler_module in event_map.items():
        module_name = handler_module.__name__.split(".")[-1]
        register(event_name, module_name, handler_module)


def unregister(event, name):
    if event in handlers:
        handlers[event].pop(name, None)


def unregister_all():
    global handlers
    handlers = {}


def emit(event, data={}):
    event_handlers = handlers.get(event, {})
    publisher.publish('sse', json.dumps({
        "type": event,
        "data": {"data": data}})
    )
    for func in event_handlers.values():
        func.handle_event(data)
