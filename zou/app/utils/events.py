from collections import OrderedDict

handlers = {}


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
    for func in event_handlers.values():
        func.handle_event(data)
