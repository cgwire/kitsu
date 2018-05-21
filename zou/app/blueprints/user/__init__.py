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
    SequenceShotsResource,
    SequenceScenesResource,
    ShotTasksResource,
    ShotTaskTypesResource,
    SceneTasksResource,
    SceneTaskTypesResource,
    TodosResource,
    DoneResource,
    FilterResource,
    DesktopLoginLogsResource,
    FiltersResource,
    NotificationsResource
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

    ("/data/user/notifications", NotificationsResource)
]

blueprint = Blueprint("user", "user")
api = configure_api_from_blueprint(blueprint, routes)
