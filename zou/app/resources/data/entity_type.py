from zou.app.models.entity_type import EntityType
from zou.app.resources.data.base import BaseModelResource, BaseModelsResource


class EntityTypesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, EntityType)


class EntityTypeResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, EntityType)
