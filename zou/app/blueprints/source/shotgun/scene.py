from flask_restful import current_app

from zou.app.models.project import Project
from zou.app.models.entity import Entity

from zou.app.services import shots_service

from zou.app.blueprints.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource,
)


class ImportShotgunScenesResource(BaseImportShotgunResource):
    def __init__(self):
        BaseImportShotgunResource.__init__(self)

    def prepare_import(self):
        self.scene_type = shots_service.get_shot_type()
        self.project_map = Project.get_id_map(field="name")

    def extract_data(self, sg_scene):
        project_id = self.get_project(sg_scene, self.project_map)
        sequence_id = self.get_sequence(sg_scene)
        scene_type = shots_service.get_scene_type()

        data = {
            "name": sg_scene["code"],
            "shotgun_id": sg_scene["id"],
            "project_id": project_id,
            "entity_type_id": scene_type["id"],
            "parent_id": sequence_id,
        }
        return data

    def get_project(self, sg_scene, project_map):
        project_id = None
        if sg_scene["project"] is not None:
            project_id = project_map.get(sg_scene["project"]["name"], None)
        return project_id

    def get_sequence(self, sg_scene):
        sequence_id = None
        sequence_key = "sequence_sg_scenes_1_sequences"
        if (
            sequence_key in sg_scene
            and sg_scene[sequence_key] is not None
            and len(sg_scene[sequence_key]) > 0
        ):
            sequence_id = self.get_sequence_id(sg_scene[sequence_key][0]["id"])
        return sequence_id

    def import_entry(self, data):
        scene = Entity.get_by(
            shotgun_id=data["shotgun_id"],
            entity_type_id=shots_service.get_scene_type()["id"],
        )

        if scene is None:
            scene = Entity(**data)
            scene.save()
            current_app.logger.info("Scene created: %s" % scene)

        else:
            scene.update(data)
            scene.save()
            current_app.logger.info("Scene updated: %s" % scene)

        return scene

    def filtered_entries(self):
        return self.sg_entries


class ImportRemoveShotgunSceneResource(ImportRemoveShotgunBaseResource):
    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(
            self, Entity, entity_type_id=shots_service.get_scene_type()["id"]
        )
