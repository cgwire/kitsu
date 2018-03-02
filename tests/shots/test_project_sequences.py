from tests.base import ApiDBTestCase


class ProjectSequencesTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectSequencesTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_sequence("SE01")
        self.serialized_sequence = self.sequence.serialize(obj_type="Sequence")
        self.generate_fixture_sequence("SE02")
        self.generate_fixture_sequence("SE03")
        self.generate_fixture_sequence(
            "SE01", project_id=self.project_standard.id)
        self.generate_fixture_sequence(
            "SE02", project_id=self.project_standard.id)

    def test_get_sequences_for_project(self):
        sequences = self.get("data/projects/%s/sequences" % self.project.id)
        self.assertEquals(len(sequences), 3)
        self.assertDictEqual(
            sequences[0],
            self.serialized_sequence
        )

    def test_get_sequences_for_project_404(self):
        self.get("data/projects/unknown/sequences", 404)
