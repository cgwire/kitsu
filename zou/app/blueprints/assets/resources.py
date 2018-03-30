from flask import request
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.utils import query, permissions
from zou.app.services import (
    assets_service,
    shots_service,
    breakdown_service,
    tasks_service,
    user_service
)


class AssetResource(Resource):

    @jwt_required
    def get(self, asset_id):
        """
        Retrieve given asset.
        """
        asset = assets_service.get_full_asset(asset_id)
        user_service.check_project_access(asset["project_id"])
        return asset

    @jwt_required
    def delete(self, asset_id):
        permissions.check_manager_permissions()
        deleted_asset = assets_service.remove_asset(asset_id)
        return deleted_asset, 204


class AllAssetsResource(Resource):

    @jwt_required
    def get(self):
        """
        Retrieve all entities that are not shot or sequence.
        Adds project name and asset type name.
        """
        criterions = query.get_query_criterions_from_request(request)
        user_service.check_project_access(criterions)
        return assets_service.get_assets(criterions)


class AssetsAndTasksResource(Resource):

    @jwt_required
    def get(self):
        """
        Retrieve all entities that are not shot or sequence.
        Adds project name and asset type name and all related tasks.
        """
        criterions = query.get_query_criterions_from_request(request)
        page = query.get_page_from_request(request)
        user_service.check_project_access(criterions)
        return assets_service.get_assets_and_tasks(criterions, page)


class AssetTypeResource(Resource):

    @jwt_required
    def get(self, asset_type_id):
        """
        Retrieve given asset type.
        """
        return assets_service.get_asset_type(asset_type_id)


class AssetTypesResource(Resource):

    @jwt_required
    def get(self):
        """
        Retrieve all asset types (entity types that are not shot, sequence or
        episode).
        """
        criterions = query.get_query_criterions_from_request(request)
        return assets_service.get_asset_types(criterions)


class ProjectAssetTypesResource(Resource):

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all asset types for given project.
        """
        user_service.check_project_access(project_id)
        return assets_service.get_asset_types_for_project(project_id)


class ShotAssetTypesResource(Resource):

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all asset shots for given soht.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return assets_service.get_asset_types_for_shot(shot_id)


class ProjectAssetsResource(Resource):

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all assets for given project.
        """
        user_service.check_project_access(project_id)
        criterions = query.get_query_criterions_from_request(request)
        criterions["project_id"] = project_id
        return assets_service.get_assets(criterions)


class ProjectAssetTypeAssetsResource(Resource):

    @jwt_required
    def get(self, project_id, asset_type_id):
        """
        Retrieve all assets for given project and entity type.
        """
        user_service.check_project_access(project_id)
        criterions = query.get_query_criterions_from_request(request)
        criterions["project_id"] = project_id
        criterions["entity_type_id"] = asset_type_id
        return assets_service.get_assets(criterions)


class AssetTasksResource(Resource):

    @jwt_required
    def get(self, asset_id):
        """
        Retrieve all tasks related to a given shot.
        """
        asset = assets_service.get_asset(asset_id)
        user_service.check_project_access(asset["project_id"])
        return tasks_service.get_tasks_for_asset(asset_id)


class AssetTaskTypesResource(Resource):

    @jwt_required
    def get(self, asset_id):
        """
        Retrieve all task types related to a given asset.
        """
        asset = assets_service.get_asset(asset_id)
        user_service.check_project_access(asset["project_id"])
        return tasks_service.get_task_types_for_asset(asset_id)


class NewAssetResource(Resource):

    @jwt_required
    def post(self, project_id, asset_type_id):
        (
            name,
            description,
            data
        ) = self.get_arguments()

        permissions.check_manager_permissions()
        asset = assets_service.create_asset(
            project_id,
            asset_type_id,
            name,
            description,
            data
        )
        return asset, 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "name",
            help="The asset name is required.",
            required=True
        )
        parser.add_argument("description")
        parser.add_argument("data", type=dict, default={})
        args = parser.parse_args()
        return (
            args["name"],
            args.get("description", ""),
            args["data"]
        )


class CastInResource(Resource):

    @jwt_required
    def get(self, asset_id):
        """
        Resource to retrieve the casting of a given asset.
        """
        asset = assets_service.get_asset(asset_id)
        user_service.check_project_access(asset["project_id"])
        return breakdown_service.get_cast_in(asset_id)


class AssetShotAssetInstancesResource(Resource):

    @jwt_required
    def get(self, asset_id):
        """
        Retrieve all asset instances linked to asset.
        """
        asset = assets_service.get_asset(asset_id)
        user_service.check_project_access(asset["project_id"])
        return breakdown_service.get_shot_asset_instances_for_asset(asset_id)


class AssetSceneAssetInstancesResource(Resource):

    @jwt_required
    def get(self, asset_id):
        """
        Retrieve all asset instances linked to asset.
        """
        asset = assets_service.get_asset(asset_id)
        user_service.check_project_access(asset["project_id"])
        return breakdown_service.get_scene_asset_instances_for_asset(asset_id)
