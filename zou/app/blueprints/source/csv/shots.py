from zou.app.blueprints.source.csv.base import BaseCsvImportResource

from zou.app.services import shots_service, projects_service
from zou.app.models.entity import Entity

from sqlalchemy.exc import IntegrityError


class ShotsCsvImportResource(BaseCsvImportResource):

    def prepare_import(self):
        self.projects = {}
        self.episodes = {}
        self.sequences = {}

    def import_row(self, row):
        project_name = row["Project"]
        episode_name = row["Episode"]
        sequence_name = row["Sequence"]
        shot_name = row["Name"]
        description = row["Description"]
        fps = row["FPS"]
        frame_in = row["Frame In"]
        frame_out = row["Frame Out"]

        self.add_to_cache_if_absent(
            self.projects,
            projects_service.get_or_create,
            project_name
        )
        project_id = self.get_id_from_cache(self.projects, project_name)

        episode_key = "%s-%s" % (project_id, episode_name)
        if episode_key not in self.episodes:
            project = self.projects[project_name]
            self.episodes[episode_key] = \
                shots_service.get_or_create_episode(project["id"], episode_name)

        sequence_key = "%s-%s" % (project_id, sequence_name)
        if sequence_key not in self.sequences:
            project = self.projects[project_name]
            episode = self.episodes[episode_key]
            self.sequences[sequence_key] = \
                shots_service.get_or_create_sequence(
                    project["id"],
                    episode.id,
                    sequence_name
                )
        sequence_id = self.get_id_from_cache(self.sequences, sequence_key)

        shot_type = shots_service.get_shot_type()
        try:
            entity = Entity.create(
                name=shot_name,
                description=description,
                project_id=project_id,
                parent_id=sequence_id,
                entity_type_id=shot_type["id"],
                data={
                    "fps": fps,
                    "frame_in": frame_in,
                    "frame_out": frame_out
                }
            )
        except IntegrityError:
            entity = Entity.get_by(
                name=shot_name,
                project_id=project_id,
                parent_id=sequence_id,
                entity_type_id=shot_type.id
            )

        return entity
