from .base import BaseModelResource, BaseModelsResource

from zou.app.models.entity_type import EntityType
from zou.app.utils import events
from zou.app.services import entities_service


class EntityTypesResource(BaseModelsResource):
    def __init__(self):
        BaseModelsResource.__init__(self, EntityType)

    def check_read_permissions(self):
        return True

    def emit_create_event(self, instance_dict):
        events.emit("asset-type:new", {"asset_type_id": instance_dict["id"]})


class EntityTypeResource(BaseModelResource):
    def __init__(self):
        BaseModelResource.__init__(self, EntityType)

    def check_read_permissions(self, instance):
        return True

    def emit_update_event(self, instance_dict):
        events.emit("asset-type:update", {"asset_type_id": instance_dict["id"]})

    def emit_delete_event(self, instance_dict):
        events.emit("asset-type:delete", {"asset_type_id": instance_dict["id"]})

    def post_update(self, instance_dict):
        entities_service.clear_entity_type_cache(instance_dict["id"])

    def post_delete(self, instance_dict):
        entities_service.clear_entity_type_cache(instance_dict["id"])
