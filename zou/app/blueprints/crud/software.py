from zou.app.models.software import Software
from .base import (
    BaseModelResource,
    BaseModelsResource
)


class SoftwaresResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Software)


class SoftwareResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Software)
