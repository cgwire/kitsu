import datetime

from flask import request, abort
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.mixin import ArgsMixin

from zou.app.services import (
    assets_service,
    persons_service,
    projects_service,
    shots_service,
    time_spents_service,
    user_service
)

from zou.app.services.exception import WrongDateFormatException


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
            arguments["project_id"],
            arguments["entity_type"]
        ), 201

    def get_arguments(self):
        return self.get_args([
            ("name", "", True),
            ("query", "", True),
            ("list_type", "todo", True),
            ("project_id", None, False),
            ("entity_type", None, False)
        ])


class FilterResource(Resource):
    """
    Allow to remove given filter if its owned by current user.
    """

    @jwt_required
    def delete(self, filter_id):
        user_service.remove_filter(filter_id)
        return '', 204


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


class NotificationResource(Resource):
    """
    Return notification matching given id, only if it's a notification that
    belongs to current user.
    """

    @jwt_required
    def get(self, notification_id):
        return user_service.get_notification(notification_id)


class HasTaskSubscribedResource(Resource):
    """
    Return true if current user has subscribed to given task.
    """

    @jwt_required
    def get(self, task_id):
        return user_service.has_task_subscription(task_id)


class TaskSubscribeResource(Resource):
    """
    Create a subscription entry for given task and current user. When an user
    subscribe it gets notification everytime a comment is posted on the task.
    """

    @jwt_required
    def post(self, task_id):
        return user_service.subscribe_to_task(task_id), 201


class TaskUnsubscribeResource(Resource):
    """
    Remove the subscription entry matching given task and current user.
    The user will no longer receive notifications for this task.
    """

    @jwt_required
    def delete(self, task_id):
        user_service.unsubscribe_from_task(task_id)
        return '', 204


class HasSequenceSubscribedResource(Resource):
    """
    Return true if current user has subscribed to given sequence and task type.
    """

    @jwt_required
    def get(self, sequence_id, task_type_id):
        return user_service.has_sequence_subscription(sequence_id, task_type_id)


class SequenceSubscribeResource(Resource):
    """
    Create a subscription entry for given sequence and current user. When an
    subscribe it gets notification everytime a comment is posted on tasks
    related to the sequence.
    """

    @jwt_required
    def post(self, sequence_id, task_type_id):
        subscription = user_service.subscribe_to_sequence(
            sequence_id,
            task_type_id
        )
        return subscription, 201


class SequenceUnsubscribeResource(Resource):
    """
    Create a subscription entry for given sequence, task type and current user.
    """

    @jwt_required
    def delete(self, sequence_id, task_type_id):
        user_service.unsubscribe_from_sequence(
            sequence_id,
            task_type_id
        )
        return '', 204


class SequenceSubscriptionsResource(Resource):
    """
    Return list of sequence ids to which the current user has subscribed
    for given task type
    """

    @jwt_required
    def get(self, project_id, task_type_id):
        return user_service.get_sequence_subscriptions(project_id, task_type_id)


class TimeSpentsResource(Resource):
    """
    Get time spents on for current user and given date.
    """

    @jwt_required
    def get(self, date):
        try:
            current_user = persons_service.get_current_user()
            return time_spents_service.get_time_spents(current_user["id"], date)
        except WrongDateFormatException:
            abort(404)
