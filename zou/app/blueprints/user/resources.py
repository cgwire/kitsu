from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import (
    user_service,
    assets_service,
    projects_service,
    shots_service
)


class AssetTasksResource(Resource):
    """
    Return tasks related to given asset for current user.
    """

    @jwt_required
    def get(self, asset_id):
        assets_service.get_asset(asset_id)
        return user_service.get_entity_tasks(asset_id)


class AssetTaskTypesResource(Resource):
    """
    Return task types related to given asset for current user.
    """

    @jwt_required
    def get(self, asset_id):
        assets_service.get_asset(asset_id)
        return user_service.get_entity_task_types(asset_id)


class ShotTaskTypesResource(Resource):
    """
    Return tasks related to given shot for current user.
    """

    @jwt_required
    def get(self, shot_id):
        shots_service.get_shot(shot_id)
        return user_service.get_entity_task_types(shot_id)


class SceneTaskTypesResource(Resource):
    """
    Return tasks related to given scene for current user.
    """

    @jwt_required
    def get(self, scene_id):
        shots_service.get_scene(scene_id)
        return user_service.get_entity_task_types(scene_id)


class AssetTypeAssetsResource(Resource):
    """
    Return assets of which type is given asset type and are listed in given
    project if user has access to this project.
    """

    @jwt_required
    def get(self, project_id, asset_type_id):
        projects_service.get_project(project_id)
        assets_service.get_asset_type(asset_type_id)
        return user_service.get_asset_type_assets(
            project_id, asset_type_id
        )


class OpenProjectsResource(Resource):
    """
    Return open projects for which the user has at least one task assigned.
    """

    @jwt_required
    def get(self):
        name = request.args.get("name", None)
        return user_service.get_open_projects(name=name)


class ProjectSequencesResource(Resource):
    """
    Return sequences related to given project if the current user has access to
    it.
    """

    @jwt_required
    def get(self, project_id):
        projects_service.get_project(project_id)
        return user_service.get_project_sequences(project_id)


class ProjectEpisodesResource(Resource):
    """
    Return episodes related to given project if the current user has access to
    it.
    """

    @jwt_required
    def get(self, project_id):
        projects_service.get_project(project_id)
        return user_service.get_project_episodes(project_id)


class ProjectAssetTypesResource(Resource):
    """
    Return asset types related to given project if the current user has access
    to it.
    """

    @jwt_required
    def get(self, project_id):
        projects_service.get_project(project_id)
        return user_service.get_project_asset_types(project_id)


class SequenceShotsResource(Resource):
    """
    Return shots related to given sequence if the current user has access
    to it.
    """

    @jwt_required
    def get(self, sequence_id):
        shots_service.get_sequence(sequence_id)
        return user_service.get_sequence_shots(sequence_id)


class SequenceScenesResource(Resource):
    """
    Return scenes related to given sequence if the current user has access
    to it.
    """

    @jwt_required
    def get(self, sequence_id):
        shots_service.get_sequence(sequence_id)
        return user_service.get_sequence_scenes(sequence_id)


class ShotTasksResource(Resource):
    """
    Return tasks related to given shot for current user.
    """

    @jwt_required
    def get(self, shot_id):
        shots_service.get_shot(shot_id)
        return user_service.get_entity_tasks(shot_id)


class SceneTasksResource(Resource):
    """
    Return tasks related to given scene for current user.
    """

    @jwt_required
    def get(self, scene_id):
        shots_service.get_scene(scene_id)
        return user_service.get_entity_tasks(scene_id)


class TodosResource(Resource):
    """
    Return tasks currently assigned to current user and of which status
    has is_done attribute set to false.
    """

    @jwt_required
    def get(self):
        return user_service.get_todos()


class DoneResource(Resource):
    """
    Return tasks currently assigned to current user and of which status
    has is_done attribute set to true. It returns only tasks of open projects.
    """

    @jwt_required
    def get(self):
        return user_service.get_done_tasks()
