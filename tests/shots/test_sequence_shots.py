from tests.base import ApiDBTestCase
from zou.app.models.entity import Entity


class SequenceShotsTestCase(ApiDBTestCase):

    def setUp(self):
        super(SequenceShotsTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()

        self.shot_dict = self.shot.serialize(obj_type="Shot")
        self.shot_dict["project_name"] = self.project.name
        self.shot_dict["sequence_name"] = self.sequence.name

        self.generate_data(
            Entity,
            3,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.asset_type.id
        )
        self.generate_data(
            Entity,
            2,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.shot_type.id
        )

    def test_get_shots_for_sequence(self):
        shots = self.get("data/sequences/%s/shots" % self.sequence.id)
        self.assertEquals(len(shots), 1)
        self.assertDictEqual(shots[0], self.shot_dict)
