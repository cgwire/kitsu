from tests.base import ApiDBTestCase


class ProjectEpisodesTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectEpisodesTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_episode("E01")
        self.serialized_episode = self.episode.serialize(obj_type="Episode")
        self.generate_fixture_episode("E02")
        self.generate_fixture_episode("E03")
        self.generate_fixture_episode(
            "E01", project_id=self.project_standard.id)
        self.generate_fixture_episode(
            "E02", project_id=self.project_standard.id)

    def test_get_episodes_for_project(self):
        episodes = self.get("data/projects/%s/episodes" % self.project.id)
        self.assertEquals(len(episodes), 3)
        self.assertDictEqual(episodes[0], self.serialized_episode)

    def test_get_episodes_for_project_404(self):
        self.get("data/projects/unknown/episodes", 404)
