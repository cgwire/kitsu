from zou.app.models.schedule_item import ScheduleItem

from .base import BaseModelResource, BaseModelsResource


class ScheduleItemsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, ScheduleItem)


class ScheduleItemResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, ScheduleItem)
