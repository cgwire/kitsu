from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    AssetTypeResource,
    AssetTypesResource,
    AssetResource,
    AssetsResource,
    AllAssetsResource,
    AssetsAndTasksResource,
    ProjectAssetTypesResource,
    ShotAssetTypesResource,
    NewAssetResource,
    ProjectAssetsResource,
    ProjectAssetTypeAssetsResource,
    AssetTasksResource,
    AssetTaskTypesResource,
)


routes = [
    ("/data/asset-types", AssetTypesResource),
    ("/data/asset-types/<asset_type_id>", AssetTypeResource),
    ("/data/assets", AssetsResource),
    ("/data/assets/all", AllAssetsResource),
    ("/data/assets/with-tasks", AssetsAndTasksResource),
    ("/data/assets/<asset_id>", AssetResource),
    ("/data/assets/<asset_id>/tasks", AssetTasksResource),
    ("/data/assets/<asset_id>/task-types", AssetTaskTypesResource),
    (
        "/data/projects/<project_id>/asset-types/<asset_type_id>/assets",
        ProjectAssetTypeAssetsResource
    ),
    (
        "/data/projects/<project_id>/asset-types/<asset_type_id>/assets/new",
        NewAssetResource
    ),
    (
        "/data/projects/<project_id>/asset-types",
        ProjectAssetTypesResource
    ),
    (
        "/data/shots/<shot_id>/asset-types",
        ShotAssetTypesResource
    ),
    (
        "/data/projects/<project_id>/assets",
        ProjectAssetsResource
    ),
]

blueprint = Blueprint("assets", "assets")
api = configure_api_from_blueprint(blueprint, routes)
