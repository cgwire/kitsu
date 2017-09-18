from flask import request, abort
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.utils import query
from zou.app.models.entity import Entity
from zou.app.services import (
    assets_service,
    tasks_service,
    projects_service
)

from zou.app.services.exception import (
    ProjectNotFoundException,
    AssetTypeNotFoundException,
    AssetNotFoundException
)


class AssetResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, asset_id):
        """
        Retrieve given asset.
        """
        try:
            asset = assets_service.get_asset(asset_id)
        except AssetNotFoundException:
            abort(404)
        return asset.serialize(obj_type="Asset")

    @jwt_required
    def delete(self, asset_id):
        try:
            deleted_asset = assets_service.remove_asset(asset_id)
        except AssetNotFoundException:
            abort(404)
        return deleted_asset, 204


class AssetsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        """
        Retrieve all assets.
        """
        criterions = query.get_query_criterions_from_request(request)
        assets = assets_service.get_assets(criterions)
        return Entity.serialize_list(assets, obj_type="Asset")


class AllAssetsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        """
        Retrieve all entities that are not shot or sequence.
        Adds project name and asset type name.
        """
        criterions = query.get_query_criterions_from_request(request)
        return assets_service.all_assets(criterions)


class AssetsAndTasksResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        """
        Retrieve all entities that are not shot or sequence.
        Adds project name and asset type name and all related tasks.
        """
        criterions = query.get_query_criterions_from_request(request)
        return assets_service.all_assets_and_tasks(criterions)


class AssetTypeResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, asset_type_id):
        """
        Retrieve given asset type.
        """
        try:
            asset_type = assets_service.get_asset_type(asset_type_id)
        except AssetTypeNotFoundException:
            abort(404)
        return asset_type.serialize(obj_type="AssetType")


class AssetTypesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        """
        Retrieve all asset types (entity types that are not shot, sequence or
        episode).
        """
        criterions = query.get_query_criterions_from_request(request)
        return assets_service.get_asset_types(criterions)


class ProjectAssetTypesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all asset types for given project.
        """
        asset_types = assets_service.get_asset_types_for_project(project_id)
        return Entity.serialize_list(asset_types, obj_type="AssetType")


class ShotAssetTypesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all asset shots for given soht.
        """
        asset_types = assets_service.get_asset_types_for_shot(shot_id)
        return Entity.serialize_list(asset_types, obj_type="AssetType")


class ProjectAssetsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all assets for given project.
        """
        criterions = query.get_query_criterions_from_request(request)
        criterions["project_id"] = project_id
        assets = assets_service.get_assets(criterions)
        return Entity.serialize_list(assets, obj_type="Asset")


class ProjectAssetTypeAssetsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, project_id, asset_type_id):
        """
        Retrieve all assets for given project and entity type.
        """
        criterions = query.get_query_criterions_from_request(request)
        criterions["project_id"] = project_id
        criterions["entity_type_id"] = asset_type_id
        assets = assets_service.get_assets(criterions)
        return Entity.serialize_list(assets, obj_type="Asset")


class AssetTasksResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, asset_id):
        """
        Retrieve all tasks related to a given shot.
        """
        try:
            return tasks_service.get_tasks_for_asset(asset_id)
        except AssetNotFoundException:
            abort(404)


class AssetTaskTypesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, asset_id):
        """
        Retrieve all task types related to a given asset.
        """
        try:
            asset = assets_service.get_asset(asset_id)
            return tasks_service.get_task_types_for_asset(asset)
        except AssetNotFoundException:
            abort(404)


class NewAssetResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self, project_id, asset_type_id):
        (
            name,
            description
        ) = self.get_arguments()

        try:
            project = projects_service.get_project(project_id)
            asset_type = assets_service.get_asset_type(asset_type_id)
            asset = assets_service.create_asset(
                project,
                asset_type,
                name,
                description
            )
        except ProjectNotFoundException:
            abort(404)
        except AssetTypeNotFoundException:
            abort(404)

        return asset.serialize(obj_type="Asset"), 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "name",
            help="The asset name is required.",
            required=True
        )
        parser.add_argument("description")
        args = parser.parse_args()

        return (
            args["name"],
            args.get("description", ""),
        )
