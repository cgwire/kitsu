from zou.app.blueprints.export.csv.base import BaseCsvExport

from zou.app.models.project import Project
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType

from zou.app.services import shots_service


class AssetsCsvExport(BaseCsvExport):

    def __init__(self):
        BaseCsvExport.__init__(self, Entity)

    def build_headers(self):
        return [
            "Project",
            "Category",
            "Name",
            "Description",
        ]

    def build_query(self):
        shot_type = shots_service.get_shot_type()
        sequence_type = shots_service.get_sequence_type()
        episode_type = shots_service.get_episode_type()
        query = self.model.query.filter(
            ~Entity.entity_type_id.in_([
                shot_type["id"],
                sequence_type["id"],
                episode_type["id"]
            ])
        )
        query = query.join(Project)
        query = query.join(EntityType)
        query = query.add_columns(Project.name)
        query = query.add_columns(EntityType.name)
        query = query.order_by(Project.name, EntityType.name, Entity.name)
        return query

    def build_row(self, asset_data):
        (asset, project_name, category_name) = asset_data

        if asset.description is None:
            asset.description = ""

        return [
            project_name,
            category_name,
            asset.name,
            asset.description
        ]
