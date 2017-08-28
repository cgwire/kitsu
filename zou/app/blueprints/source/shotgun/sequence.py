from flask_restful import current_app

from zou.app.models.project import Project
from zou.app.models.entity import Entity
from zou.app.services import shots_service
from zou.app.blueprints.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource
)
from zou.app.blueprints.source.shotgun.exception import ShotgunEntryImportFailed


class ImportShotgunSequencesResource(BaseImportShotgunResource):

    def prepare_import(self):
        self.sequence_type = shots_service.get_sequence_type()
        self.project_map = Project.get_id_map(field="name")

    def extract_data(self, sg_sequence):
        project_id = self.get_project(sg_sequence)
        if project_id is None:
            raise ShotgunEntryImportFailed

        return {
            "name": sg_sequence["code"],
            "shotgun_id": sg_sequence["id"],
            "description": sg_sequence["description"],
            "project_id": project_id,
            "entity_type_id": self.sequence_type.id
        }

    def get_project(self, sg_sequence):
        project_id = None
        if sg_sequence["project"] is not None:
            project_name = sg_sequence["project"]["name"]
            project_id = self.project_map.get(project_name, None)
        return project_id

    def import_entry(self, data):
        sequence = Entity.get_by(
            shotgun_id=data["shotgun_id"],
            entity_type_id=self.sequence_type.id
        )

        if sequence is None:
            sequence = Entity(**data)
            sequence.save()
            current_app.logger.info("Sequence created: %s" % sequence)

        else:
            sequence.update(data)
            sequence.save()
            current_app.logger.info("Sequence updated: %s" % sequence)

        return sequence


class ImportRemoveShotgunSequenceResource(ImportRemoveShotgunBaseResource):

    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(self, Entity)
