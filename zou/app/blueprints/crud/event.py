from zou.app.models.event import ApiEvent

from .base import BaseModelResource, BaseModelsResource


class EventsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, ApiEvent)


class EventResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, ApiEvent)
