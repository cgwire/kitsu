from zou.app.models.event import Event

from .base import BaseModelResource, BaseModelsResource


class EventsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Event)


class EventResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Event)
