from zou.app.blueprints.source.csv.base import BaseCsvProjectImportResource

from zou.app.services import assets_service
from zou.app.models.entity import Entity

from sqlalchemy.exc import IntegrityError


class AssetsCsvImportResource(BaseCsvProjectImportResource):

    def prepare_import(self, project_id):
        self.entity_types = {}
        self.descriptor_fields = self.get_descriptor_field_map(
            project_id,
            "Shot"
        )

    def import_row(self, row, project_id):
        asset_name = row["Name"]
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

        data = {}
        for name, field_name in self.descriptor_fields.items():
            if name in row:
                data[field_name] = row[name]

        try:
            entity = Entity.get_by(
                name=asset_name,
                project_id=project_id,
                entity_type_id=entity_type_id
            )
            if entity is None:
                entity = Entity.create(
                    name=asset_name,
                    description=description,
                    project_id=project_id,
                    entity_type_id=entity_type_id,
                    data=data
                )
        except IntegrityError:
            pass

        return entity.serialize()
