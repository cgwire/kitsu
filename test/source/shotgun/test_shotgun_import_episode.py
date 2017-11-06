from test.source.shotgun.base import ShotgunTestCase

from zou.app.models.project import Project


class ImportShotgunEpisode(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunEpisode, self).setUp()
        self.generate_fixture_entity_type()

    def test_import_episodes(self):
        self.load_fixture('projects')
        self.episodes = self.load_fixture('episodes')
        self.assertEqual(len(self.episodes), 3)

        self.episodes = self.get("data/episodes")
        self.assertEqual(len(self.episodes), 3)

    def test_import_episodes_twice(self):
        self.load_fixture('projects')
        self.episodes = self.load_fixture('episodes')
        self.episodes = self.load_fixture('episodes')
        self.assertEqual(len(self.episodes), 3)

        self.episodes = self.get("data/episodes")
        self.assertEqual(len(self.episodes), 3)

    def test_import_episode(self):
        self.load_fixture('projects')
        sg_episode = {
            "project": {
                "type": "Project",
                "id": 4,
                "name": "Agent327"
            },
            "code": "E04",
            "type": "Episode",
            "id": 4,
            "description": "test description"
        }
        api_path = "/import/shotgun/episodes"
        self.episodes = self.post(api_path, [sg_episode], 200)
        self.assertEqual(len(self.episodes), 1)

        self.episodes = self.get("data/episodes")
        self.assertEqual(len(self.episodes), 1)

        episode = self.episodes[0]
        project = Project.get_by(name="Agent327")
        self.assertEqual(episode["name"], sg_episode["code"])
        self.assertEqual(episode["description"], sg_episode["description"])
        self.assertEqual(episode["shotgun_id"], sg_episode["id"])
        self.assertEqual(episode["project_id"], str(project.id))

    def test_remove_episodes(self):
        self.load_fixture('projects')
        self.load_fixture('episodes')

        self.episodes = self.get("data/episodes")
        self.assertEqual(len(self.episodes), 3)
        episode = self.episodes[0]

        api_path = "/import/shotgun/remove/episode"
        self.episodes = self.post(api_path, {"id": episode["shotgun_id"]}, 200)

        self.episodes = self.get("data/episodes")
        self.assertEqual(len(self.episodes), 2)

        self.get("data/episodes/%s" % episode["id"], 404)
