from flask import abort
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import (
    user_service,
    assets_service,
    projects_service,
    shots_service
)

from zou.app.services.exception import (
    AssetNotFoundException,
    AssetTypeNotFoundException,
    ProjectNotFoundException,
    SequenceNotFoundException,
    ShotNotFoundException,
)


class AssetTasksResource(Resource):

    @jwt_required
    def get(self, asset_id):
        try:
            assets_service.get_asset(asset_id)
            tasks = user_service.get_entity_tasks(asset_id)
        except AssetNotFoundException:
            abort(404)
        return tasks


class AssetTaskTypesResource(Resource):

    @jwt_required
    def get(self, asset_id):
        try:
            assets_service.get_asset(asset_id)
            tasks = user_service.get_entity_task_types(asset_id)
        except AssetNotFoundException:
            abort(404)
        return tasks


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
        try:
            projects_service.get_project(project_id)
            assets_service.get_asset_type(asset_type_id)
            assets = user_service.get_asset_type_assets(
                project_id, asset_type_id
            )
        except AssetTypeNotFoundException:
            abort(404)
        except ProjectNotFoundException:
            abort(404)
        return assets


class OpenProjectsResource(Resource):

    @jwt_required
    def get(self):
        projects = user_service.get_projects()
        return projects


class ProjectSequencesResource(Resource):

    @jwt_required
    def get(self, project_id):
        try:
            projects_service.get_project(project_id)
            sequences = user_service.get_project_sequences(project_id)
        except ProjectNotFoundException:
            abort(404)
        return sequences


class ProjectAssetTypesResource(Resource):

    @jwt_required
    def get(self, project_id):
        try:
            projects_service.get_project(project_id)
            asset_types = user_service.get_project_asset_types(project_id)
        except ProjectNotFoundException:
            abort(404)
        return asset_types


class SequenceShotsResource(Resource):

    @jwt_required
    def get(self, sequence_id):
        try:
            shots_service.get_sequence(sequence_id)
            shots = user_service.get_sequence_shots(sequence_id)
        except SequenceNotFoundException:
            abort(404)
        return shots


class ShotTasksResource(Resource):

    @jwt_required
    def get(self, shot_id):
        try:
            shots_service.get_shot(shot_id)
            tasks = user_service.get_entity_tasks(shot_id)
        except ShotNotFoundException:
            abort(404)
        return tasks


class SceneTasksResource(Resource):

    @jwt_required
    def get(self, scene_id):
        shots_service.get_scene(scene_id)
        return user_service.get_entity_tasks(scene_id)


class TodosResource(Resource):

    @jwt_required
    def get(self):
        return user_service.get_todos()
