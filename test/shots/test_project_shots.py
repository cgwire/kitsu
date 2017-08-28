from test.base import ApiDBTestCase

from zou.app.models.entity import Entity


class ProjectShotsTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectShotsTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_data(Entity, 3,
                           entities_out=[],
                           project_id=self.project.id,
                           entity_type_id=self.shot_type.id)
        self.generate_data(Entity, 2,
                           entities_out=[],
                           project_id=self.project_standard.id,
                           entity_type_id=self.shot_type.id)

    def test_get_sequences_for_project(self):
        shots = self.get("data/projects/%s/shots" % self.project.id)
        self.assertEquals(len(shots), 5)
        self.assertDictEqual(
            shots[0],
            self.shot.serialize(obj_type="Shot")
        )

    def test_get_sequences_for_project_404(self):
        self.get("data/projects/unknown/shots", 404)
