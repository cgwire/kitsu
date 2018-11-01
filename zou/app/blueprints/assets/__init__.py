from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    AssetsAndTasksResource,
    AssetAssetInstancesResource,
    AssetResource,
    AssetShotAssetInstancesResource,
    AssetSceneAssetInstancesResource,
    AssetTypeResource,
    AssetTypesResource,
    AssetTasksResource,
    AssetTaskTypesResource,
    AllAssetsResource,
    CastInResource,
    NewAssetResource,
    ProjectAssetsResource,
    ProjectAssetTypeAssetsResource,
    ProjectAssetTypesResource,
    ShotAssetTypesResource
)


routes = [
    ("/data/asset-types", AssetTypesResource),
    ("/data/asset-types/<asset_type_id>", AssetTypeResource),
    ("/data/assets/all", AllAssetsResource),
    ("/data/assets/with-tasks", AssetsAndTasksResource),
    ("/data/assets/<asset_id>", AssetResource),
    ("/data/assets/<asset_id>/tasks", AssetTasksResource),
    ("/data/assets/<asset_id>/task-types", AssetTaskTypesResource),
    ("/data/assets/<asset_id>/cast-in", CastInResource),
    (
        "/data/assets/<asset_id>/shot-asset-instances",
        AssetShotAssetInstancesResource
    ),
    (
        "/data/assets/<asset_id>/scene-asset-instances",
        AssetSceneAssetInstancesResource
    ),
    (
        "/data/assets/<asset_id>/asset-asset-instances",
        AssetAssetInstancesResource
    ),
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
    )
]

blueprint = Blueprint("assets", "assets")
api = configure_api_from_blueprint(blueprint, routes)
