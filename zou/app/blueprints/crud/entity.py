from zou.app.models.entity import Entity
from zou.app.services import user_service

from .base import BaseModelResource, BaseModelsResource


class EntitiesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Entity)


class EntityResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Entity)

    def check_read_permissions(self, entity):
        user_service.check_project_access(entity["project_id"])
