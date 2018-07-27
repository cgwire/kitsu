from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    AssetTasksResource,
    AssetTaskTypesResource,
    AssetTypeAssetsResource,
    OpenProjectsResource,
    ProjectEpisodesResource,
    ProjectSequencesResource,
    ProjectAssetTypesResource,
    SceneTasksResource,
    SceneTaskTypesResource,
    SequenceShotsResource,
    SequenceScenesResource,
    ShotTasksResource,
    ShotTaskTypesResource,
    TodosResource,
    DoneResource,
    FilterResource,
    DesktopLoginLogsResource,
    FiltersResource,
    NotificationsResource,
    NotificationResource,
    HasTaskSubscribedResource,
    TaskSubscribeResource,
    TaskUnsubscribeResource,
    TimeSpentsResource,
    HasSequenceSubscribedResource,
    SequenceSubscriptionsResource,
    SequenceSubscribeResource,
    SequenceUnsubscribeResource
)

routes = [
    ("/data/user/assets/<asset_id>/tasks", AssetTasksResource),
    ("/data/user/shots/<shot_id>/tasks", ShotTasksResource),
    ("/data/user/scenes/<scene_id>/tasks", SceneTasksResource),
    ("/data/user/assets/<asset_id>/task-types", AssetTaskTypesResource),
    ("/data/user/shots/<shot_id>/task-types", ShotTaskTypesResource),
    ("/data/user/scenes/<scene_id>/task-types", SceneTaskTypesResource),

    ("/data/user/projects/open", OpenProjectsResource),
    ("/data/user/projects/<project_id>/asset-types", ProjectAssetTypesResource),
    (
        "/data/user/projects/<project_id>/asset-types/<asset_type_id>/assets",
        AssetTypeAssetsResource
    ),
    ("/data/user/projects/<project_id>/sequences", ProjectSequencesResource),
    ("/data/user/projects/<project_id>/episodes", ProjectEpisodesResource),

    ("/data/user/sequences/<sequence_id>/shots", SequenceShotsResource),
    ("/data/user/sequences/<sequence_id>/scenes", SequenceScenesResource),

    ("/data/user/tasks", TodosResource),
    ("/data/user/done-tasks", DoneResource),

    ("/data/user/filters", FiltersResource),
    ("/data/user/filters/<filter_id>", FilterResource),

    ("/data/user/desktop-login-logs", DesktopLoginLogsResource),
    ("/data/user/time-spents/<date>", TimeSpentsResource),

    ("/data/user/notifications", NotificationsResource),
    ("/data/user/notifications/<notification_id>", NotificationResource),

    ("/data/user/tasks/<task_id>/subscribed", HasTaskSubscribedResource),
    ("/actions/user/tasks/<task_id>/subscribe", TaskSubscribeResource),
    ("/actions/user/tasks/<task_id>/unsubscribe", TaskUnsubscribeResource),

    (
        "/data/user/entities/<entity_id>/task-types/<task_type_id>/subscribed",
        HasSequenceSubscribedResource
    ),
    (
        "/data/user/projects/<project_id>/task-types/<task_type_id>/sequence-subscriptions",
        SequenceSubscriptionsResource
    ),
    (
        "/actions/user/sequences/<sequence_id>/task-types/<task_type_id>/subscribe",
        SequenceSubscribeResource
    ),
    (
        "/actions/user/sequences/<sequence_id>/task-types/<task_type_id>/unsubscribe",
        SequenceUnsubscribeResource
    )
]

blueprint = Blueprint("user", "user")
api = configure_api_from_blueprint(blueprint, routes)
