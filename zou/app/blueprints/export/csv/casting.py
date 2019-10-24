from flask_restful import Resource
from flask_jwt_extended import jwt_required
from slugify import slugify
from sqlalchemy.orm import aliased

from zou.app.models.entity import Entity, EntityLink
from zou.app.models.entity_type import EntityType

from zou.app.services import projects_service, user_service
from zou.app.utils import csv_utils


class CastingCsvExport(Resource):
    @jwt_required
    def get(self, project_id):
        project = projects_service.get_project(project_id)  # Check existence
        self.check_permissions(project_id)

        results = self.build_results(project_id)
        headers = self.build_headers()

        csv_content = [headers]
        for result in results:
            csv_content.append(self.build_row(result))

        print(csv_content)
        file_name = "%s casting" % project["name"]
        return csv_utils.build_csv_response(csv_content, slugify(file_name))

    def check_permissions(self, project_id):
        user_service.check_project_access(project_id)

    def build_headers(self):
        return [
            "Episode",
            "Parent",
            "Name",
            "Asset Type",
            "Asset",
            "Occurences",
            "Label",
        ]

    def build_row(self, result):
        (
            episode_name,
            target_parent_name,
            target_entity_type_name,
            target_name,
            asset_type_name,
            asset_name,
            entity_link_nb_occurences,
            entity_link_label,
        ) = result
        row = [
            episode_name or "",
            target_parent_name or target_entity_type_name,
            target_name,
            asset_type_name,
            asset_name,
            entity_link_nb_occurences,
            entity_link_label or "",
        ]
        return row

    def build_results(self, project_id):
        results = []

        Target = aliased(Entity, name="target")
        Asset = aliased(Entity, name="asset")
        Parent = aliased(Entity, name="parent")
        Episode = aliased(Entity, name="episode")
        AssetType = aliased(EntityType, name="asset_type")
        query = (
            EntityLink.query.join(Target, EntityLink.entity_in_id == Target.id)
            .join(Asset, EntityLink.entity_out_id == Asset.id)
            .join(AssetType, Asset.entity_type_id == AssetType.id)
            .outerjoin(Parent, Target.parent_id == Parent.id)
            .outerjoin(EntityType, Target.entity_type_id == EntityType.id)
            .outerjoin(Episode, Parent.parent_id == Episode.id)
            .filter(Target.project_id == project_id)
            .add_columns(
                Episode.name,
                Parent.name,
                EntityType.name,
                Target.name,
                AssetType.name,
                Asset.name,
            )
            .order_by(
                Episode.name,
                Parent.name,
                EntityType.name,
                Target.name,
                AssetType.name,
                Asset.name,
            )
        )
        for (
            entity_link,
            episode_name,
            target_parent_name,
            target_entity_type_name,
            target_name,
            asset_type_name,
            asset_name,
        ) in query.all():
            results.append(
                (
                    episode_name,
                    target_parent_name,
                    target_entity_type_name,
                    target_name,
                    asset_type_name,
                    asset_name,
                    entity_link.nb_occurences,
                    entity_link.label,
                )
            )
        return results
