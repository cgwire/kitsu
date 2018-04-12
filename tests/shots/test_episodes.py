from tests.base import ApiDBTestCase


class EpisodeTestCase(ApiDBTestCase):

    def setUp(self):
        super(EpisodeTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_episode("E01")
        self.serialized_episode = self.episode.serialize(obj_type="Episode")
        self.episode_id = str(self.episode.id)

        self.generate_fixture_sequence("SE01")
        self.serialized_sequence = self.sequence.serialize(obj_type="Sequence")

        self.generate_fixture_shot("SE01")
        self.generate_fixture_shot("SE02")
        self.generate_fixture_shot("SE03")

        self.generate_fixture_sequence("SE02")
        self.generate_fixture_sequence("SE03")
        self.generate_fixture_sequence("SE04")

        episode_02 = self.generate_fixture_episode("E02")
        self.generate_fixture_sequence("SE01", episode_id=episode_02.id)
        self.generate_fixture_episode("E03")

    def test_get_sequences_for_episode(self):
        sequences = self.get("data/episodes/%s/sequences" % self.episode_id)
        self.assertEquals(len(sequences), 4)
        self.assertDictEqual(sequences[0], self.serialized_sequence)

    def test_get_episodes(self):
        episodes = self.get("data/episodes")
        self.assertEquals(len(episodes), 3)
        self.assertDictEqual(
            episodes[0],
            self.serialized_episode
        )

    def test_get_episode(self):
        episode = self.get("data/episodes/%s" % self.episode.id)
        self.assertEquals(episode["id"], str(self.episode.id))
        self.assertEquals(episode["name"], self.episode.name)
        self.assertEquals(episode["project_name"], self.project.name)

    def test_get_episode_by_name(self):
        episodes = self.get("data/episodes?name=%s" % self.episode.name.lower())
        self.assertEquals(episodes[0]["id"], str(self.episode.id))

    def test_create_episode(self):
        episode_name = "NE01"
        data = {"name": episode_name}
        episode = self.post("data/projects/%s/episodes" % self.project.id, data)
        episode = self.get("data/episodes/%s" % episode["id"])
        self.assertEquals(episode["name"], episode_name)

    def test_get_episodes_for_project(self):
        episodes = self.get("data/projects/%s/episodes" % self.project.id)
        self.assertEquals(len(episodes), 3)
        self.assertEquals(episodes[0], self.serialized_episode)

    def test_get_episodes_for_project_404(self):
        self.get("data/projects/unknown/episodes", 404)
