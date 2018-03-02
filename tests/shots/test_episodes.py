from tests.base import ApiDBTestCase


class EpisodeTestCase(ApiDBTestCase):

    def setUp(self):
        super(EpisodeTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_episode("E02")
        self.generate_fixture_episode("E03")
        self.generate_fixture_episode("E01")
        self.generate_fixture_sequence("SE01")
        self.generate_fixture_sequence("SE02")
        self.generate_fixture_sequence("SE03")
        self.generate_fixture_sequence("SE04")
        self.generate_fixture_shot("SE01")
        self.generate_fixture_shot("SE02")
        self.generate_fixture_shot("SE03")

    def test_get_episodes(self):
        episodes = self.get("data/episodes")

        self.assertEquals(len(episodes), 3)
        self.assertDictEqual(
            episodes[0],
            self.episode.serialize(obj_type="Episode")
        )

    def test_get_episode(self):
        episode = self.get("data/episodes/%s" % self.episode.id)
        self.assertEquals(episode["id"], str(self.episode.id))
        self.assertEquals(episode["name"], self.episode.name)
        self.assertEquals(episode["project_name"], self.project.name)

    def test_create_episode(self):
        episode_name = "NE01"
        data = {"name": episode_name}
        episode = self.post("data/projects/%s/episodes" % self.project.id, data)
        episode = self.get("data/episodes/%s" % episode["id"])
        self.assertEquals(episode["name"], episode_name)
