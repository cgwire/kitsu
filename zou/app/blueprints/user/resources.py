import datetime

from flask import request
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.mixin import ArgsMixin

from zou.app.services import (
    user_service,
    persons_service,
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
        return user_service.get_tasks_for_entity(asset_id)


class AssetTaskTypesResource(Resource):
    """
    Return task types related to given asset for current user.
    """

    @jwt_required
    def get(self, asset_id):
        assets_service.get_asset(asset_id)
        return user_service.get_task_types_for_entity(asset_id)


class ShotTaskTypesResource(Resource):
    """
    Return tasks related to given shot for current user.
    """

    @jwt_required
    def get(self, shot_id):
        shots_service.get_shot(shot_id)
        return user_service.get_task_types_for_entity(shot_id)


class SceneTaskTypesResource(Resource):
    """
    Return tasks related to given scene for current user.
    """

    @jwt_required
    def get(self, scene_id):
        shots_service.get_scene(scene_id)
        return user_service.get_task_types_for_entity(scene_id)


class AssetTypeAssetsResource(Resource):
    """
    Return assets of which type is given asset type and are listed in given
    project if user has access to this project.
    """

    @jwt_required
    def get(self, project_id, asset_type_id):
        projects_service.get_project(project_id)
        assets_service.get_asset_type(asset_type_id)
        return user_service.get_assets_for_asset_type(project_id, asset_type_id)


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
        return user_service.get_sequences_for_project(project_id)


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
        return user_service.get_asset_types_for_project(project_id)


class SequenceShotsResource(Resource):
    """
    Return shots related to given sequence if the current user has access
    to it.
    """

    @jwt_required
    def get(self, sequence_id):
        shots_service.get_sequence(sequence_id)
        return user_service.get_shots_for_sequence(sequence_id)


class SequenceScenesResource(Resource):
    """
    Return scenes related to given sequence if the current user has access
    to it.
    """

    @jwt_required
    def get(self, sequence_id):
        shots_service.get_sequence(sequence_id)
        return user_service.get_scenes_for_sequence(sequence_id)


class ShotTasksResource(Resource):
    """
    Return tasks related to given shot for current user.
    """

    @jwt_required
    def get(self, shot_id):
        shots_service.get_shot(shot_id)
        return user_service.get_tasks_for_entity(shot_id)


class SceneTasksResource(Resource):
    """
    Return tasks related to given scene for current user.
    """

    @jwt_required
    def get(self, scene_id):
        shots_service.get_scene(scene_id)
        return user_service.get_tasks_for_entity(scene_id)


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


class FiltersResource(Resource, ArgsMixin):
    """
    Allow to create and retrieve filters for current user and only for
    open projects.
    """

    @jwt_required
    def get(self):
        return user_service.get_filters()

    @jwt_required
    def post(self):
        arguments = self.get_arguments()

        return user_service.create_filter(
            arguments["list_type"],
            arguments["name"],
            arguments["query"],
            arguments["project_id"]
        ), 201

    def get_arguments(self):
        return self.get_args([
            ("name", "", True),
            ("query", "", True),
            ("list_type", "todo", True),
            ("project_id", None, False)
        ])


class FilterResource(Resource):
    """
    Allow to remove given filter if its owned by current user.
    """

    @jwt_required
    def delete(self, filter_id):
        return user_service.remove_filter(filter_id), 204


class DesktopLoginLogsResource(Resource):
    """
    Allow to create and retrieve desktop login logs. Desktop login logs can only
    be created by current user.
    """

    @jwt_required
    def get(self):
        current_user = persons_service.get_current_user()
        return persons_service.get_desktop_login_logs(current_user["id"])

    @jwt_required
    def post(self):
        arguments = self.get_arguments()
        current_user = persons_service.get_current_user()
        desktop_login_log = persons_service.create_desktop_login_logs(
            current_user["id"],
            arguments["date"]
        )
        return desktop_login_log, 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("date", default=datetime.datetime.now())
        return parser.parse_args()


class NotificationsResource(Resource):
    """
    Return last 100 user notifications.
    """

    @jwt_required
    def get(self):
        notifications = user_service.get_last_notifications()
        user_service.mark_notifications_as_read()
        return notifications
