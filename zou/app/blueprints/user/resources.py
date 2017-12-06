from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import (
    user_service,
    assets_service,
    projects_service,
    shots_service
)


class AssetTasksResource(Resource):

    @jwt_required
    def get(self, asset_id):
        assets_service.get_asset(asset_id)
        return user_service.get_entity_tasks(asset_id)


class AssetTaskTypesResource(Resource):

    @jwt_required
    def get(self, asset_id):
        assets_service.get_asset(asset_id)
        return user_service.get_entity_task_types(asset_id)


class ShotTaskTypesResource(Resource):

    @jwt_required
    def get(self, shot_id):
        shots_service.get_shot(shot_id)
        return user_service.get_entity_task_types(shot_id)


class SceneTaskTypesResource(Resource):

    @jwt_required
    def get(self, scene_id):
        shots_service.get_scene(scene_id)
        return user_service.get_entity_task_types(scene_id)


class AssetTypeAssetsResource(Resource):

    @jwt_required
    def get(self, project_id, asset_type_id):
        projects_service.get_project(project_id)
        assets_service.get_asset_type(asset_type_id)
        return user_service.get_asset_type_assets(
            project_id, asset_type_id
        )


class OpenProjectsResource(Resource):

    @jwt_required
    def get(self):
        projects = user_service.get_projects()
        return projects


class ProjectSequencesResource(Resource):

    @jwt_required
    def get(self, project_id):
        projects_service.get_project(project_id)
        return user_service.get_project_sequences(project_id)


class ProjectEpisodesResource(Resource):

    @jwt_required
    def get(self, project_id):
        projects_service.get_project(project_id)
        return user_service.get_project_episodes(project_id)


class ProjectAssetTypesResource(Resource):

    @jwt_required
    def get(self, project_id):
        projects_service.get_project(project_id)
        return user_service.get_project_asset_types(project_id)


class SequenceShotsResource(Resource):

    @jwt_required
    def get(self, sequence_id):
        shots_service.get_sequence(sequence_id)
        return user_service.get_sequence_shots(sequence_id)


class SequenceScenesResource(Resource):

    @jwt_required
    def get(self, sequence_id):
        shots_service.get_sequence(sequence_id)
        return user_service.get_sequence_scenes(sequence_id)


class ShotTasksResource(Resource):

    @jwt_required
    def get(self, shot_id):
        shots_service.get_shot(shot_id)
        return user_service.get_entity_tasks(shot_id)


class SceneTasksResource(Resource):

    @jwt_required
    def get(self, scene_id):
        shots_service.get_scene(scene_id)
        return user_service.get_entity_tasks(scene_id)


class TodosResource(Resource):

    @jwt_required
    def get(self):
        return user_service.get_todos()
