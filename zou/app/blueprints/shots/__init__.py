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
    SequenceShotsResource,
    SequenceTasksResource,
    SequenceTaskTypesResource,

    CastingResource
)


routes = [
    ("/data/shots/all", ShotsResource),
    ("/data/shots/with-tasks", ShotsAndTasksResource),
    ("/data/shots/<shot_id>", ShotResource),
    ("/data/shots/<shot_id>/assets", ShotAssetsResource),
    ("/data/shots/<shot_id>/task-types", ShotTaskTypesResource),
    ("/data/shots/<shot_id>/tasks", ShotTasksResource),
    ("/data/episodes", EpisodesResource),
    ("/data/episodes/<episode_id>", EpisodeResource),
    ("/data/episodes/<episode_id>/sequences", EpisodeSequencesResource),
    ("/data/sequences", SequencesResource),
    ("/data/sequences/<sequence_id>", SequenceResource),
    ("/data/sequences/<sequence_id>/shots", SequenceShotsResource),
    ("/data/sequences/<sequence_id>/tasks", SequenceTasksResource),
    ("/data/sequences/<sequence_id>/task-types", SequenceTaskTypesResource),
    ("/data/projects/<project_id>/shots", ProjectShotsResource),
    ("/data/projects/<project_id>/sequences", ProjectSequencesResource),
    ("/data/projects/<project_id>/episodes", ProjectEpisodesResource),

<<<<<<< a015f5e6804538fe6d1732a40fcf6b93b5cdc8f4
    ("/data/shots/<shot_id>/casting", CastingResource)
=======
    ("/actions/shots/<shot_id>/casting", CastingResource)
>>>>>>> Add breakdown routes and helpers
]


blueprint = Blueprint("shots", "shots")
api = configure_api_from_blueprint(blueprint, routes)
