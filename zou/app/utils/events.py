from collections import OrderedDict

from zou.app.stores import publisher_store
from zou.app.models.event import ApiEvent
from zou.app.utils import fields

handlers = {}

publisher_store.init()


def register(event, name, handler):
    """
    Register a listener by linking an event name to an handler module.
    The handler module exposes a function named `handle_event` which is executed
    when linked event occurs.
    """
    if event not in handlers:
        handlers[event] = OrderedDict()

    print("Handler [%s -> %s registered]" % (event, name))
    handlers[event][name] = handler


def register_all(event_map):
    """
    Register all listeners described by the event map. The key is the event
    name, the value is the module that must be loaded when event occurs
    """
    for event_name, handler_module in event_map.items():
        module_name = handler_module.__name__.split(".")[-1]
        register(event_name, module_name, handler_module)


def unregister(event, name):
    """
    Remove handler with given name from registered listener list. The handler
    will be no more executed when the event occurs.
    """
    if event in handlers:
        handlers[event].pop(name, None)


def unregister_all():
    """
    All event handlers are removed. Nothing will be executed anymore when an
    event occurs.
    """
    global handlers
    handlers = {}


def emit(event, data={}, persist=True):
    """
    Emit an event which leads to the execution of all event handlers registered
    for that event name.
    It publishes too the event to other services
    (like the realtime event daemon).
    """
    event_handlers = handlers.get(event, {})
    data = fields.serialize_dict(data)
    publisher_store.publish(event, data)
    if persist:
        save_event(event, data)

    from zou.app.config import ENABLE_JOB_QUEUE
    for func in event_handlers.values():
        if ENABLE_JOB_QUEUE:
            from zou.app.stores.queue_store.job_queue import enqueue
            enqueue(func.handle_event, data)
        else:
            func.handle_event(data)


def save_event(event, data):
    """
    Store event information in the database.
    """
    try:
        from zou.app.services.persons_service import get_current_user_raw
        person = get_current_user_raw()
        person_id = person.id
    except:
        person_id = None

    return ApiEvent.create(
        name=event,
        data=data,
        user_id=person_id
    )
