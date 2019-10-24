from zou.app.models.output_type import OutputType
from .base import BaseModelResource, BaseModelsResource


class OutputTypesResource(BaseModelsResource):
    def __init__(self):
        BaseModelsResource.__init__(self, OutputType)

    def check_read_permissions(self):
        return True


class OutputTypeResource(BaseModelResource):
    def __init__(self):
        BaseModelResource.__init__(self, OutputType)

    def check_read_permissions(self, instance):
        return True
