from test.base import ApiDBTestCase

from zou.app.models.entity import Entity


class ProjectSequencesTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectSequencesTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_data(Entity, 3,
                           entities_out=[],
                           project_id=self.project.id,
                           entity_type_id=self.sequence_type.id)
        self.generate_data(Entity, 2,
                           entities_out=[],
                           project_id=self.project_standard.id,
                           entity_type_id=self.sequence_type.id)

    def test_get_sequences_for_project(self):
        sequences = self.get("data/projects/%s/sequences" % self.project.id)
        self.assertEquals(len(sequences), 4)
        self.assertDictEqual(
            sequences[0],
            self.sequence.serialize(obj_type="Sequence")
        )

    def test_get_sequences_for_project_404(self):
        self.get("data/projects/unknown/sequences", 404)
