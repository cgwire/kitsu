from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    ShotResource,
    ShotsResource,
    ShotsAndTasksResource,
    ShotAssetsResource,
    ShotTaskTypesResource,
    ShotTasksResource,
    ProjectShotsResource,
    ProjectSequencesResource,
    ProjectEpisodesResource,

    EpisodeResource,
    EpisodesResource,
    EpisodeSequencesResource,

    SequenceResource,
    SequencesResource,
    SequenceShotsResource
)


routes = [
    ("/data/shots/all", ShotsResource),
    ("/data/shots/<instance_id>", ShotResource),
    ("/data/episodes", EpisodesResource),
    ("/data/episodes/<instance_id>", EpisodeResource),
    ("/data/episodes/<instance_id>/sequences", EpisodeSequencesResource),
    ("/data/sequences", SequencesResource),
    ("/data/sequences/<instance_id>", SequenceResource),
    ("/data/sequences/<instance_id>/shots", SequenceShotsResource),
    ("/data/shots/<instance_id>/assets", ShotAssetsResource),
    ("/data/shots/<shot_id>/task-types", ShotTaskTypesResource),
    ("/data/shots/<instance_id>/tasks", ShotTasksResource),
    ("/data/shots/with-tasks", ShotsAndTasksResource),
    ("/data/projects/<project_id>/shots", ProjectShotsResource),
    ("/data/projects/<project_id>/sequences", ProjectSequencesResource),
    ("/data/projects/<project_id>/episodes", ProjectEpisodesResource)
]


blueprint = Blueprint("shots", "shots")
api = configure_api_from_blueprint(blueprint, routes)
