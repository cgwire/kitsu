from test.base import ApiDBTestCase
from zou.app.models.entity import Entity


class EpisodeTestCase(ApiDBTestCase):

    def setUp(self):
        super(EpisodeTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_data(Entity, 3,
                           entities_out=[],
                           project_id=self.project.id,
                           entity_type_id=self.entity_type.id)
        self.generate_data(Entity, 2,
                           entities_out=[],
                           project_id=self.project.id,
                           entity_type_id=self.sequence_type.id)
        self.generate_data(Entity, 2,
                           entities_out=[],
                           project_id=self.project.id,
                           entity_type_id=self.episode_type.id)

    def test_get_episodes(self):
        episodes = self.get("data/episodes")
        self.assertEquals(len(episodes), 2)
