from zou.app.models.time_spent import TimeSpent

from .base import BaseModelsResource, BaseModelResource


class TimeSpentsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, TimeSpent)


class TimeSpentResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, TimeSpent)
