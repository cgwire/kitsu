from zou.app.models.custom_action import CustomAction

from .base import BaseModelsResource, BaseModelResource


class CustomActionsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, CustomAction)

    def check_read_permissions(self):
        return True


class CustomActionResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, CustomAction)
