from tests.base import ApiDBTestCase

from zou.app.services import shots_service


class ShotTestCase(ApiDBTestCase):

    def setUp(self):
        super(ShotTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot("SH01")
        self.shot_dict = self.shot.serialize(obj_type="Shot")
        self.shot_dict["project_name"] = self.project.name
        self.shot_dict["sequence_name"] = self.sequence.name

        self.generate_fixture_shot("SH02")
        self.generate_fixture_shot("SH03")
        self.generate_fixture_entity()

    def test_get_shots(self):
        shots = self.get("data/shots/all")
        self.assertEquals(len(shots), 3)
        self.assertDictEqual(shots[0], self.shot_dict)

    def test_remove_shot(self):
        self.generate_fixture_entity()
        path = "data/shots/%s" % self.shot.id
        shots = shots_service.get_shots()
        self.assertEquals(len(shots), 3)
        self.delete(path)
        shots = shots_service.get_shots()
        self.assertEquals(len(shots), 2)

    def test_get_shot(self):
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_department()
        self.generate_fixture_task_status()
        self.generate_fixture_task_type()
        self.generate_fixture_shot_task()

        shot = self.get("data/shots/%s" % self.shot.id)
        self.assertEquals(shot["id"], str(self.shot.id))
        self.assertEquals(shot["name"], self.shot.name)
        self.assertEquals(shot["sequence_name"], self.sequence.name)
        self.assertEquals(shot["sequence_id"], str(self.sequence.id))
        self.assertEquals(shot["episode_name"], self.episode.name)
        self.assertEquals(shot["episode_id"], str(self.episode.id))
        self.assertEquals(shot["project_name"], self.project.name)
        self.assertEquals(len(shot["tasks"]), 1)

    def test_remove_shot_with_tasks(self):
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_department()
        self.generate_fixture_task_status()
        self.generate_fixture_task_type()
        self.generate_fixture_shot_task()

        path = "data/shots/%s" % self.shot.id
        self.delete(path)
        shots = shots_service.get_shots()
        self.assertEquals(len(shots), 3)
        self.assertEquals(shots[2]["canceled"], True)

    def test_create_shot(self):
        shot_name = "NSH01"
        project_id = str(self.project.id)
        sequence_id = str(self.sequence.id)
        data = {
            "name": shot_name,
            "sequence_id": sequence_id,
            "data": {
                "frame_in": 10,
                "frame_out": 20
            }
        }
        shot = self.post(
            "data/projects/%s/shots" % project_id,
            data
        )
        shot = self.get("data/shots/%s" % shot["id"])
        self.assertEquals(shot["name"], shot_name)
        self.assertEquals(shot["parent_id"], sequence_id)
        self.assertDictEqual(shot["data"], data["data"])
