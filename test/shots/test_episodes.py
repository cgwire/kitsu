from test.base import ApiDBTestCase
from zou.app.models.entity import Entity


class EpisodeTestCase(ApiDBTestCase):

    def setUp(self):
        super(EpisodeTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_episode()
        self.generate_data(
            Entity,
            3,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.entity_type.id
        )
        self.generate_data(
            Entity,
            2,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.sequence_type.id
        )
        self.generate_data(
            Entity,
            2,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.episode_type.id
        )

    def test_get_episodes(self):
        episodes = self.get("data/episodes")
        self.assertEquals(len(episodes), 3)
        self.assertDictEqual(
            episodes[0],
            self.episode.serialize(obj_type="Episode")
        )

    def test_get_episode(self):
        episode = self.get("data/episodes/%s" % self.episode.id)
        self.assertDictEqual(
            episode,
            self.episode.serialize(obj_type="Episode")
        )

    def test_create_episode(self):
        episode_name = "NE01"
        data = {"name": episode_name}
        episode = self.post("data/projects/%s/episodes" % self.project.id, data)
        episode = self.get("data/episodes/%s" % episode["id"])
        self.assertEquals(episode["name"], episode_name)
