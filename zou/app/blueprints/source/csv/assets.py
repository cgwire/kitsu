from zou.app.blueprints.source.csv.base import BaseCsvProjectImportResource

from zou.app.services import assets_service
from zou.app.models.entity import Entity

from sqlalchemy.exc import IntegrityError


class AssetsCsvImportResource(BaseCsvProjectImportResource):

    def prepare_import(self):
        self.entity_types = {}

    def import_row(self, row, project_id):
        name = row["Name"]
        entity_type_name = row["Type"]
        description = row["Description"]

        self.add_to_cache_if_absent(
            self.entity_types,
            assets_service.get_or_create_asset_type,
            entity_type_name
        )
        entity_type_id = self.get_id_from_cache(
            self.entity_types,
            entity_type_name
        )

        try:
            entity = Entity.get_by(
                name=name,
                project_id=project_id,
                entity_type_id=entity_type_id
            )
            if entity is None:
                entity = Entity.create(
                    name=name,
                    description=description,
                    project_id=project_id,
                    entity_type_id=entity_type_id
                )
        except IntegrityError:
            pass

        return entity
