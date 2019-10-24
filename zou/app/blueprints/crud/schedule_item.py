from zou.app.models.schedule_item import ScheduleItem

from .base import BaseModelResource, BaseModelsResource


class ScheduleItemsResource(BaseModelsResource):
    def __init__(self):
        BaseModelsResource.__init__(self, ScheduleItem)


class ScheduleItemResource(BaseModelResource):
    def __init__(self):
        BaseModelResource.__init__(self, ScheduleItem)

    def update_data(self, data, instance_id):
        if isinstance(data.get("man_days", None), str):
            data.pop("man_days", None)

        for field in self.protected_fields:
            data.pop(field, None)

        return data
