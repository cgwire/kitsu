from tests.base import ApiDBTestCase


class ProjectShotsTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectShotsTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot("SH01")
        self.serialized_shot = self.shot.serialize(obj_type="Shot")
        self.generate_fixture_shot("SH02")
        self.generate_fixture_shot("SH03")
        self.generate_fixture_sequence_standard()
        self.generate_fixture_shot_standard("SH01")
        self.generate_fixture_shot_standard("SH02")

    def test_get_sequences_for_project(self):
        shots = self.get("data/projects/%s/shots" % self.project.id)
        print([shot["name"] for shot in shots])
        self.assertEquals(len(shots), 3)
        self.assertDictEqual(shots[0], self.serialized_shot)

    def test_get_sequences_for_project_404(self):
        self.get("data/projects/unknown/shots", 404)
