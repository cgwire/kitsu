from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import (
    assets_service,
    breakdown_service,
    entities_service,
    projects_service,
    shots_service,
    user_service,
)

from zou.app.mixin import ArgsMixin
from zou.app.utils import permissions


class CastingResource(Resource):
    @jwt_required
    def get(self, project_id, entity_id):
        """
        Resource to retrieve the casting of a given entity.
        """
        user_service.check_project_access(project_id)
        return breakdown_service.get_casting(entity_id)

    @jwt_required
    def put(self, project_id, entity_id):
        """
        Resource to allow the modification of assets linked to an entity.
        """
        casting = request.json
        user_service.check_manager_project_access(project_id)
        return breakdown_service.update_casting(entity_id, casting)


class SequenceCastingResource(Resource):
    @jwt_required
    def get(self, project_id, sequence_id):
        """
        Resource to retrieve the casting of shots from given sequence.
        """
        user_service.check_project_access(project_id)
        shots_service.get_sequence(sequence_id)
        return breakdown_service.get_sequence_casting(sequence_id)


class AssetTypeCastingResource(Resource):
    @jwt_required
    def get(self, project_id, asset_type_id):
        """
        Resource to retrieve the casting of assets from given asset type.
        """
        user_service.check_project_access(project_id)
        assets_service.get_asset_type(asset_type_id)
        return breakdown_service.get_asset_type_casting(
            project_id, asset_type_id
        )


class ShotAssetInstancesResource(Resource, ArgsMixin):
    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all asset instances linked to shot.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return breakdown_service.get_asset_instances_for_shot(shot_id)

    @jwt_required
    def post(self, shot_id):
        """
        Add an asset instance to given shot.
        """
        args = self.get_args([("asset_instance_id", None, True)])
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        shot = breakdown_service.add_asset_instance_to_shot(
            shot_id, args["asset_instance_id"]
        )
        return shot, 201


class RemoveShotAssetInstanceResource(Resource, ArgsMixin):
    @jwt_required
    def delete(self, shot_id, asset_instance_id):
        """
        Remove an asset instance from given shot.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        shot = breakdown_service.remove_asset_instance_for_shot(
            shot_id, asset_instance_id
        )
        return "", 204


class SceneAssetInstancesResource(Resource, ArgsMixin):
    @jwt_required
    def get(self, scene_id):
        """
        Retrieve all asset instances linked to scene.
        """
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        return breakdown_service.get_asset_instances_for_scene(scene_id)

    @jwt_required
    def post(self, scene_id):
        """
        Create an asset instance on given scene.
        """
        args = self.get_args(
            [("asset_id", None, True), ("description", None, False)]
        )
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        asset_instance = breakdown_service.add_asset_instance_to_scene(
            scene_id, args["asset_id"], args["description"]
        )
        return asset_instance, 201


class SceneCameraInstancesResource(Resource):
    @jwt_required
    def get(self, scene_id):
        """
        Retrieve all asset instances linked to scene.
        """
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        return breakdown_service.get_camera_instances_for_scene(scene_id)


class ProjectEntityLinksResource(Resource):
    @jwt_required
    def get(self, project_id):
        """
        Retrieve all entity links related to given project.
        It's mainly used for synchronisation purpose.
        """
        permissions.check_admin_permissions()
        projects_service.get_project(project_id)
        return entities_service.get_entity_links_for_project(project_id)
