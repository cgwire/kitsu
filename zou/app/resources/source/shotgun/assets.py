from flask_restful import current_app

from sqlalchemy.exc import IntegrityError

from zou.app.models.project import Project
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType

from zou.app.resources.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource
)

from zou.app.project import asset_info


class ImportShotgunAssetsResource(BaseImportShotgunResource):

    def __init__(self):
        BaseImportShotgunResource.__init__(self)

    def prepare_import(self):
        entity_type_names = self.extract_entity_type_names(self.sg_entries)
        asset_info.save_asset_types(entity_type_names)
        self.project_ids = Project.get_id_map()
        self.entity_type_ids = EntityType.get_id_map(field="name")

    def extract_entity_type_names(self, sg_assets):
        return {
            x["sg_asset_type"] for x in sg_assets
            if x["sg_asset_type"] is not None
        }

    def extract_data(self, sg_asset):
        entity_type_id = \
            self.entity_type_ids.get(sg_asset["sg_asset_type"], None)
        project_id = self.project_ids.get(sg_asset["project"]["id"], None)

        return {
            "name": sg_asset["code"],
            "shotgun_id": sg_asset["id"],
            "description": sg_asset["description"],
            "entity_type_id": entity_type_id,
            "project_id": project_id
        }

    def import_entry(self, data):
        entity = None
        try:
            entity = self.save_entity(data)
        except IntegrityError:
            current_app.logger.error(
                "Similar asset already exists "
                "or project is missing: %s" % data
            )

        return entity

    def save_entity(self, data):
        entity = None
        entities = asset_info.get_assets({"shotgun_id": data["shotgun_id"]})
        if len(entities) > 0:
            entity = entities[0]

        if entity is None:
            entity = Entity(**data)
            entity.save()
            current_app.logger.info("Entity created: %s" % entity)
        else:
            entity.update(data)
            current_app.logger.info("Entity updated: %s" % entity)

        return entity


class ImportRemoveShotgunAssetResource(ImportRemoveShotgunBaseResource):

    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(self, Entity)
