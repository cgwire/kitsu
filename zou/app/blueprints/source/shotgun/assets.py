from flask_restful import current_app

from sqlalchemy.exc import IntegrityError

from zou.app.models.project import Project
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType

from zou.app.blueprints.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource
)

from zou.app.services import assets_service


class ImportShotgunAssetsResource(BaseImportShotgunResource):

    def __init__(self):
        BaseImportShotgunResource.__init__(self)

    def prepare_import(self):
        entity_type_names = self.extract_entity_type_names(self.sg_entries)
        assets_service.save_asset_types(entity_type_names)
        self.project_ids = Project.get_id_map()
        self.entity_type_ids = EntityType.get_id_map(field="name")
        self.parent_map = {}

    def extract_entity_type_names(self, sg_assets):
        return {
            x["sg_asset_type"] for x in sg_assets
            if x["sg_asset_type"] is not None
        }

    def extract_data(self, sg_asset):
        entity_type_id = \
            self.entity_type_ids.get(sg_asset["sg_asset_type"], None)
        project_id = self.project_ids.get(sg_asset["project"]["id"], None)
        parent_shotgun_ids = [
            asset["id"] for asset in sg_asset.get("parents", [])
        ]

        return {
            "name": sg_asset["code"],
            "shotgun_id": sg_asset["id"],
            "description": sg_asset["description"],
            "entity_type_id": entity_type_id,
            "project_id": project_id,
            "parent_shotgun_ids": parent_shotgun_ids
        }

    def import_entry(self, data):
        entity = None
        parent_shotgun_ids = data["parent_shotgun_ids"]
        del data["parent_shotgun_ids"]

        try:
            entity = self.save_entity(data)
        except IntegrityError:
            current_app.logger.error(
                "Similar asset already exists "
                "or project is missing: %s" % data
            )

        if entity is not None:
            for parent_shotgun_id in parent_shotgun_ids:
                self.parent_map.setdefault(parent_shotgun_id, [])
                self.parent_map[parent_shotgun_id].append(Entity.get(entity.id))

        return entity

    def save_entity(self, data):
        entity = None
        entities = assets_service.get_assets({"shotgun_id": data["shotgun_id"]})
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

    def post_processing(self):
        # We handle the fact that an asset can have multiple parents by using
        # the entities out field as a children field.
        for key in self.parent_map.keys():
            entity = Entity.get_by(shotgun_id=key)
            if entity is not None:
                entity.update({"entities_out": self.parent_map[key]})
                entity.save()

        return self.parent_map


class ImportRemoveShotgunAssetResource(ImportRemoveShotgunBaseResource):

    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(self, Entity)
