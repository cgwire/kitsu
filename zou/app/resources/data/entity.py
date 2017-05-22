from zou.app.models.entity import Entity
from zou.app.resources.data.base import BaseModelResource, BaseModelsResource


class EntitiesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Entity)


class EntityResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Entity)
