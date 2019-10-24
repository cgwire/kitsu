from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    AllProjectsResource,
    OpenProjectsResource,
    ProductionTeamResource,
    ProductionTeamRemoveResource,
    ProductionMetadataDescriptorResource,
    ProductionMetadataDescriptorsResource,
    ProductionMilestonesResource,
    ProductionScheduleItemsResource,
    ProductionTaskTypeScheduleItemsResource,
    ProductionAssetTypesScheduleItemsResource,
    ProductionEpisodesScheduleItemsResource,
    ProductionSequencesScheduleItemsResource,
    ProductionTimeSpentsResource,
)

routes = [
    ("/data/projects/open", OpenProjectsResource),
    ("/data/projects/all", AllProjectsResource),
    ("/data/projects/<project_id>/team", ProductionTeamResource),
    (
        "/data/projects/<project_id>/team/<person_id>",
        ProductionTeamRemoveResource,
    ),
    (
        "/data/projects/<project_id>/metadata-descriptors",
        ProductionMetadataDescriptorsResource,
    ),
    (
        "/data/projects/<project_id>/metadata-descriptors/<descriptor_id>",
        ProductionMetadataDescriptorResource,
    ),
    ("/data/projects/<project_id>/milestones", ProductionMilestonesResource),
    (
        "/data/projects/<project_id>/schedule-items",
        ProductionScheduleItemsResource,
    ),
    (
        "/data/projects/<project_id>/schedule-items/task-types",
        ProductionTaskTypeScheduleItemsResource,
    ),
    (
        "/data/projects/<project_id>/schedule-items/<task_type_id>/asset-types",
        ProductionAssetTypesScheduleItemsResource,
    ),
    (
        "/data/projects/<project_id>/schedule-items/<task_type_id>/episodes",
        ProductionEpisodesScheduleItemsResource,
    ),
    (
        "/data/projects/<project_id>/schedule-items/<task_type_id>/sequences",
        ProductionSequencesScheduleItemsResource,
    ),
    ("/data/projects/<project_id>/time-spents", ProductionTimeSpentsResource),
]

blueprint = Blueprint("projects", "projects")
api = configure_api_from_blueprint(blueprint, routes)
