from test.base import ApiDBTestCase
from zou.app.models.entity import Entity


class ShotTestCase(ApiDBTestCase):

    def setUp(self):
        super(ShotTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()

        self.shot_dict = self.shot.serialize(obj_type="Shot")
        self.shot_dict["project_name"] = self.project.name
        self.shot_dict["sequence_name"] = self.sequence.name

        self.generate_data(Entity, 3,
                           entities_out=[],
                           project_id=self.project.id,
                           entity_type_id=self.entity_type.id)
        self.generate_data(Entity, 2,
                           entities_out=[],
                           parent_id=self.sequence.id,
                           project_id=self.project.id,
                           entity_type_id=self.shot_type.id)

    def test_get_shots(self):
        shots = self.get("data/shots/all")

        self.assertEquals(len(shots), 3)
        self.assertDictEqual(shots[0], self.shot_dict)

    def test_get_shot(self):
        shot = self.get("data/shots/%s" % self.shot.id)
        self.assertEquals(shot["id"], str(self.shot.id))
        self.assertDictEqual(
            shot,
            self.shot.serialize(obj_type="Shot")
        )
