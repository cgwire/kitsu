from test.base import ApiDBTestCase

from zou.app.models.entity import Entity


class ProjectEpisodesTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectEpisodesTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_episode()
        self.generate_data(Entity, 3,
                           entities_out=[],
                           project_id=self.project.id,
                           entity_type_id=self.episode_type.id)
        self.generate_data(Entity, 2,
                           entities_out=[],
                           project_id=self.project_standard.id,
                           entity_type_id=self.episode_type.id)

    def test_get_episodes_for_project(self):
        episodes = self.get("data/projects/%s/episodes" % self.project.id)
        self.assertEquals(len(episodes), 4)
        self.assertDictEqual(
            episodes[0],
            self.episode.serialize(obj_type="Episode")
        )

    def test_get_episodes_for_project_404(self):
        self.get("data/projects/unknown/episodes", 404)
