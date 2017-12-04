from tests.source.shotgun.base import ShotgunTestCase

from zou.app.models.entity import Entity
from zou.app.models.project import Project

from zou.app.services import shots_service


class ImportShotgunSceneTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunSceneTestCase, self).setUp()

        self.sg_scene = {
            "code": "SC03",
            "sequence_sg_scenes_1_sequences": [{
                "type": "Sequence",
                "id": 1,
                "name": "S01"
            }],
            "project": {
                "type": "Project",
                "id": 1,
                "name": "Agent327"
            },
            "type": "Scene",
            "id": 4
        }

    def test_import_scene(self):
        self.load_fixture("projects")
        self.load_fixture("sequences")

        api_path = "/import/shotgun/scenes"
        self.scenes = self.post(api_path, [self.sg_scene], 200)
        self.assertEqual(len(self.scenes), 1)

        self.scenes = self.get("data/scenes/all")
        self.assertEqual(len(self.scenes), 1)

        scene = self.scenes[0]
        sequence = Entity.get_by(
            shotgun_id=self.sg_scene["sequence_sg_scenes_1_sequences"][0]["id"],
            entity_type_id=shots_service.get_sequence_type()["id"]
        )
        project = Project.get_by(name=self.sg_scene["project"]["name"])
        self.assertEqual(scene["name"], self.sg_scene["code"])
        self.assertEqual(scene["parent_id"], str(sequence.id))
        self.assertEqual(scene["project_id"], str(project.id))

    def test_import_scene_twice(self):
        self.load_fixture("projects")
        self.load_fixture("sequences")

        api_path = "/import/shotgun/scenes"
        self.scenes = self.post(api_path, [self.sg_scene], 200)
        self.scenes = self.post(api_path, [self.sg_scene], 200)
        self.assertEqual(len(self.scenes), 1)

        self.scenes = self.get("data/scenes/all")
        self.assertEqual(len(self.scenes), 1)

    def test_import_scene_update(self):
        self.load_fixture("projects")
        self.load_fixture("sequences")

        api_path = "/import/shotgun/scenes"
        self.scenes = self.post(api_path, [self.sg_scene], 200)

        self.sg_scene["code"] = "SH04"
        self.post(api_path, [self.sg_scene], 200)
        self.scenes = self.get("data/scenes/all")
        scene = self.scenes[0]
        self.assertEquals(self.sg_scene["code"], scene["name"])

    def test_remove_scene(self):
        self.load_fixture('projects')
        self.load_fixture("sequences")

        api_path = "/import/shotgun/scenes"
        self.scenes = self.post(api_path, [self.sg_scene], 200)
        scene = self.scenes[0]

        self.scenes = self.get("data/scenes/all")
        self.assertEqual(len(self.scenes), 1)

        api_path = "/import/shotgun/remove/scene"
        self.scenes = self.post(api_path, {"id": self.sg_scene["id"]}, 200)

        self.scenes = self.get("data/scenes/all")
        self.assertEqual(len(self.scenes), 0)

        self.get("data/scenes/%s" % scene["id"], 404)
