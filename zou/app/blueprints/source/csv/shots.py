from zou.app.blueprints.source.csv.base import BaseCsvProjectImportResource

from zou.app.services import shots_service
from zou.app.models.entity import Entity

from sqlalchemy.exc import IntegrityError


class ShotsCsvImportResource(BaseCsvProjectImportResource):

    def prepare_import(self):
        self.episodes = {}
        self.sequences = {}

    def import_row(self, row, project_id):
        episode_name = row["Episode"]
        sequence_name = row["Sequence"]
        shot_name = row["Name"]
        description = row["Description"]
        frame_in = row["Frame In"]
        frame_out = row["Frame Out"]

        episode_key = "%s-%s" % (project_id, episode_name)
        if episode_key not in self.episodes:
            self.episodes[episode_key] = \
                shots_service.get_or_create_episode(project_id, episode_name)

        sequence_key = "%s-%s-%s" % (project_id, episode_name, sequence_name)
        if sequence_key not in self.sequences:
            episode = self.episodes[episode_key]
            self.sequences[sequence_key] = \
                shots_service.get_or_create_sequence(
                    project_id,
                    episode["id"],
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
                    "frame_in": frame_in,
                    "frame_out": frame_out
                }
            )
        except IntegrityError:
            entity = Entity.get_by(
                name=shot_name,
                project_id=project_id,
                parent_id=sequence_id,
                entity_type_id=shot_type["id"]
            )

        return entity
