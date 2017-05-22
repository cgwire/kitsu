from zou.app.resources.source.csv.base import BaseCsvImportResource

from zou.app.project import project_info, asset_info
from zou.app.models.entity import Entity

from sqlalchemy.exc import IntegrityError


class AssetsCsvImportResource(BaseCsvImportResource):

    def prepare_import(self):
        self.projects = {}
        self.entity_types = {}

    def import_row(self, row):
        name = row["Name"]
        project_name = row["Project"]
        entity_type_name = row["Category"]
        description = row["Description"]

        self.add_to_cache_if_absent(
            self.projects,
            project_info.get_or_create,
            project_name
        )
        project_id = self.get_id_from_cache(self.projects, project_name)

        self.add_to_cache_if_absent(
            self.entity_types,
            asset_info.get_or_create_type,
            entity_type_name
        )
        entity_type_id = self.get_id_from_cache(
            self.entity_types,
            entity_type_name
        )

        try:
            entity = Entity.create(
                name=name,
                description=description,
                project_id=project_id,
                entity_type_id=entity_type_id
            )
        except IntegrityError:
            entity = Entity.get_by(
                name=name,
                project_id=project_id,
                entity_type_id=entity_type_id
            )

        return entity
