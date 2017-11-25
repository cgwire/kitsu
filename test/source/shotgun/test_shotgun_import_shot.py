from test.source.shotgun.base import ShotgunTestCase

from zou.app.models.entity import Entity
from zou.app.models.project import Project

from zou.app.services import shots_service


class ImportShotgunShotTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunShotTestCase, self).setUp()

        self.sg_shot = {
            "sg_cut_in": 0,
            "code": "SH03",
            "sg_sequence": {
                "type": "Sequence",
                "id": 1,
                "name": "S01"
            },
            "project": {
                "type": "Project",
                "id": 1,
                "name": "Agent327"
            },
            "assets": [
                {
                    "type": "Asset",
                    "id": 1,
                    "name": "Sheep"
                }
            ],
            "sg_cut_duration": 122,
            "sg_custom_field": "test",
            "type": "Shot",
            "id": 1
        }

    def test_import_shot(self):
        self.load_fixture('projects')
        self.load_fixture('sequences')
        self.load_fixture('assets')

        api_path = "/import/shotgun/shots"
        self.shots = self.post(api_path, [self.sg_shot], 200)
        self.assertEqual(len(self.shots), 1)

        self.shots = self.get("data/shots/all")
        self.assertEqual(len(self.shots), 1)

        shot = self.shots[0]
        sequence = Entity.get_by(
            shotgun_id=self.sg_shot["sg_sequence"]["id"],
            entity_type_id=shots_service.get_sequence_type()["id"]
        )
        entity = Entity.get_by(name=self.sg_shot["assets"][0]["name"])
        project = Project.get_by(name=self.sg_shot["project"]["name"])
        self.assertEqual(shot["name"], self.sg_shot["code"])
        self.assertEqual(shot["data"]["frame_in"], 0)
        self.assertEqual(shot["data"]["frame_out"], 122)
        self.assertEqual(shot["data"]["sg_custom_field"], "test")
        self.assertEqual(shot["parent_id"], str(sequence.id))
        self.assertEqual(shot["entities_out"][0], str(entity.id))
        self.assertEqual(shot["project_id"], str(project.id))

    def test_import_shot_twice(self):
        self.load_fixture('projects')
        self.load_fixture('sequences')
        self.load_fixture('assets')

        api_path = "/import/shotgun/shots"
        self.shots = self.post(api_path, [self.sg_shot], 200)
        self.shots = self.post(api_path, [self.sg_shot], 200)
        self.assertEqual(len(self.shots), 1)

        self.shots = self.get("data/shots/all")
        self.assertEqual(len(self.shots), 1)

    def test_import_shot_update(self):
        self.load_fixture('projects')
        self.load_fixture('sequences')
        self.load_fixture('assets')

        api_path = "/import/shotgun/shots"
        self.shots = self.post(api_path, [self.sg_shot], 200)

        self.sg_shot["sg_custom_field_2"] = "test 2"
        self.post(api_path, [self.sg_shot], 200)
        self.shots = self.get("data/shots/all")
        shot = self.shots[0]
        self.assertEqual(shot["data"]["sg_custom_field"], "test")
        self.assertEqual(shot["data"]["sg_custom_field_2"], "test 2")

    def test_remove_shots(self):
        self.load_fixture('projects')
        self.load_fixture('sequences')
        self.load_fixture('assets')

        api_path = "/import/shotgun/shots"
        self.post(api_path, [self.sg_shot], 200)

        self.shots = self.get("data/shots/all")
        self.assertEqual(len(self.shots), 1)
        shot = self.shots[0]

        api_path = "/import/shotgun/remove/shot"
        self.shots = self.post(api_path, {"id": shot["shotgun_id"]}, 200)

        self.shots = self.get("data/shots/all")
        self.assertEqual(len(self.shots), 0)

        self.get("data/shots/%s" % shot["id"], 404)
