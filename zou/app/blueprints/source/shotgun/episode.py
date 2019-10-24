from flask_restful import current_app

from zou.app.models.project import Project
from zou.app.models.entity import Entity
from zou.app.services import shots_service
from zou.app.blueprints.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource,
)
from zou.app.blueprints.source.shotgun.exception import ShotgunEntryImportFailed


class ImportShotgunEpisodesResource(BaseImportShotgunResource):
    def prepare_import(self):
        self.episode_type = shots_service.get_episode_type()
        self.project_map = Project.get_id_map(field="name")

    def extract_data(self, sg_episode):
        project_id = self.get_project(sg_episode)
        if project_id is None:
            raise ShotgunEntryImportFailed

        return {
            "name": sg_episode["code"],
            "shotgun_id": sg_episode["id"],
            "description": sg_episode["description"],
            "project_id": project_id,
            "entity_type_id": self.episode_type["id"],
        }

    def get_project(self, sg_episode):
        project_id = None
        if sg_episode["project"] is not None:
            project_name = sg_episode["project"]["name"]
            project_id = self.project_map.get(project_name, None)
        return project_id

    def import_entry(self, data):
        episode = Entity.get_by(
            shotgun_id=data["shotgun_id"],
            entity_type_id=self.episode_type["id"],
        )

        if episode is None:
            episode = Entity(**data)
            episode.save()
            current_app.logger.info("Episode created: %s" % episode)

        else:
            episode.update(data)
            episode.save()
            current_app.logger.info("Episode updated: %s" % episode)

        return episode


class ImportRemoveShotgunEpisodeResource(ImportRemoveShotgunBaseResource):
    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(
            self, Entity, entity_type_id=shots_service.get_episode_type()["id"]
        )
